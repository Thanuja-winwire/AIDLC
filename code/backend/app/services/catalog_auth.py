from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.errors import DomainError
from app.core.security import create_access_token, hash_password, verify_password
from app.models import Cart, Category, Product, User


# ---------------- Auth ----------------
def register(db: Session, email: str, password: str, name: str) -> User:
    email = email.strip().lower()
    if db.scalar(select(User).where(func.lower(User.email) == email)):
        raise DomainError(409, "Email already registered")
    user = User(email=email, password_hash=hash_password(password), name=name.strip(), role="customer")
    db.add(user)
    db.flush()
    db.add(Cart(user_id=user.id))
    db.commit()
    return user


def login(db: Session, email: str, password: str) -> tuple[str, User]:
    user = db.scalar(select(User).where(func.lower(User.email) == email.strip().lower()))
    if not user or not verify_password(password, user.password_hash) or not user.is_active:
        raise DomainError(401, "Invalid credentials")
    return create_access_token(user.id, user.role), user


def update_profile(db: Session, user: User, name, current_password, new_password) -> User:
    if name:
        user.name = name.strip()
    if new_password:
        if not current_password or not verify_password(current_password, user.password_hash):
            raise DomainError(400, "Current password is incorrect")
        user.password_hash = hash_password(new_password)
    db.commit()
    return user


# ---------------- Catalog ----------------
def list_products(db, q, category_id, min_price, max_price, in_stock, sort, page, page_size, include_inactive=False):
    if min_price is not None and max_price is not None and min_price > max_price:
        raise DomainError(422, "min_price cannot exceed max_price")
    stmt = select(Product)
    if not include_inactive:
        stmt = stmt.where(Product.is_active.is_(True))
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(Product.name.ilike(like), Product.description.ilike(like)))
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)
    if in_stock:
        stmt = stmt.where(Product.stock > 0)
    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery()))
    order = {
        "price_asc": (Product.price.asc(), Product.id.asc()),
        "price_desc": (Product.price.desc(), Product.id.asc()),
    }.get(sort, (Product.id.desc(),))
    items = db.scalars(stmt.order_by(*order).offset((page - 1) * page_size).limit(page_size)).unique().all()
    return items, total


def get_product(db: Session, product_id: int, include_inactive=False) -> Product:
    p = db.get(Product, product_id)
    if not p or (not p.is_active and not include_inactive):
        raise DomainError(404, "Product not found")
    return p


def list_categories(db: Session):
    return db.scalars(select(Category).order_by(Category.name)).all()

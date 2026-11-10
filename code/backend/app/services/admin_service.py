from decimal import Decimal

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.errors import DomainError
from app.models import Category, Order, Product, User

REVENUE_STATUSES = ("paid", "processing", "shipped", "delivered")
LOW_STOCK = 5


def metrics(db: Session) -> dict:
    total_orders = db.scalar(select(func.count(Order.id))) or 0
    revenue = db.scalar(select(func.coalesce(func.sum(Order.total), 0)).where(Order.status.in_(REVENUE_STATUSES)))
    users = db.scalar(select(func.count(User.id))) or 0
    low = db.scalar(
        select(func.count(Product.id)).where(Product.is_active.is_(True), Product.stock <= LOW_STOCK)
    ) or 0
    recent = db.scalars(select(Order).order_by(Order.created_at.desc(), Order.id.desc()).limit(5)).unique().all()
    return {
        "total_orders": total_orders,
        "revenue": Decimal(revenue).quantize(Decimal("0.01")),
        "user_count": users,
        "low_stock_count": low,
        "recent_orders": recent,
    }


def _check_category(db: Session, category_id: int):
    if not db.get(Category, category_id):
        raise DomainError(422, "Category does not exist")


def create_product(db: Session, data: dict) -> Product:
    _check_category(db, data["category_id"])
    p = Product(**data)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


def update_product(db: Session, product_id: int, data: dict) -> Product:
    p = db.get(Product, product_id)
    if not p:
        raise DomainError(404, "Product not found")
    _check_category(db, data["category_id"])
    for k, v in data.items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


def delete_product(db: Session, product_id: int) -> None:
    p = db.get(Product, product_id)
    if not p:
        raise DomainError(404, "Product not found")
    p.is_active = False  # soft delete (BR-M2)
    db.commit()


def list_users(db: Session, q: str | None, page: int, page_size: int):
    base = select(User)
    if q:
        like = f"%{q.strip()}%"
        base = base.where(or_(User.email.ilike(like), User.name.ilike(like)))
    total = db.scalar(select(func.count()).select_from(base.subquery()))
    items = db.scalars(base.order_by(User.id).offset((page - 1) * page_size).limit(page_size)).all()
    return items, total


def update_user(db: Session, user_id: int, is_active, role) -> User:
    # BR-M6: no self-protection rules by design.
    u = db.get(User, user_id)
    if not u:
        raise DomainError(404, "User not found")
    if is_active is not None:
        u.is_active = is_active
    if role is not None:
        u.role = role
    db.commit()
    return u

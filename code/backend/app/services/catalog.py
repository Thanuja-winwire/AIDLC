from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.models.catalog import Category, Product
from app.repositories import catalog as repo
from app.schemas.catalog import CategoryIn, ProductCreate, ProductOut, ProductUpdate


def to_out(db: Session, products: list[Product]) -> list[ProductOut]:
    totals = repo.total_stock_by_product(db, [p.id for p in products])
    out = []
    for p in products:
        item = ProductOut.model_validate(p)
        item.category_name = p.category.name if p.category else None
        item.total_stock = totals.get(p.id, 0)
        out.append(item)
    return out


def get_or_404(db: Session, product_id: int) -> Product:
    product = repo.get_product(db, product_id)
    if product is None:
        raise NotFoundError("Product not found")
    return product


def require_active_product(db: Session, product_id: int) -> Product:
    product = get_or_404(db, product_id)
    if not product.is_active:
        raise ConflictError(f"Product {product.sku} is inactive")
    return product


def _check_category(db: Session, category_id: int | None) -> None:
    if category_id is not None and repo.get_category(db, category_id) is None:
        raise NotFoundError("Category not found")


def create_product(db: Session, data: ProductCreate) -> Product:
    sku = data.sku.strip()
    if repo.get_product_by_sku(db, sku):
        raise ConflictError("A product with this SKU already exists")
    _check_category(db, data.category_id)
    values = data.model_dump()
    values["sku"] = sku
    values["name"] = values["name"].strip()
    product = Product(**values)
    db.add(product)
    db.flush()
    return product


def update_product(db: Session, product_id: int, data: ProductUpdate) -> Product:
    product = get_or_404(db, product_id)
    changes = data.model_dump(exclude_unset=True)
    if "category_id" in changes:
        _check_category(db, changes["category_id"])
    for key, value in changes.items():
        if value is None and key not in ("description", "category_id"):
            continue
        setattr(product, key, value.strip() if key == "name" and isinstance(value, str) else value)
    db.flush()
    return product


def create_category(db: Session, data: CategoryIn) -> Category:
    if repo.get_category_by_name(db, data.name):
        raise ConflictError("A category with this name already exists")
    category = Category(name=data.name.strip(), description=data.description)
    db.add(category)
    db.flush()
    return category


def update_category(db: Session, category_id: int, data: CategoryIn) -> Category:
    category = repo.get_category(db, category_id)
    if category is None:
        raise NotFoundError("Category not found")
    existing = repo.get_category_by_name(db, data.name)
    if existing and existing.id != category.id:
        raise ConflictError("A category with this name already exists")
    category.name = data.name.strip()
    category.description = data.description
    db.flush()
    return category


def delete_category(db: Session, category_id: int) -> None:
    category = repo.get_category(db, category_id)
    if category is None:
        raise NotFoundError("Category not found")
    in_use = db.scalar(select(func.count()).select_from(Product).where(Product.category_id == category_id))
    if in_use:
        raise ConflictError("Category is used by products and cannot be deleted")
    db.delete(category)
    db.flush()

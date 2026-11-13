from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.catalog import Category, Product
from app.models.inventory import StockLevel


def get_product(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def get_product_by_sku(db: Session, sku: str) -> Product | None:
    return db.scalar(select(Product).where(func.lower(Product.sku) == sku.strip().lower()))


def search_products(q: str | None, category_id: int | None, active: bool | None):
    stmt = select(Product).order_by(Product.name, Product.id)
    if q:
        like = f"%{q.strip().lower()}%"
        stmt = stmt.where(or_(func.lower(Product.name).like(like), func.lower(Product.sku).like(like)))
    if category_id is not None:
        stmt = stmt.where(Product.category_id == category_id)
    if active is not None:
        stmt = stmt.where(Product.is_active.is_(active))
    return stmt


def total_stock_by_product(db: Session, product_ids: list[int]) -> dict[int, int]:
    if not product_ids:
        return {}
    rows = db.execute(
        select(StockLevel.product_id, func.coalesce(func.sum(StockLevel.quantity), 0))
        .where(StockLevel.product_id.in_(product_ids))
        .group_by(StockLevel.product_id)
    ).all()
    return {pid: int(total) for pid, total in rows}


def list_categories(db: Session) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.name)))


def get_category(db: Session, category_id: int) -> Category | None:
    return db.get(Category, category_id)


def get_category_by_name(db: Session, name: str) -> Category | None:
    return db.scalar(select(Category).where(func.lower(Category.name) == name.strip().lower()))

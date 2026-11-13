from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.catalog import Product
from app.models.inventory import Location, StockLevel, StockMovement


def list_locations(db: Session, active: bool | None = None) -> list[Location]:
    stmt = select(Location).order_by(Location.code)
    if active is not None:
        stmt = stmt.where(Location.is_active.is_(active))
    return list(db.scalars(stmt))


def get_location(db: Session, location_id: int) -> Location | None:
    return db.get(Location, location_id)


def get_location_by_code(db: Session, code: str) -> Location | None:
    return db.scalar(select(Location).where(func.lower(Location.code) == code.strip().lower()))


def stock_query(product_id: int | None, location_id: int | None, q: str | None = None):
    stmt = (
        select(StockLevel)
        .join(Product, Product.id == StockLevel.product_id)
        .join(Location, Location.id == StockLevel.location_id)
        .order_by(Product.name, Location.code)
    )
    if product_id is not None:
        stmt = stmt.where(StockLevel.product_id == product_id)
    if location_id is not None:
        stmt = stmt.where(StockLevel.location_id == location_id)
    if q:
        like = f"%{q.strip().lower()}%"
        stmt = stmt.where(func.lower(Product.name).like(like) | func.lower(Product.sku).like(like))
    return stmt


def movement_query(product_id: int | None, location_id: int | None, movement_type=None):
    stmt = select(StockMovement).order_by(StockMovement.created_at.desc(), StockMovement.id.desc())
    if product_id is not None:
        stmt = stmt.where(StockMovement.product_id == product_id)
    if location_id is not None:
        stmt = stmt.where(StockMovement.location_id == location_id)
    if movement_type is not None:
        stmt = stmt.where(StockMovement.type == movement_type)
    return stmt

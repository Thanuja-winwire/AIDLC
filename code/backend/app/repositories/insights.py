from datetime import datetime
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.catalog import Category, Product
from app.models.inventory import Location, StockLevel
from app.models.purchasing import POStatus, PurchaseOrder
from app.models.sales import Sale, SaleLine


def low_stock_total(db: Session):
    """Products (active) whose total stock across locations <= reorder level."""
    total = func.coalesce(func.sum(StockLevel.quantity), 0)
    stmt = (
        select(Product.id, Product.sku, Product.name, total.label("qty"), Product.reorder_level)
        .outerjoin(StockLevel, StockLevel.product_id == Product.id)
        .where(Product.is_active.is_(True))
        .group_by(Product.id)
        .having(total <= Product.reorder_level)
        .order_by(Product.name)
    )
    return db.execute(stmt).all()


def low_stock_by_location(db: Session, location_id: int | None):
    stmt = (
        select(
            Product.id, Product.sku, Product.name, Location.id, Location.name,
            StockLevel.quantity, Product.reorder_level,
        )
        .join(StockLevel, StockLevel.product_id == Product.id)
        .join(Location, Location.id == StockLevel.location_id)
        .where(Product.is_active.is_(True), Location.is_active.is_(True), StockLevel.quantity <= Product.reorder_level)
        .order_by(Product.name, Location.code)
    )
    if location_id is not None:
        stmt = stmt.where(Location.id == location_id)
    return db.execute(stmt).all()


def totals(db: Session) -> tuple[int, int, Decimal]:
    products = db.scalar(select(func.count()).select_from(Product).where(Product.is_active.is_(True))) or 0
    units = db.scalar(select(func.coalesce(func.sum(StockLevel.quantity), 0))) or 0
    value = db.scalar(
        select(func.coalesce(func.sum(StockLevel.quantity * Product.unit_cost), 0)).join(
            Product, Product.id == StockLevel.product_id
        )
    ) or 0
    return int(products), int(units), Decimal(value)


def open_po_count(db: Session) -> int:
    return db.scalar(
        select(func.count()).select_from(PurchaseOrder).where(
            PurchaseOrder.status.in_([POStatus.DRAFT, POStatus.APPROVED, POStatus.PARTIALLY_RECEIVED])
        )
    ) or 0


def sales_sum(db: Session, since: datetime) -> Decimal:
    return Decimal(
        db.scalar(select(func.coalesce(func.sum(Sale.total_amount), 0)).where(Sale.sold_at >= since)) or 0
    )


def sales_lines(db: Session, date_from: datetime | None, date_to: datetime | None, location_id: int | None):
    """Rows of (sold_at, sale_id, product_id, sku, name, category_name, qty, line_total, cost_total)."""
    stmt = (
        select(
            Sale.sold_at, Sale.id, Product.id, Product.sku, Product.name,
            func.coalesce(Category.name, "Uncategorised"),
            SaleLine.quantity, SaleLine.line_total, SaleLine.quantity * SaleLine.unit_cost_snapshot,
        )
        .join(SaleLine, SaleLine.sale_id == Sale.id)
        .join(Product, Product.id == SaleLine.product_id)
        .outerjoin(Category, Category.id == Product.category_id)
    )
    if date_from is not None:
        stmt = stmt.where(Sale.sold_at >= date_from)
    if date_to is not None:
        stmt = stmt.where(Sale.sold_at < date_to)
    if location_id is not None:
        stmt = stmt.where(Sale.location_id == location_id)
    return db.execute(stmt).all()

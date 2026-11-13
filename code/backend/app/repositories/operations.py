from sqlalchemy import select

from app.models.operations import StockAdjustment, StockTransfer


def transfer_query(product_id: int | None, location_id: int | None):
    stmt = select(StockTransfer).order_by(StockTransfer.id.desc())
    if product_id is not None:
        stmt = stmt.where(StockTransfer.product_id == product_id)
    if location_id is not None:
        stmt = stmt.where(
            (StockTransfer.from_location_id == location_id) | (StockTransfer.to_location_id == location_id)
        )
    return stmt


def adjustment_query(product_id: int | None, location_id: int | None):
    stmt = select(StockAdjustment).order_by(StockAdjustment.id.desc())
    if product_id is not None:
        stmt = stmt.where(StockAdjustment.product_id == product_id)
    if location_id is not None:
        stmt = stmt.where(StockAdjustment.location_id == location_id)
    return stmt

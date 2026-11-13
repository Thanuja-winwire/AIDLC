from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.sales import Sale


def get_sale(db: Session, sale_id: int) -> Sale | None:
    return db.get(Sale, sale_id)


def sale_query(location_id: int | None, date_from: datetime | None, date_to: datetime | None):
    stmt = select(Sale).order_by(Sale.sold_at.desc(), Sale.id.desc())
    if location_id is not None:
        stmt = stmt.where(Sale.location_id == location_id)
    if date_from is not None:
        stmt = stmt.where(Sale.sold_at >= date_from)
    if date_to is not None:
        stmt = stmt.where(Sale.sold_at < date_to)
    return stmt

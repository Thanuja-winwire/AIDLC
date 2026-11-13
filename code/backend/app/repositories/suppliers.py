from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.supplier import Supplier


def get_supplier(db: Session, supplier_id: int) -> Supplier | None:
    return db.get(Supplier, supplier_id)


def search_suppliers(q: str | None, active: bool | None):
    stmt = select(Supplier).order_by(Supplier.name, Supplier.id)
    if q:
        stmt = stmt.where(func.lower(Supplier.name).like(f"%{q.strip().lower()}%"))
    if active is not None:
        stmt = stmt.where(Supplier.is_active.is_(active))
    return stmt

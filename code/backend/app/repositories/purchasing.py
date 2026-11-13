from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.purchasing import POStatus, PurchaseOrder


def get_po(db: Session, po_id: int, for_update: bool = False) -> PurchaseOrder | None:
    stmt = select(PurchaseOrder).where(PurchaseOrder.id == po_id)
    if for_update:
        stmt = stmt.with_for_update()
    return db.scalar(stmt)


def search_pos(status: POStatus | None, supplier_id: int | None):
    stmt = select(PurchaseOrder).order_by(PurchaseOrder.id.desc())
    if status is not None:
        stmt = stmt.where(PurchaseOrder.status == status)
    if supplier_id is not None:
        stmt = stmt.where(PurchaseOrder.supplier_id == supplier_id)
    return stmt

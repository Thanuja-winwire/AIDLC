"""Sequential document numbers (PO-, SO-, TR-) from PostgreSQL sequences.

Falls back to max(id)+1 on other dialects (SQLite in tests).
"""
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.models.operations import StockTransfer
from app.models.purchasing import PurchaseOrder
from app.models.sales import Sale

_KINDS = {
    "PO": ("po_number_seq", PurchaseOrder),
    "SO": ("so_number_seq", Sale),
    "TR": ("tr_number_seq", StockTransfer),
}


def next_number(db: Session, kind: str) -> str:
    seq, model = _KINDS[kind]
    if db.get_bind().dialect.name == "postgresql":
        n = db.execute(text(f"SELECT nextval('{seq}')")).scalar_one()
    else:
        n = (db.scalar(select(func.max(model.id))) or 0) + 1
    return f"{kind}-{int(n):06d}"

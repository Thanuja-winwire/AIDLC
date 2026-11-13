from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.models.supplier import Supplier
from app.repositories import suppliers as repo
from app.schemas.supplier import SupplierIn, SupplierUpdate


def get_or_404(db: Session, supplier_id: int) -> Supplier:
    supplier = repo.get_supplier(db, supplier_id)
    if supplier is None:
        raise NotFoundError("Supplier not found")
    return supplier


def create_supplier(db: Session, data: SupplierIn) -> Supplier:
    supplier = Supplier(**data.model_dump(), is_active=True)
    supplier.name = supplier.name.strip()
    db.add(supplier)
    db.flush()
    return supplier


def update_supplier(db: Session, supplier_id: int, data: SupplierUpdate) -> Supplier:
    supplier = get_or_404(db, supplier_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        if value is None and key in ("name", "is_active"):
            continue
        setattr(supplier, key, value)
    db.flush()
    return supplier


def require_active_supplier(db: Session, supplier_id: int) -> Supplier:
    supplier = get_or_404(db, supplier_id)
    if not supplier.is_active:
        raise ConflictError("Supplier is inactive")
    return supplier

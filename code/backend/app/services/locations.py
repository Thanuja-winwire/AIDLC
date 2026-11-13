from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.models.inventory import Location, StockLevel
from app.models.purchasing import POStatus, PurchaseOrder
from app.repositories import inventory as repo
from app.schemas.inventory import LocationIn, LocationUpdate, MovementOut, StockLevelOut

OPEN_PO = (POStatus.DRAFT, POStatus.APPROVED, POStatus.PARTIALLY_RECEIVED)


def get_or_404(db: Session, location_id: int) -> Location:
    location = repo.get_location(db, location_id)
    if location is None:
        raise NotFoundError("Location not found")
    return location


def require_active_location(db: Session, location_id: int) -> Location:
    location = get_or_404(db, location_id)
    if not location.is_active:
        raise ConflictError(f"Location {location.code} is inactive")
    return location


def create_location(db: Session, data: LocationIn) -> Location:
    code = data.code.strip().upper()
    if repo.get_location_by_code(db, code):
        raise ConflictError("A location with this code already exists")
    location = Location(code=code, name=data.name.strip(), address=data.address, is_active=True)
    db.add(location)
    db.flush()
    return location


def update_location(db: Session, location_id: int, data: LocationUpdate) -> Location:
    location = get_or_404(db, location_id)
    if data.is_active is False and location.is_active:
        stocked = db.scalar(
            select(func.count()).select_from(StockLevel).where(
                StockLevel.location_id == location.id, StockLevel.quantity > 0
            )
        )
        open_pos = db.scalar(
            select(func.count()).select_from(PurchaseOrder).where(
                PurchaseOrder.destination_location_id == location.id, PurchaseOrder.status.in_(OPEN_PO)
            )
        )
        if stocked:
            raise ConflictError("Location still holds stock and cannot be deactivated")
        if open_pos:
            raise ConflictError("Location has open purchase orders and cannot be deactivated")
    if data.name is not None:
        location.name = data.name.strip()
    if "address" in data.model_fields_set:
        location.address = data.address
    if data.is_active is not None:
        location.is_active = data.is_active
    db.flush()
    return location


def stock_rows(levels: list[StockLevel]) -> list[StockLevelOut]:
    return [
        StockLevelOut(
            product_id=s.product_id, product_sku=s.product.sku, product_name=s.product.name,
            location_id=s.location_id, location_code=s.location.code, location_name=s.location.name,
            quantity=s.quantity, reorder_level=s.product.reorder_level,
        )
        for s in levels
    ]


def movement_rows(movements) -> list[MovementOut]:
    return [
        MovementOut(
            id=m.id, product_id=m.product_id, product_sku=m.product.sku, product_name=m.product.name,
            location_id=m.location_id, location_code=m.location.code, type=m.type,
            quantity_delta=m.quantity_delta, quantity_after=m.quantity_after,
            reference_type=m.reference_type, reference_id=m.reference_id, note=m.note,
            user_id=m.user_id, created_at=m.created_at,
        )
        for m in movements
    ]

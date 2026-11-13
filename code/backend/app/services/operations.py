from sqlalchemy.orm import Session

from app.core.errors import ValidationFailed
from app.models.inventory import MovementType
from app.models.operations import AdjustmentMode, AdjustmentReason, StockAdjustment, StockTransfer
from app.models.user import User
from app.schemas.operations import AdjustmentCreate, AdjustmentOut, TransferCreate, TransferOut
from app.services import catalog as catalog_svc
from app.services import locations as locations_svc
from app.services.numbering import next_number
from app.services.stock_ledger import StockLedger


def transfer_out(t: StockTransfer) -> TransferOut:
    return TransferOut(
        id=t.id, number=t.number, product_id=t.product_id, product_sku=t.product.sku,
        product_name=t.product.name, from_location_id=t.from_location_id,
        from_location_name=t.from_location.name, to_location_id=t.to_location_id,
        to_location_name=t.to_location.name, quantity=t.quantity, note=t.note,
        created_by=t.created_by, created_at=t.created_at,
    )


def adjustment_out(a: StockAdjustment) -> AdjustmentOut:
    return AdjustmentOut(
        id=a.id, product_id=a.product_id, product_sku=a.product.sku, product_name=a.product.name,
        location_id=a.location_id, location_name=a.location.name, mode=a.mode, delta=a.delta,
        counted_quantity=a.counted_quantity, reason=a.reason, note=a.note,
        created_by=a.created_by, created_at=a.created_at,
    )


def create_transfer(db: Session, user: User, data: TransferCreate) -> StockTransfer:
    product = catalog_svc.require_active_product(db, data.product_id)
    locations_svc.require_active_location(db, data.from_location_id)
    locations_svc.require_active_location(db, data.to_location_id)
    transfer = StockTransfer(
        number=next_number(db, "TR"), product_id=product.id, from_location_id=data.from_location_id,
        to_location_id=data.to_location_id, quantity=data.quantity, note=data.note, created_by=user.id,
    )
    db.add(transfer)
    db.flush()
    ledger = StockLedger(db, user.id)
    # BR-T4: touch locations in ascending id order so concurrent transfers cannot deadlock.
    steps = [
        (data.from_location_id, -data.quantity, MovementType.TRANSFER_OUT),
        (data.to_location_id, data.quantity, MovementType.TRANSFER_IN),
    ]
    for location_id, delta, mtype in sorted(steps, key=lambda s: s[0]):
        ledger.apply(
            product_id=product.id, location_id=location_id, delta=delta, movement_type=mtype,
            reference_type="TRANSFER", reference_id=transfer.id, note=data.note or transfer.number,
        )
    return transfer


def create_adjustment(db: Session, user: User, data: AdjustmentCreate) -> StockAdjustment:
    if data.reason == AdjustmentReason.OTHER and not (data.note and data.note.strip()):
        raise ValidationFailed("A note is required when the reason is OTHER")
    product = catalog_svc.require_active_product(db, data.product_id)
    locations_svc.require_active_location(db, data.location_id)
    ledger = StockLedger(db, user.id)
    if data.mode == AdjustmentMode.COUNT:
        current = ledger.current_quantity(product.id, data.location_id, lock=True)
        delta = data.counted_quantity - current
        if delta == 0:
            raise ValidationFailed("Counted quantity equals current stock: no change")
    else:
        delta = data.delta
    adjustment = StockAdjustment(
        product_id=product.id, location_id=data.location_id, mode=data.mode, delta=delta,
        counted_quantity=data.counted_quantity if data.mode == AdjustmentMode.COUNT else None,
        reason=data.reason, note=data.note, created_by=user.id,
    )
    db.add(adjustment)
    db.flush()
    ledger.apply(
        product_id=product.id, location_id=data.location_id, delta=delta,
        movement_type=MovementType.ADJUSTMENT, reference_type="ADJUSTMENT", reference_id=adjustment.id,
        note=f"{data.reason.value}: {data.note}" if data.note else data.reason.value,
    )
    return adjustment

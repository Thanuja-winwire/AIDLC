from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError, ValidationFailed
from app.models.inventory import MovementType
from app.models.purchasing import (
    POStatus, PurchaseOrder, PurchaseOrderLine, PurchaseReceipt, ReceiptLine,
)
from app.models.user import User
from app.repositories import purchasing as repo
from app.schemas.purchasing import POCreate, POLineIn, POLineOut, POOut, POUpdate, ReceiveRequest
from app.services import catalog as catalog_svc
from app.services import locations as locations_svc
from app.services import suppliers as suppliers_svc
from app.services.numbering import next_number
from app.services.stock_ledger import StockLedger

_TRANSITIONS = {
    POStatus.DRAFT: {POStatus.APPROVED, POStatus.CANCELLED},
    POStatus.APPROVED: {POStatus.PARTIALLY_RECEIVED, POStatus.RECEIVED, POStatus.CANCELLED},
    POStatus.PARTIALLY_RECEIVED: {POStatus.PARTIALLY_RECEIVED, POStatus.RECEIVED, POStatus.CANCELLED},
    POStatus.RECEIVED: set(),
    POStatus.CANCELLED: set(),
}


def to_out(po: PurchaseOrder) -> POOut:
    return POOut(
        id=po.id, number=po.number, supplier_id=po.supplier_id, supplier_name=po.supplier.name,
        destination_location_id=po.destination_location_id,
        destination_location_name=po.destination_location.name, status=po.status, notes=po.notes,
        total_amount=po.total_amount, created_by=po.created_by, approved_by=po.approved_by,
        approved_at=po.approved_at, cancelled_at=po.cancelled_at, created_at=po.created_at,
        lines=[
            POLineOut(
                id=l.id, product_id=l.product_id, product_sku=l.product.sku, product_name=l.product.name,
                quantity_ordered=l.quantity_ordered, quantity_received=l.quantity_received, unit_cost=l.unit_cost,
            )
            for l in po.lines
        ],
    )


def get_or_404(db: Session, po_id: int, for_update: bool = False) -> PurchaseOrder:
    po = repo.get_po(db, po_id, for_update=for_update)
    if po is None:
        raise NotFoundError("Purchase order not found")
    return po


def _transition(po: PurchaseOrder, target: POStatus) -> None:
    if target not in _TRANSITIONS[po.status]:
        raise ConflictError(f"Cannot move a purchase order from {po.status.value} to {target.value}")
    po.status = target


def _build_lines(db: Session, lines: list[POLineIn]) -> list[PurchaseOrderLine]:
    seen: set[int] = set()
    built = []
    for line in lines:
        if line.product_id in seen:
            raise ValidationFailed("Duplicate product in purchase order lines")
        seen.add(line.product_id)
        product = catalog_svc.require_active_product(db, line.product_id)
        cost = line.unit_cost if line.unit_cost is not None else product.unit_cost
        built.append(
            PurchaseOrderLine(
                product_id=product.id, quantity_ordered=line.quantity_ordered, quantity_received=0,
                unit_cost=Decimal(cost),
            )
        )
    return built


def create_po(db: Session, user: User, data: POCreate) -> PurchaseOrder:
    suppliers_svc.require_active_supplier(db, data.supplier_id)
    locations_svc.require_active_location(db, data.destination_location_id)
    po = PurchaseOrder(
        number=next_number(db, "PO"), supplier_id=data.supplier_id,
        destination_location_id=data.destination_location_id, status=POStatus.DRAFT,
        notes=data.notes, created_by=user.id,
    )
    po.lines = _build_lines(db, data.lines)
    db.add(po)
    db.flush()
    return po


def update_po(db: Session, po_id: int, data: POUpdate) -> PurchaseOrder:
    po = get_or_404(db, po_id, for_update=True)
    if po.status != POStatus.DRAFT:
        raise ConflictError("Only draft purchase orders can be edited")
    if data.supplier_id is not None:
        suppliers_svc.require_active_supplier(db, data.supplier_id)
        po.supplier_id = data.supplier_id
    if data.destination_location_id is not None:
        locations_svc.require_active_location(db, data.destination_location_id)
        po.destination_location_id = data.destination_location_id
    if "notes" in data.model_fields_set:
        po.notes = data.notes
    if data.lines is not None:
        new_lines = _build_lines(db, data.lines)
        po.lines.clear()
        db.flush()
        po.lines.extend(new_lines)
    db.flush()
    db.refresh(po)
    return po


def approve_po(db: Session, user: User, po_id: int) -> PurchaseOrder:
    po = get_or_404(db, po_id, for_update=True)
    _transition(po, POStatus.APPROVED)
    po.approved_by = user.id
    po.approved_at = datetime.now(timezone.utc)
    db.flush()
    return po


def cancel_po(db: Session, po_id: int) -> PurchaseOrder:
    po = get_or_404(db, po_id, for_update=True)
    _transition(po, POStatus.CANCELLED)  # BR-PO7: received stock is kept
    po.cancelled_at = datetime.now(timezone.utc)
    db.flush()
    return po


def receive_po(db: Session, user: User, po_id: int, data: ReceiveRequest) -> PurchaseOrder:
    po = get_or_404(db, po_id, for_update=True)
    if po.status not in (POStatus.APPROVED, POStatus.PARTIALLY_RECEIVED):
        raise ConflictError("Only approved or partially received purchase orders can be received")
    by_id = {l.id: l for l in po.lines}
    seen: set[int] = set()
    for item in data.lines:
        if item.po_line_id in seen:
            raise ValidationFailed("Duplicate line in receipt")
        seen.add(item.po_line_id)
        line = by_id.get(item.po_line_id)
        if line is None:
            raise ValidationFailed(f"Line {item.po_line_id} does not belong to this purchase order")
        remaining = line.quantity_ordered - line.quantity_received
        if item.quantity > remaining:
            raise ConflictError(
                f"Over-receipt for {line.product.sku}: remaining {remaining}, received {item.quantity}"
            )
    receipt = PurchaseReceipt(
        purchase_order_id=po.id, received_by=user.id, received_at=datetime.now(timezone.utc), note=data.note
    )
    db.add(receipt)
    db.flush()
    ledger = StockLedger(db, user.id)
    for item in data.lines:
        line = by_id[item.po_line_id]
        line.quantity_received += item.quantity
        db.add(ReceiptLine(receipt_id=receipt.id, po_line_id=line.id, quantity=item.quantity))
        ledger.apply(
            product_id=line.product_id, location_id=po.destination_location_id, delta=item.quantity,
            movement_type=MovementType.PO_RECEIPT, reference_type="PO", reference_id=po.id,
            note=f"Receipt for {po.number}",
        )
    fully = all(l.quantity_received >= l.quantity_ordered for l in po.lines)
    _transition(po, POStatus.RECEIVED if fully else POStatus.PARTIALLY_RECEIVED)
    db.flush()
    return po

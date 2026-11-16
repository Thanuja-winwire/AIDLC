"""Invoices, payments and the stored payment method."""
from datetime import datetime
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.errors import bad_request, not_found
from app.gateway import SimulatedGateway
from app.models import Invoice, InvoiceLine, Payment, PaymentMethod, Subscription, User, utcnow
from app.schemas import CardIn, InvoiceOut, Page, PaymentOut


# ---- payment method ----
def get_payment_method(db: Session, user_id: int) -> PaymentMethod | None:
    return db.scalar(select(PaymentMethod).where(PaymentMethod.user_id == user_id))


def set_payment_method(db: Session, user: User, card: CardIn, gateway: SimulatedGateway) -> PaymentMethod:
    """Validate and tokenize the card; stores only brand, last4 and the token. Does not commit."""
    tok = gateway.tokenize(card.number, card.expiry, card.cvc)
    pm = get_payment_method(db, user.id)
    if pm is None:
        pm = PaymentMethod(user_id=user.id, brand=tok.brand, last4=tok.last4, gateway_token=tok.token)
        db.add(pm)
    else:
        pm.brand, pm.last4, pm.gateway_token = tok.brand, tok.last4, tok.token
    db.flush()
    return pm


def resolve_payment_method(
    db: Session, user: User, card: CardIn | None, gateway: SimulatedGateway
) -> PaymentMethod:
    if card is not None:
        return set_payment_method(db, user, card, gateway)
    pm = get_payment_method(db, user.id)
    if pm is None:
        raise bad_request("A payment method is required", "payment_method_required")
    return pm


# ---- invoices and charging ----
def create_invoice(
    db: Session,
    sub: Subscription,
    inv_type: str,
    lines: list[tuple[str, Decimal]],
    period_start: datetime,
    period_end: datetime,
    now: datetime,
) -> Invoice:
    amount = sum((a for _, a in lines), Decimal("0.00"))
    inv = Invoice(
        user_id=sub.user_id,
        subscription_id=sub.id,
        type=inv_type,
        status="pending",
        amount=amount,
        period_start=period_start,
        period_end=period_end,
        issued_at=now,
    )
    inv.lines = [InvoiceLine(description=d, amount=a) for d, a in lines]
    db.add(inv)
    db.flush()
    inv.number = f"INV-{inv.id:06d}"
    return inv


def charge_invoice(
    db: Session,
    inv: Invoice,
    pm: PaymentMethod | None,
    gateway: SimulatedGateway,
    now: datetime,
) -> Payment | None:
    """Attempt payment. Records a Payment for every gateway attempt (BR-I4).

    Zero-amount invoices are marked paid without a gateway call.
    """
    if inv.amount <= 0:
        inv.status, inv.paid_at = "paid", now
        return None
    if pm is None:
        result_ok, ref, reason = False, None, "no_payment_method"
    else:
        r = gateway.charge(pm.gateway_token, inv.amount)
        result_ok, ref, reason = r.success, r.reference, r.failure_reason
    pay = Payment(
        invoice_id=inv.id,
        user_id=inv.user_id,
        amount=inv.amount,
        status="succeeded" if result_ok else "failed",
        gateway_reference=ref,
        failure_reason=None if result_ok else reason,
        attempted_at=now,
    )
    db.add(pay)
    inv.status = "paid" if result_ok else "failed"
    inv.paid_at = now if result_ok else None
    db.flush()
    return pay


# ---- queries and serialisation ----
def invoice_out(inv: Invoice) -> InvoiceOut:
    out = InvoiceOut.model_validate(inv)
    out.customer_email = inv.user.email
    out.payments = [payment_out(p, inv) for p in inv.payments]
    return out


def payment_out(p: Payment, inv: Invoice | None = None) -> PaymentOut:
    out = PaymentOut.model_validate(p)
    out.invoice_number = (inv or p.invoice).number
    return out


def _paginate(db: Session, query, count_query, page: int, page_size: int):
    total = db.scalar(count_query) or 0
    rows = db.scalars(query.limit(page_size).offset((page - 1) * page_size)).unique().all()
    return rows, total


def list_invoices(
    db: Session,
    *,
    user_id: int | None = None,
    status: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    page: int = 1,
    page_size: int = 20,
) -> Page[InvoiceOut]:
    filters = []
    if user_id is not None:
        filters.append(Invoice.user_id == user_id)
    if status:
        filters.append(Invoice.status == status)
    if date_from:
        filters.append(Invoice.issued_at >= date_from)
    if date_to:
        filters.append(Invoice.issued_at <= date_to)
    q = (
        select(Invoice)
        .where(*filters)
        .options(joinedload(Invoice.lines), joinedload(Invoice.payments), joinedload(Invoice.user))
        .order_by(Invoice.id.desc())
    )
    # joinedload on collections + limit is unsafe; page ids first.
    id_q = select(Invoice.id).where(*filters).order_by(Invoice.id.desc()).limit(page_size).offset((page - 1) * page_size)
    ids = list(db.scalars(id_q))
    total = db.scalar(select(func.count(Invoice.id)).where(*filters)) or 0
    rows = []
    if ids:
        rows = db.scalars(q.where(Invoice.id.in_(ids))).unique().all()
    return Page[InvoiceOut](items=[invoice_out(i) for i in rows], total=total, page=page, page_size=page_size)


def get_invoice(db: Session, invoice_id: int, user: User) -> Invoice:
    inv = db.scalar(
        select(Invoice)
        .where(Invoice.id == invoice_id)
        .options(joinedload(Invoice.lines), joinedload(Invoice.payments), joinedload(Invoice.user))
    )
    # Another customer's invoice looks like it does not exist (BR-A5).
    if inv is None or (user.role != "admin" and inv.user_id != user.id):
        raise not_found("Invoice not found")
    return inv


def list_payments(
    db: Session,
    *,
    user_id: int | None = None,
    status: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    page: int = 1,
    page_size: int = 20,
) -> Page[PaymentOut]:
    filters = []
    if user_id is not None:
        filters.append(Payment.user_id == user_id)
    if status:
        filters.append(Payment.status == status)
    if date_from:
        filters.append(Payment.attempted_at >= date_from)
    if date_to:
        filters.append(Payment.attempted_at <= date_to)
    q = select(Payment).where(*filters).options(joinedload(Payment.invoice)).order_by(Payment.id.desc())
    rows, total = _paginate(db, q, select(func.count(Payment.id)).where(*filters), page, page_size)
    return Page[PaymentOut](items=[payment_out(p) for p in rows], total=total, page=page, page_size=page_size)


def now() -> datetime:
    return utcnow()

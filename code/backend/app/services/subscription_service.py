"""Subscription lifecycle: subscribe, change plan, renew, cancel.

`renew` is the single renewal path used by the scheduler, the customer's
"renew now" and the admin's renewal trigger (BR-R6).
"""
import calendar
import math
from datetime import datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.errors import AppError, bad_request, conflict, not_found, payment_failed
from app.gateway import SimulatedGateway
from app.models import Invoice, Plan, Subscription, User
from app.schemas import CardIn, ChangePreviewOut, PlanOut
from app.services import billing_service

LIVE = ("active", "past_due")
CENT = Decimal("0.01")


def _q(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


def add_interval(start: datetime, interval: str) -> datetime:
    """One calendar month or year later, clamping the day (31 Jan -> 28/29 Feb)."""
    months = 1 if interval == "monthly" else 12
    month_index = start.month - 1 + months
    year, month = start.year + month_index // 12, month_index % 12 + 1
    day = min(start.day, calendar.monthrange(year, month)[1])
    return start.replace(year=year, month=month, day=day)


# ---- queries ----
def get_live(db: Session, user_id: int, for_update: bool = False) -> Subscription | None:
    q = (
        select(Subscription)
        .where(Subscription.user_id == user_id, Subscription.status.in_(LIVE))
        .options(joinedload(Subscription.plan))
    )
    if for_update:
        q = q.with_for_update(of=Subscription)
    return db.scalars(q).unique().first()


def get_by_id(db: Session, sub_id: int) -> Subscription:
    sub = db.get(Subscription, sub_id)
    if sub is None:
        raise not_found("Subscription not found")
    return sub


def _require_live(db: Session, user: User) -> Subscription:
    sub = get_live(db, user.id)
    if sub is None:
        raise conflict("You have no active subscription", "no_subscription")
    return sub


def _active_plan(db: Session, plan_id: int) -> Plan:
    plan = db.get(Plan, plan_id)
    if plan is None:
        raise not_found("Plan not found")
    if not plan.is_active:
        raise conflict("This plan is no longer available", "plan_inactive")
    return plan


# ---- subscribe ----
def subscribe(
    db: Session, user: User, plan_id: int, card: CardIn | None, gateway: SimulatedGateway, now: datetime
) -> Subscription:
    plan = _active_plan(db, plan_id)
    if get_live(db, user.id) is not None:
        raise conflict("You already have a subscription", "already_subscribed")
    pm = billing_service.resolve_payment_method(db, user, card, gateway)

    end = add_interval(now, plan.interval)
    # Created non-live; becomes active only once the first payment succeeds (BR-S3).
    sub = Subscription(
        user_id=user.id,
        plan_id=plan.id,
        status="expired",
        current_period_start=now,
        current_period_end=end,
        price_at_subscription=plan.price,
    )
    db.add(sub)
    db.flush()
    inv = billing_service.create_invoice(
        db, sub, "initial", [(f"{plan.name} ({plan.interval})", plan.price)], now, end, now
    )
    pay = billing_service.charge_invoice(db, inv, pm, gateway, now)
    if inv.status != "paid":
        reason = pay.failure_reason if pay else "payment_failed"
        db.commit()
        raise payment_failed(reason)
    sub.status = "active"
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise conflict("You already have a subscription", "already_subscribed")
    return sub


# ---- change plan ----
def _preview(sub: Subscription, new_plan: Plan, now: datetime) -> tuple[str, Decimal, datetime]:
    if sub.status != "active":
        raise conflict("Resolve your failed payment before changing plan", "subscription_past_due")
    if new_plan.id == sub.plan_id:
        raise conflict("You are already on this plan", "same_plan")
    if new_plan.interval != sub.plan.interval:
        return "interval_change", _q(new_plan.price), add_interval(now, new_plan.interval)
    total = Decimal(str((sub.current_period_end - sub.current_period_start).total_seconds()))
    remaining_days = max(0, math.ceil((sub.current_period_end - now).total_seconds() / 86400))
    total_days = max(1, math.ceil(total / Decimal(86400)))
    ratio = min(Decimal(1), Decimal(remaining_days) / Decimal(total_days))
    prorated = _q((new_plan.price - sub.price_at_subscription) * ratio)
    if prorated > 0:
        return "upgrade", prorated, sub.current_period_end
    return "downgrade", Decimal("0.00"), sub.current_period_end


def preview_change(db: Session, user: User, plan_id: int, now: datetime) -> ChangePreviewOut:
    sub = _require_live(db, user)
    new_plan = _active_plan(db, plan_id)
    kind, amount, new_end = _preview(sub, new_plan, now)
    explanation = {
        "upgrade": f"You pay {amount:.2f} now for the remaining days of this cycle. Your renewal date stays the same.",
        "downgrade": "No charge, refund or credit. The new plan applies now and your renewal date stays the same.",
        "interval_change": f"The new billing interval starts today. You pay the full price of {amount:.2f} now.",
    }[kind]
    return ChangePreviewOut(
        kind=kind,
        amount_due_now=amount,
        new_plan=PlanOut.model_validate(new_plan),
        new_price=new_plan.price,
        new_period_end=new_end,
        explanation=explanation,
    )


def change_plan(db: Session, user: User, plan_id: int, gateway: SimulatedGateway, now: datetime) -> Subscription:
    sub = get_live(db, user.id, for_update=True)
    if sub is None:
        raise conflict("You have no active subscription", "no_subscription")
    new_plan = _active_plan(db, plan_id)
    kind, amount, new_end = _preview(sub, new_plan, now)
    pm = billing_service.get_payment_method(db, user.id)

    if kind == "interval_change":
        inv = billing_service.create_invoice(
            db, sub, "plan_change", [(f"Switch to {new_plan.name} ({new_plan.interval})", amount)], now, new_end, now
        )
    elif kind == "upgrade":
        inv = billing_service.create_invoice(
            db, sub, "proration", [(f"Upgrade to {new_plan.name} (prorated)", amount)],
            now, sub.current_period_end, now,
        )
    else:
        inv = billing_service.create_invoice(
            db, sub, "plan_change", [(f"Change to {new_plan.name}", amount)],
            now, sub.current_period_end, now,
        )
    pay = billing_service.charge_invoice(db, inv, pm, gateway, now)
    if inv.status != "paid":
        reason = pay.failure_reason if pay else "payment_failed"
        db.commit()  # keep the failed invoice and payment; plan is unchanged (BR-U5)
        raise payment_failed(reason)

    sub.plan_id = new_plan.id
    sub.plan = new_plan
    sub.price_at_subscription = new_plan.price
    if kind == "interval_change":
        sub.current_period_start, sub.current_period_end = now, new_end
        sub.renewal_attempts = 0
    db.commit()
    return sub


# ---- renew ----
def is_due(sub: Subscription, now: datetime) -> bool:
    return sub.status in LIVE and sub.current_period_end <= now


def renew(db: Session, sub: Subscription, gateway: SimulatedGateway, now: datetime) -> bool:
    """Process one renewal. Returns False if a payment failed. Commits."""
    if sub.cancel_at_period_end:
        # The period ended: honour the cancellation, do not charge (BR-R9).
        sub.status, sub.cancelled_at = "cancelled", now
        db.commit()
        return True

    start = sub.current_period_end
    end = add_interval(start, sub.plan.interval)
    inv = db.scalar(
        select(Invoice).where(
            Invoice.subscription_id == sub.id,
            Invoice.type == "renewal",
            Invoice.status == "failed",
            Invoice.period_start == start,
        )
    )
    if inv is None:
        inv = billing_service.create_invoice(
            db, sub, "renewal", [(f"{sub.plan.name} renewal", sub.price_at_subscription)], start, end, now
        )
    else:
        inv.status = "pending"  # retry reuses the open invoice (BR-R5)
    pm = billing_service.get_payment_method(db, sub.user_id)
    billing_service.charge_invoice(db, inv, pm, gateway, now)

    if inv.status == "paid":
        sub.current_period_start, sub.current_period_end = start, end
        sub.status, sub.renewal_attempts = "active", 0
        db.commit()
        return True
    sub.renewal_attempts += 1
    sub.status = "expired" if sub.renewal_attempts >= settings.max_renewal_attempts else "past_due"
    db.commit()
    return False


def renew_manual(db: Session, sub: Subscription, gateway: SimulatedGateway, now: datetime) -> Subscription:
    if not (sub.status == "past_due" or (sub.status == "active" and sub.current_period_end <= now)):
        raise conflict("This subscription is not due for renewal", "not_due")
    if not renew(db, sub, gateway, now):
        raise payment_failed(
            billing_reason(db, sub), {"reason": billing_reason(db, sub), "status": sub.status}
        )
    return sub


def billing_reason(db: Session, sub: Subscription) -> str:
    from app.models import Payment

    pay = db.scalars(
        select(Payment).join(Invoice).where(Invoice.subscription_id == sub.id).order_by(Payment.id.desc())
    ).first()
    return (pay.failure_reason if pay and pay.failure_reason else "payment_failed")


def process_due(db: Session, gateway: SimulatedGateway, now: datetime) -> int:
    """Scheduler entry point. Each subscription is handled in its own transaction (BR-R8)."""
    ids = list(
        db.scalars(
            select(Subscription.id).where(Subscription.status.in_(LIVE), Subscription.current_period_end <= now)
        )
    )
    processed = 0
    for sub_id in ids:
        try:
            sub = db.scalars(
                select(Subscription)
                .where(Subscription.id == sub_id)
                .options(joinedload(Subscription.plan))
                .with_for_update(of=Subscription)
            ).unique().one_or_none()
            if sub is not None and is_due(sub, now):
                renew(db, sub, gateway, now)
                processed += 1
            else:
                db.rollback()
        except Exception:  # one bad subscription must not stop the run
            db.rollback()
    return processed


# ---- cancel ----
def cancel(db: Session, user: User, mode: str, now: datetime) -> Subscription:
    sub = _require_live(db, user)
    if mode == "immediate":
        sub.status, sub.cancelled_at, sub.cancel_at_period_end = "cancelled", now, False
    else:
        sub.cancel_at_period_end = True
    db.commit()
    return sub


def undo_cancel(db: Session, user: User, now: datetime) -> Subscription:
    sub = _require_live(db, user)
    if not sub.cancel_at_period_end or sub.current_period_end <= now:
        raise conflict("There is no pending cancellation to undo", "nothing_to_undo")
    sub.cancel_at_period_end = False
    db.commit()
    return sub


__all__ = ["AppError", "bad_request", "timedelta"]

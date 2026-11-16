"""Admin analytics (BR-M1..M7)."""
from collections import defaultdict
from datetime import datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models import Invoice, Payment, Plan, Subscription
from app.schemas import AnalyticsSummary, PlanSubscribers, RevenuePoint

CENT = Decimal("0.01")


def default_range(date_from: datetime | None, date_to: datetime | None, now: datetime):
    return (date_from or now - timedelta(days=30)), (date_to or now)


def _monthly(sub: Subscription) -> Decimal:
    price = sub.price_at_subscription
    if sub.plan.interval == "yearly":
        price = price / 12
    return price.quantize(CENT, rounding=ROUND_HALF_UP)


def _has_paid_initial(db: Session):
    return select(Invoice.subscription_id).where(Invoice.type == "initial", Invoice.status == "paid")


def summary(db: Session, date_from: datetime | None, date_to: datetime | None, now: datetime) -> AnalyticsSummary:
    start, end = default_range(date_from, date_to, now)
    active = db.scalars(
        select(Subscription).where(Subscription.status == "active").options(joinedload(Subscription.plan))
    ).all()
    mrr = sum((_monthly(s) for s in active), Decimal("0.00"))

    activated = _has_paid_initial(db)
    new_count = db.scalar(
        select(func.count(Subscription.id)).where(
            Subscription.id.in_(activated), Subscription.created_at >= start, Subscription.created_at <= end
        )
    ) or 0
    cancellations = db.scalar(
        select(func.count(Subscription.id)).where(
            Subscription.cancelled_at.is_not(None), Subscription.cancelled_at >= start, Subscription.cancelled_at <= end
        )
    ) or 0
    active_at_start = db.scalar(
        select(func.count(Subscription.id)).where(
            Subscription.id.in_(activated),
            Subscription.created_at < start,
            (Subscription.cancelled_at.is_(None)) | (Subscription.cancelled_at >= start),
            Subscription.status != "expired",
        )
    ) or 0
    churn = round(cancellations / active_at_start, 4) if active_at_start else 0.0
    failed = db.scalar(
        select(func.count(Payment.id)).where(
            Payment.status == "failed", Payment.attempted_at >= start, Payment.attempted_at <= end
        )
    ) or 0
    return AnalyticsSummary(
        mrr=mrr,
        active_subscriptions=len(active),
        new_subscriptions=new_count,
        cancellations=cancellations,
        churn_rate=churn,
        failed_payments=failed,
        period_start=start,
        period_end=end,
    )


def revenue(
    db: Session, date_from: datetime | None, date_to: datetime | None, group_by: str, now: datetime
) -> list[RevenuePoint]:
    start, end = default_range(date_from, date_to, now)
    pays = db.scalars(
        select(Payment).where(
            Payment.status == "succeeded", Payment.attempted_at >= start, Payment.attempted_at <= end
        )
    ).all()
    fmt = "%Y-%m" if group_by == "month" else "%Y-%m-%d"
    buckets: dict[str, Decimal] = defaultdict(lambda: Decimal("0.00"))
    for p in pays:
        buckets[p.attempted_at.strftime(fmt)] += p.amount
    return [RevenuePoint(period=k, revenue=v) for k, v in sorted(buckets.items())]


def plan_subscribers(db: Session) -> list[PlanSubscribers]:
    rows = db.execute(
        select(Plan.id, Plan.name, func.count(Subscription.id))
        .outerjoin(Subscription, (Subscription.plan_id == Plan.id) & (Subscription.status == "active"))
        .group_by(Plan.id, Plan.name)
        .order_by(Plan.id)
    ).all()
    return [PlanSubscribers(plan_id=i, plan_name=n, subscribers=c) for i, n, c in rows]

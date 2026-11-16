from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import conflict, not_found
from app.models import Plan, Subscription
from app.schemas import PlanIn, PlanUpdate


def list_active(db: Session) -> list[Plan]:
    return list(db.scalars(select(Plan).where(Plan.is_active.is_(True)).order_by(Plan.id)))


def list_all(db: Session) -> list[Plan]:
    return list(db.scalars(select(Plan).order_by(Plan.id)))


def get(db: Session, plan_id: int) -> Plan:
    plan = db.get(Plan, plan_id)
    if plan is None:
        raise not_found("Plan not found")
    return plan


def _name_taken(db: Session, name: str, exclude_id: int | None = None) -> bool:
    q = select(Plan.id).where(func.lower(Plan.name) == name.strip().lower())
    if exclude_id is not None:
        q = q.where(Plan.id != exclude_id)
    return db.scalar(q) is not None


def create(db: Session, data: PlanIn) -> Plan:
    if _name_taken(db, data.name):
        raise conflict("A plan with this name already exists", "plan_name_taken")
    plan = Plan(
        name=data.name.strip(),
        description=data.description,
        price=data.price,
        interval=data.interval,
        features=data.features,
    )
    db.add(plan)
    db.commit()
    return plan


def update(db: Session, plan_id: int, data: PlanUpdate) -> Plan:
    plan = get(db, plan_id)
    changes = data.model_dump(exclude_unset=True)
    if "name" in changes and changes["name"] is not None and _name_taken(db, changes["name"], plan.id):
        raise conflict("A plan with this name already exists", "plan_name_taken")
    if changes.get("interval") and changes["interval"] != plan.interval:
        live = db.scalar(
            select(func.count(Subscription.id)).where(
                Subscription.plan_id == plan.id, Subscription.status.in_(("active", "past_due"))
            )
        )
        if live:
            raise conflict("Cannot change the interval of a plan that has subscribers", "plan_in_use")
    # Existing subscriptions keep their own price_at_subscription (BR-P3).
    for key, value in changes.items():
        if value is not None:
            setattr(plan, key, value.strip() if key == "name" else value)
    db.commit()
    return plan


def deactivate(db: Session, plan_id: int) -> Plan:
    plan = get(db, plan_id)
    plan.is_active = False
    db.commit()
    return plan

from datetime import datetime

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.gateway import SimulatedGateway
from app.models import Subscription, User
from app.schemas import CustomerOut, Page, PlanOut, SubscriptionOut
from app.services import subscription_service


def list_customers(db: Session, q: str | None, page: int, page_size: int) -> Page[CustomerOut]:
    filters = [User.role == "customer"]
    if q:
        like = f"%{q.strip().lower()}%"
        filters.append(or_(func.lower(User.email).like(like), func.lower(User.full_name).like(like)))
    total = db.scalar(select(func.count(User.id)).where(*filters)) or 0
    users = db.scalars(
        select(User).where(*filters).order_by(User.id.desc()).limit(page_size).offset((page - 1) * page_size)
    ).all()
    items = []
    for u in users:
        # Prefer the live subscription, else the most recent one.
        sub = subscription_service.get_live(db, u.id) or db.scalars(
            select(Subscription)
            .where(Subscription.user_id == u.id)
            .options(joinedload(Subscription.plan))
            .order_by(Subscription.id.desc())
        ).first()
        items.append(
            CustomerOut(
                id=u.id,
                email=u.email,
                name=u.full_name,
                created_at=u.created_at,
                subscription=SubscriptionOut.model_validate(sub) if sub else None,
            )
        )
    return Page[CustomerOut](items=items, total=total, page=page, page_size=page_size)


def renew_subscription(db: Session, sub_id: int, gateway: SimulatedGateway, now: datetime) -> Subscription:
    sub = subscription_service.get_by_id(db, sub_id)
    return subscription_service.renew_manual(db, sub, gateway, now)


__all__ = ["PlanOut"]

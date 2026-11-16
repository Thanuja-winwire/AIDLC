from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_customer
from app.gateway import SimulatedGateway, get_gateway
from app.models import User, utcnow
from app.schemas import (
    CancelIn,
    ChangePlanIn,
    ChangePreviewOut,
    SubscribeIn,
    SubscriptionOut,
)
from app.services import subscription_service as svc

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/current", response_model=SubscriptionOut | None)
def current(db: Session = Depends(get_db), user: User = Depends(require_customer)):
    return svc.get_live(db, user.id)


@router.post("", status_code=201, response_model=SubscriptionOut)
def subscribe(
    data: SubscribeIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_customer),
    gateway: SimulatedGateway = Depends(get_gateway),
):
    return svc.subscribe(db, user, data.plan_id, data.card, gateway, utcnow())


@router.get("/change-preview", response_model=ChangePreviewOut)
def change_preview(
    plan_id: int = Query(...), db: Session = Depends(get_db), user: User = Depends(require_customer)
):
    return svc.preview_change(db, user, plan_id, utcnow())


@router.post("/change", response_model=SubscriptionOut)
def change(
    data: ChangePlanIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_customer),
    gateway: SimulatedGateway = Depends(get_gateway),
):
    return svc.change_plan(db, user, data.plan_id, gateway, utcnow())


@router.post("/renew", response_model=SubscriptionOut)
def renew(
    db: Session = Depends(get_db),
    user: User = Depends(require_customer),
    gateway: SimulatedGateway = Depends(get_gateway),
):
    sub = svc.get_live(db, user.id)
    if sub is None:
        from app.core.errors import conflict

        raise conflict("You have no active subscription", "no_subscription")
    return svc.renew_manual(db, sub, gateway, utcnow())


@router.post("/cancel", response_model=SubscriptionOut)
def cancel(data: CancelIn, db: Session = Depends(get_db), user: User = Depends(require_customer)):
    return svc.cancel(db, user, data.mode, utcnow())


@router.post("/cancel/undo", response_model=SubscriptionOut)
def undo_cancel(db: Session = Depends(get_db), user: User = Depends(require_customer)):
    return svc.undo_cancel(db, user, utcnow())

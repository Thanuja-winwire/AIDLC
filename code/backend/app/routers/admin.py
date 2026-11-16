from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_admin
from app.gateway import SimulatedGateway, get_gateway
from app.models import User, utcnow
from app.schemas import (
    AnalyticsSummary,
    CustomerOut,
    InvoiceOut,
    Page,
    PaymentOut,
    PlanIn,
    PlanOut,
    PlanSubscribers,
    PlanUpdate,
    RevenuePoint,
    SubscriptionOut,
)
from app.services import admin_service, analytics_service, billing_service, plan_service

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


# ---- analytics ----
@router.get("/analytics/summary", response_model=AnalyticsSummary)
def summary(
    date_from: datetime | None = Query(None, alias="from"),
    date_to: datetime | None = Query(None, alias="to"),
    db: Session = Depends(get_db),
):
    return analytics_service.summary(db, date_from, date_to, utcnow())


@router.get("/analytics/revenue", response_model=list[RevenuePoint])
def revenue(
    date_from: datetime | None = Query(None, alias="from"),
    date_to: datetime | None = Query(None, alias="to"),
    group_by: Literal["day", "month"] = "day",
    db: Session = Depends(get_db),
):
    return analytics_service.revenue(db, date_from, date_to, group_by, utcnow())


@router.get("/analytics/plans", response_model=list[PlanSubscribers])
def plans_breakdown(db: Session = Depends(get_db)):
    return analytics_service.plan_subscribers(db)


# ---- plans ----
@router.get("/plans", response_model=list[PlanOut])
def list_plans(db: Session = Depends(get_db)):
    return plan_service.list_all(db)


@router.post("/plans", status_code=201, response_model=PlanOut)
def create_plan(data: PlanIn, db: Session = Depends(get_db)):
    return plan_service.create(db, data)


@router.put("/plans/{plan_id}", response_model=PlanOut)
def update_plan(plan_id: int, data: PlanUpdate, db: Session = Depends(get_db)):
    return plan_service.update(db, plan_id, data)


@router.post("/plans/{plan_id}/deactivate", response_model=PlanOut)
def deactivate_plan(plan_id: int, db: Session = Depends(get_db)):
    return plan_service.deactivate(db, plan_id)


# ---- customers, subscriptions, billing ----
@router.get("/customers", response_model=Page[CustomerOut])
def customers(
    q: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return admin_service.list_customers(db, q, page, page_size)


@router.post("/subscriptions/{sub_id}/renew", response_model=SubscriptionOut)
def renew(sub_id: int, db: Session = Depends(get_db), gateway: SimulatedGateway = Depends(get_gateway)):
    return admin_service.renew_subscription(db, sub_id, gateway, utcnow())


@router.get("/invoices", response_model=Page[InvoiceOut])
def invoices(
    status: str | None = None,
    user_id: int | None = None,
    date_from: datetime | None = Query(None, alias="from"),
    date_to: datetime | None = Query(None, alias="to"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return billing_service.list_invoices(
        db, user_id=user_id, status=status, date_from=date_from, date_to=date_to, page=page, page_size=page_size
    )


@router.get("/payments", response_model=Page[PaymentOut])
def payments(
    status: str | None = None,
    user_id: int | None = None,
    date_from: datetime | None = Query(None, alias="from"),
    date_to: datetime | None = Query(None, alias="to"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return billing_service.list_payments(
        db, user_id=user_id, status=status, date_from=date_from, date_to=date_to, page=page, page_size=page_size
    )

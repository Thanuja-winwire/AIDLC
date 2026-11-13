from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.csv_util import csv_response
from app.core.db import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.insights import DashboardSummary, LowStockItem, SalesReport, TopProduct
from app.services import insights as svc

router = APIRouter(tags=["insights"])


@router.get("/alerts", response_model=list[LowStockItem])
def alerts(
    view: str = Query("total", pattern="^(total|location)$"), location_id: int | None = None,
    db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    return svc.low_stock(db, view, location_id)


@router.get("/dashboard", response_model=DashboardSummary)
def dashboard(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return svc.dashboard(db)


@router.get("/reports/sales", response_model=SalesReport)
def sales_report(
    group_by: str = "product", date_from: date | None = None, date_to: date | None = None,
    location_id: int | None = None, db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    return svc.sales_report(db, group_by, date_from, date_to, location_id)


@router.get("/reports/sales/export")
def sales_report_csv(
    group_by: str = "product", date_from: date | None = None, date_to: date | None = None,
    location_id: int | None = None, db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    report = svc.sales_report(db, group_by, date_from, date_to, location_id)
    rows = [[r.group, r.orders, r.units, r.revenue, r.cost, r.margin] for r in report.rows]
    return csv_response(
        f"sales-by-{group_by}.csv", [group_by.title(), "Orders", "Units", "Revenue", "Cost", "Margin"], rows
    )


@router.get("/reports/top-products", response_model=list[TopProduct])
def top_products(
    date_from: date | None = None, date_to: date | None = None, location_id: int | None = None,
    by: str = "revenue", limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    return svc.top_products(db, date_from, date_to, location_id, by, limit)

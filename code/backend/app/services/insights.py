from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.errors import ValidationFailed
from app.repositories import insights as repo
from app.schemas.insights import (
    DashboardSummary, LowStockItem, SalesReport, SalesReportRow, TopProduct,
)

GROUPS = ("product", "category", "day", "month")


def low_stock(db: Session, view: str, location_id: int | None) -> list[LowStockItem]:
    if view == "location":
        return [
            LowStockItem(
                product_id=r[0], sku=r[1], name=r[2], location_id=r[3], location_name=r[4],
                quantity=int(r[5]), reorder_level=r[6],
            )
            for r in repo.low_stock_by_location(db, location_id)
        ]
    if view != "total":
        raise ValidationFailed("view must be 'total' or 'location'")
    return [
        LowStockItem(product_id=r[0], sku=r[1], name=r[2], quantity=int(r[3]), reorder_level=r[4])
        for r in repo.low_stock_total(db)
    ]


def dashboard(db: Session) -> DashboardSummary:
    products, units, value = repo.totals(db)
    now = datetime.now(timezone.utc)
    start_today = datetime.combine(now.date(), time.min, tzinfo=timezone.utc)
    return DashboardSummary(
        total_products=products, total_units=units, stock_value=value,
        low_stock_count=len(repo.low_stock_total(db)), open_purchase_orders=repo.open_po_count(db),
        sales_today=repo.sales_sum(db, start_today),
        sales_last_30_days=repo.sales_sum(db, now - timedelta(days=30)),
    )


def resolve_range(date_from: date | None, date_to: date | None) -> tuple[datetime, datetime]:
    """BR-R2: inclusive dates, default last 30 days. Returns [start, end) datetimes."""
    today = datetime.now(timezone.utc).date()
    end = date_to or today
    start = date_from or (end - timedelta(days=29))
    if start > end:
        raise ValidationFailed("Start date must not be after end date")
    return (
        datetime.combine(start, time.min, tzinfo=timezone.utc),
        datetime.combine(end + timedelta(days=1), time.min, tzinfo=timezone.utc),
    )


def _key(row, group_by: str) -> str:
    sold_at, _sid, _pid, sku, name, category = row[0], row[1], row[2], row[3], row[4], row[5]
    if group_by == "product":
        return f"{sku} - {name}"
    if group_by == "category":
        return category
    if group_by == "day":
        return sold_at.strftime("%Y-%m-%d")
    return sold_at.strftime("%Y-%m")


def sales_report(
    db: Session, group_by: str, date_from: date | None, date_to: date | None, location_id: int | None
) -> SalesReport:
    if group_by not in GROUPS:
        raise ValidationFailed(f"group_by must be one of {', '.join(GROUPS)}")
    start, end = resolve_range(date_from, date_to)
    acc: dict[str, dict] = defaultdict(lambda: {"orders": set(), "units": 0, "rev": Decimal(0), "cost": Decimal(0)})
    for row in repo.sales_lines(db, start, end, location_id):
        bucket = acc[_key(row, group_by)]
        bucket["orders"].add(row[1])
        bucket["units"] += int(row[6])
        bucket["rev"] += Decimal(row[7])
        bucket["cost"] += Decimal(row[8])
    keys = sorted(acc, reverse=group_by in ("day", "month")) if group_by in ("day", "month") else sorted(
        acc, key=lambda k: acc[k]["rev"], reverse=True
    )
    rows = [
        SalesReportRow(
            group=k, orders=len(acc[k]["orders"]), units=acc[k]["units"], revenue=acc[k]["rev"],
            cost=acc[k]["cost"], margin=acc[k]["rev"] - acc[k]["cost"],
        )
        for k in keys
    ]
    rev = sum((r.revenue for r in rows), Decimal(0))
    cost = sum((r.cost for r in rows), Decimal(0))
    return SalesReport(group_by=group_by, rows=rows, total_revenue=rev, total_cost=cost, total_margin=rev - cost)


def top_products(
    db: Session, date_from: date | None, date_to: date | None, location_id: int | None, by: str, limit: int
) -> list[TopProduct]:
    if by not in ("revenue", "units"):
        raise ValidationFailed("by must be 'revenue' or 'units'")
    start, end = resolve_range(date_from, date_to)
    acc: dict[int, dict] = {}
    for row in repo.sales_lines(db, start, end, location_id):
        item = acc.setdefault(row[2], {"sku": row[3], "name": row[4], "units": 0, "rev": Decimal(0)})
        item["units"] += int(row[6])
        item["rev"] += Decimal(row[7])
    ranked = sorted(acc.items(), key=lambda kv: kv[1]["rev" if by == "revenue" else "units"], reverse=True)
    return [
        TopProduct(product_id=pid, sku=v["sku"], name=v["name"], units=v["units"], revenue=v["rev"])
        for pid, v in ranked[:limit]
    ]

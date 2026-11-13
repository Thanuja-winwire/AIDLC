from decimal import Decimal

from pydantic import BaseModel


class LowStockItem(BaseModel):
    product_id: int
    sku: str
    name: str
    location_id: int | None = None
    location_name: str | None = None
    quantity: int
    reorder_level: int


class DashboardSummary(BaseModel):
    total_products: int
    total_units: int
    stock_value: Decimal
    low_stock_count: int
    open_purchase_orders: int
    sales_today: Decimal
    sales_last_30_days: Decimal


class SalesReportRow(BaseModel):
    group: str
    orders: int
    units: int
    revenue: Decimal
    cost: Decimal
    margin: Decimal


class SalesReport(BaseModel):
    group_by: str
    rows: list[SalesReportRow]
    total_revenue: Decimal
    total_cost: Decimal
    total_margin: Decimal


class TopProduct(BaseModel):
    product_id: int
    sku: str
    name: str
    units: int
    revenue: Decimal

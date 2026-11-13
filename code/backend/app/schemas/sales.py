from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class SaleLineIn(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)  # defaults to sale_price


class SaleCreate(BaseModel):
    location_id: int
    customer_name: str | None = Field(default=None, max_length=200)
    lines: list[SaleLineIn] = Field(min_length=1)


class SaleLineOut(ORMModel):
    id: int
    product_id: int
    product_sku: str
    product_name: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class SaleOut(ORMModel):
    id: int
    number: str
    location_id: int
    location_name: str
    customer_name: str | None = None
    total_amount: Decimal
    created_by: int
    sold_at: datetime
    lines: list[SaleLineOut] = []

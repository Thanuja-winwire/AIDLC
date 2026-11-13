from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.purchasing import POStatus
from app.schemas.common import ORMModel


class POLineIn(BaseModel):
    product_id: int
    quantity_ordered: int = Field(gt=0)
    unit_cost: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)  # defaults to product cost


class POCreate(BaseModel):
    supplier_id: int
    destination_location_id: int
    notes: str | None = None
    lines: list[POLineIn] = Field(min_length=1)


class POUpdate(BaseModel):
    supplier_id: int | None = None
    destination_location_id: int | None = None
    notes: str | None = None
    lines: list[POLineIn] | None = Field(default=None, min_length=1)


class POLineOut(ORMModel):
    id: int
    product_id: int
    product_sku: str
    product_name: str
    quantity_ordered: int
    quantity_received: int
    unit_cost: Decimal


class POOut(ORMModel):
    id: int
    number: str
    supplier_id: int
    supplier_name: str
    destination_location_id: int
    destination_location_name: str
    status: POStatus
    notes: str | None = None
    total_amount: Decimal
    created_by: int
    approved_by: int | None = None
    approved_at: datetime | None = None
    cancelled_at: datetime | None = None
    created_at: datetime
    lines: list[POLineOut] = []


class ReceiveLineIn(BaseModel):
    po_line_id: int
    quantity: int = Field(gt=0)


class ReceiveRequest(BaseModel):
    note: str | None = None
    lines: list[ReceiveLineIn] = Field(min_length=1)

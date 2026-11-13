from datetime import datetime

from pydantic import BaseModel, Field

from app.models.inventory import MovementType
from app.schemas.common import ORMModel


class LocationIn(BaseModel):
    code: str = Field(min_length=1, max_length=32)
    name: str = Field(min_length=1, max_length=200)
    address: str | None = None


class LocationUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    address: str | None = None
    is_active: bool | None = None


class LocationOut(ORMModel):
    id: int
    code: str
    name: str
    address: str | None = None
    is_active: bool


class StockLevelOut(BaseModel):
    product_id: int
    product_sku: str
    product_name: str
    location_id: int
    location_code: str
    location_name: str
    quantity: int
    reorder_level: int


class MovementOut(ORMModel):
    id: int
    product_id: int
    product_sku: str
    product_name: str
    location_id: int
    location_code: str
    type: MovementType
    quantity_delta: int
    quantity_after: int
    reference_type: str | None = None
    reference_id: int | None = None
    note: str | None = None
    user_id: int | None = None
    created_at: datetime

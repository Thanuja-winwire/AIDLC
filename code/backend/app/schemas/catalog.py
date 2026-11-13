from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class CategoryIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None


class CategoryOut(ORMModel):
    id: int
    name: str
    description: str | None = None


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    category_id: int | None = None
    unit_of_measure: str = Field(default="unit", max_length=32)
    unit_cost: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    sale_price: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    reorder_level: int = Field(default=0, ge=0)


class ProductCreate(ProductBase):
    sku: str = Field(min_length=1, max_length=64)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    category_id: int | None = None
    unit_of_measure: str | None = Field(default=None, max_length=32)
    unit_cost: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    sale_price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    reorder_level: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ProductOut(ORMModel):
    id: int
    sku: str
    name: str
    description: str | None = None
    category_id: int | None = None
    category_name: str | None = None
    unit_of_measure: str
    unit_cost: Decimal
    sale_price: Decimal
    reorder_level: int
    is_active: bool
    total_stock: int = 0
    created_at: datetime

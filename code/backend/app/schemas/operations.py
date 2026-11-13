from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.models.operations import AdjustmentMode, AdjustmentReason


class TransferCreate(BaseModel):
    product_id: int
    from_location_id: int
    to_location_id: int
    quantity: int = Field(gt=0)
    note: str | None = None

    @model_validator(mode="after")
    def _distinct(self):
        if self.from_location_id == self.to_location_id:
            raise ValueError("Source and destination locations must differ")
        return self


class TransferOut(BaseModel):
    id: int
    number: str
    product_id: int
    product_sku: str
    product_name: str
    from_location_id: int
    from_location_name: str
    to_location_id: int
    to_location_name: str
    quantity: int
    note: str | None = None
    created_by: int
    created_at: datetime


class AdjustmentCreate(BaseModel):
    product_id: int
    location_id: int
    mode: AdjustmentMode
    delta: int | None = None
    counted_quantity: int | None = Field(default=None, ge=0)
    reason: AdjustmentReason
    note: str | None = None

    @model_validator(mode="after")
    def _mode_fields(self):
        if self.mode == AdjustmentMode.DELTA:
            if self.delta is None or self.delta == 0:
                raise ValueError("A non-zero delta is required in DELTA mode")
        elif self.counted_quantity is None:
            raise ValueError("counted_quantity is required in COUNT mode")
        return self


class AdjustmentOut(BaseModel):
    id: int
    product_id: int
    product_sku: str
    product_name: str
    location_id: int
    location_name: str
    mode: AdjustmentMode
    delta: int
    counted_quantity: int | None = None
    reason: AdjustmentReason
    note: str | None = None
    created_by: int
    created_at: datetime

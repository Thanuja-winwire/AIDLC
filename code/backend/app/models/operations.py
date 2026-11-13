import enum

from sqlalchemy import CheckConstraint, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, TimestampMixin


class StockTransfer(TimestampMixin, Base):
    __tablename__ = "stock_transfers"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_transfer_qty"),
        CheckConstraint("from_location_id <> to_location_id", name="ck_transfer_distinct"),
    )

    number: Mapped[str] = mapped_column(String(32), unique=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    from_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    to_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))

    product = relationship("Product")
    from_location = relationship("Location", foreign_keys=[from_location_id])
    to_location = relationship("Location", foreign_keys=[to_location_id])


class AdjustmentMode(str, enum.Enum):
    DELTA = "DELTA"
    COUNT = "COUNT"


class AdjustmentReason(str, enum.Enum):
    DAMAGE = "DAMAGE"
    LOSS = "LOSS"
    RECOUNT = "RECOUNT"
    CORRECTION = "CORRECTION"
    OTHER = "OTHER"


class StockAdjustment(TimestampMixin, Base):
    __tablename__ = "stock_adjustments"

    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    mode: Mapped[AdjustmentMode] = mapped_column(Enum(AdjustmentMode, name="adjustment_mode"))
    delta: Mapped[int] = mapped_column(Integer)
    counted_quantity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reason: Mapped[AdjustmentReason] = mapped_column(Enum(AdjustmentReason, name="adjustment_reason"))
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))

    product = relationship("Product")
    location = relationship("Location")

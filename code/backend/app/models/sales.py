from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, TimestampMixin


class Sale(TimestampMixin, Base):
    __tablename__ = "sales"

    number: Mapped[str] = mapped_column(String(32), unique=True)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), index=True)
    customer_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    sold_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)

    location = relationship("Location")
    lines: Mapped[list["SaleLine"]] = relationship(
        back_populates="sale", cascade="all, delete-orphan", order_by="SaleLine.id"
    )


class SaleLine(TimestampMixin, Base):
    __tablename__ = "sale_lines"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_saleline_qty"),
        CheckConstraint("unit_price >= 0", name="ck_saleline_price"),
    )

    sale_id: Mapped[int] = mapped_column(ForeignKey("sales.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    unit_cost_snapshot: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    sale: Mapped[Sale] = relationship(back_populates="lines")
    product = relationship("Product")

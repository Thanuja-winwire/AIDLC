import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, TimestampMixin
from app.models.catalog import Product
from app.models.inventory import Location
from app.models.supplier import Supplier


class POStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    APPROVED = "APPROVED"
    PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED"
    RECEIVED = "RECEIVED"
    CANCELLED = "CANCELLED"


class PurchaseOrder(TimestampMixin, Base):
    __tablename__ = "purchase_orders"

    number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), index=True)
    destination_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    status: Mapped[POStatus] = mapped_column(Enum(POStatus, name="po_status"), default=POStatus.DRAFT, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    approved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    supplier: Mapped[Supplier] = relationship()
    destination_location: Mapped[Location] = relationship()
    lines: Mapped[list["PurchaseOrderLine"]] = relationship(
        back_populates="purchase_order", cascade="all, delete-orphan", order_by="PurchaseOrderLine.id"
    )
    receipts: Mapped[list["PurchaseReceipt"]] = relationship(
        back_populates="purchase_order", cascade="all, delete-orphan", order_by="PurchaseReceipt.id"
    )

    @property
    def total_amount(self) -> Decimal:
        return sum((l.unit_cost * l.quantity_ordered for l in self.lines), Decimal("0"))


class PurchaseOrderLine(TimestampMixin, Base):
    __tablename__ = "purchase_order_lines"
    __table_args__ = (
        CheckConstraint("quantity_ordered > 0", name="ck_pol_ordered_pos"),
        CheckConstraint("quantity_received >= 0 AND quantity_received <= quantity_ordered", name="ck_pol_received_range"),
    )

    purchase_order_id: Mapped[int] = mapped_column(ForeignKey("purchase_orders.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    quantity_ordered: Mapped[int] = mapped_column(Integer)
    quantity_received: Mapped[int] = mapped_column(Integer, default=0)
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    purchase_order: Mapped[PurchaseOrder] = relationship(back_populates="lines")
    product: Mapped[Product] = relationship()


class PurchaseReceipt(TimestampMixin, Base):
    __tablename__ = "purchase_receipts"

    purchase_order_id: Mapped[int] = mapped_column(ForeignKey("purchase_orders.id"), index=True)
    received_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    purchase_order: Mapped[PurchaseOrder] = relationship(back_populates="receipts")
    lines: Mapped[list["ReceiptLine"]] = relationship(cascade="all, delete-orphan")


class ReceiptLine(TimestampMixin, Base):
    __tablename__ = "receipt_lines"
    __table_args__ = (CheckConstraint("quantity > 0", name="ck_receipt_line_pos"),)

    receipt_id: Mapped[int] = mapped_column(ForeignKey("purchase_receipts.id"), index=True)
    po_line_id: Mapped[int] = mapped_column(ForeignKey("purchase_order_lines.id"))
    quantity: Mapped[int] = mapped_column(Integer)

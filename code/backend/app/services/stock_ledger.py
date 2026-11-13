"""StockLedger: the ONLY code path allowed to change stock quantities.

Every change locks the StockLevel row, applies the delta, rejects negative
results and appends an immutable StockMovement. It never commits: the request
transaction (see core.db.get_db) commits or rolls back everything together.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import InsufficientStockError
from app.models.catalog import Product
from app.models.inventory import Location, MovementType, StockLevel, StockMovement


class StockLedger:
    def __init__(self, db: Session, user_id: int | None):
        self.db = db
        self.user_id = user_id

    def _locked_level(self, product_id: int, location_id: int) -> StockLevel:
        stmt = (
            select(StockLevel)
            .where(StockLevel.product_id == product_id, StockLevel.location_id == location_id)
            .with_for_update()
        )
        level = self.db.scalar(stmt)
        if level is None:
            level = StockLevel(product_id=product_id, location_id=location_id, quantity=0)
            self.db.add(level)
            self.db.flush()
        return level

    def current_quantity(self, product_id: int, location_id: int, lock: bool = False) -> int:
        if lock:
            return self._locked_level(product_id, location_id).quantity
        level = self.db.scalar(
            select(StockLevel).where(StockLevel.product_id == product_id, StockLevel.location_id == location_id)
        )
        return level.quantity if level else 0

    def apply(
        self,
        *,
        product_id: int,
        location_id: int,
        delta: int,
        movement_type: MovementType,
        reference_type: str | None = None,
        reference_id: int | None = None,
        note: str | None = None,
    ) -> StockMovement:
        if delta == 0:
            raise ValueError("Stock delta must be non-zero")
        level = self._locked_level(product_id, location_id)
        new_qty = level.quantity + delta
        if new_qty < 0:
            product = self.db.get(Product, product_id)
            location = self.db.get(Location, location_id)
            raise InsufficientStockError(
                f"Insufficient stock for {product.sku if product else product_id} at "
                f"{location.code if location else location_id}: available {level.quantity}, requested {-delta}"
            )
        level.quantity = new_qty
        movement = StockMovement(
            product_id=product_id,
            location_id=location_id,
            type=movement_type,
            quantity_delta=delta,
            quantity_after=new_qty,
            reference_type=reference_type,
            reference_id=reference_id,
            note=note,
            user_id=self.user_id,
        )
        self.db.add(movement)
        self.db.flush()
        return movement

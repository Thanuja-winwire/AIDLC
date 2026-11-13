"""Import every model so Base.metadata is complete (used by Alembic and tests)."""
from app.models.user import Role, User  # noqa: F401
from app.models.catalog import Category, Product  # noqa: F401
from app.models.inventory import Location, MovementType, StockLevel, StockMovement  # noqa: F401
from app.models.supplier import Supplier  # noqa: F401
from app.models.purchasing import (  # noqa: F401
    POStatus, PurchaseOrder, PurchaseOrderLine, PurchaseReceipt, ReceiptLine,
)
from app.models.operations import (  # noqa: F401
    AdjustmentMode, AdjustmentReason, StockAdjustment, StockTransfer,
)
from app.models.sales import Sale, SaleLine  # noqa: F401

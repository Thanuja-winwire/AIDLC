# Domain Entities: Inventory Management System

Technology-agnostic. All entities have `id`, `created_at`, `updated_at` unless noted. Money = decimal(12,2); quantities = integer >= 0 (whole units).

## Entities

### User
email (unique, case-insensitive), full_name, password_hash, role (ADMIN | STAFF), is_active, last_login_at.

### Category
name (unique), description.

### Product
sku (unique), name, description, category_id, unit_of_measure, unit_cost, sale_price, reorder_level (>= 0), is_active.

### Location
code (unique), name, address, is_active.

### StockLevel
product_id, location_id, quantity (>= 0). Unique (product_id, location_id). Mutated only by StockLedger.

### StockMovement (immutable, append-only)
product_id, location_id, type (PO_RECEIPT | SALE | TRANSFER_OUT | TRANSFER_IN | ADJUSTMENT), quantity_delta (non-zero, signed), quantity_after, reference_type, reference_id, note, user_id, created_at.

### Supplier
name, contact_person, email, phone, address, is_active.

### PurchaseOrder
number (PO-000123), supplier_id, destination_location_id, status (DRAFT | APPROVED | PARTIALLY_RECEIVED | RECEIVED | CANCELLED), notes, created_by, approved_by, approved_at, cancelled_at, total_amount (derived).

### PurchaseOrderLine
purchase_order_id, product_id, quantity_ordered (>0), quantity_received (0..ordered), unit_cost.

### PurchaseReceipt
purchase_order_id, received_by, received_at, note. Has ReceiptLine(po_line_id, quantity).

### StockTransfer
number (TR-), product_id, from_location_id, to_location_id, quantity (>0), note, created_by.

### StockAdjustment
product_id, location_id, mode (DELTA | COUNT), delta (signed, computed), counted_quantity (nullable), reason (DAMAGE | LOSS | RECOUNT | CORRECTION | OTHER), note, created_by.

### Sale
number (SO-), location_id, customer_name (optional), total_amount, created_by, sold_at.

### SaleLine
sale_id, product_id, quantity (>0), unit_price (>= 0, defaults from Product.sale_price, editable), unit_cost_snapshot (Product.unit_cost at sale time), line_total.

## Relationships
- Category 1—* Product; Product 1—* StockLevel *—1 Location
- Product 1—* StockMovement; Location 1—* StockMovement
- Supplier 1—* PurchaseOrder 1—* PurchaseOrderLine *—1 Product
- PurchaseOrder 1—* PurchaseReceipt 1—* ReceiptLine
- Sale 1—* SaleLine *—1 Product
- User 1—* (PO, Receipt, Transfer, Adjustment, Sale, Movement) as actor

## Derived values
- Total stock of product = sum of StockLevel quantities.
- Stock value = sum(quantity x Product.unit_cost).
- Low-stock (total view): total <= reorder_level. Low-stock (per-location view): StockLevel.quantity <= reorder_level.

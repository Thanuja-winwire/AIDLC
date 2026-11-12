# Domain Entities: Inventory System

Quantities are decimals with up to 3 places (Decimal(14,3)). Money is Decimal(14,4) for costs, single currency. All entities have `id`, `created_at`, `updated_at`.

## Entities

### Product
| Field | Type | Notes |
|---|---|---|
| sku | string | unique, required, max 64 |
| name | string | required, max 200 |
| description | text | optional |
| category | string | optional, indexed |
| unit_of_measure | string | required (e.g. pcs, kg, L) |
| unit_cost | decimal | >= 0, default/standard cost; used as initial cost |
| average_cost | decimal | >= 0, weighted average, updated on PO receipt |
| reorder_level | decimal | >= 0 |
| is_active | bool | default true |

### Warehouse
code (unique), name, address, is_active.

### Supplier
name (unique), contact_person, email, phone, address, is_active.

### ProductSupplier (link)
product_id, supplier_id; unique pair. Optional supplier SKU/notes not required.

### StockLevel
product_id, warehouse_id (unique pair), quantity decimal >= 0. Only mutated by StockLedgerService.

### StockMovement (immutable ledger)
| Field | Notes |
|---|---|
| product_id, warehouse_id | FK |
| movement_type | PO_RECEIPT, TRANSFER_OUT, TRANSFER_IN, ADJUSTMENT |
| quantity_change | signed decimal, non-zero |
| balance_after | decimal >= 0 |
| reference_type / reference_id | PURCHASE_ORDER, TRANSFER, ADJUSTMENT + id |
| occurred_at | timestamp |
No update or delete operations exist.

### PurchaseOrder
po_number (unique, `PO-000123`), supplier_id, warehouse_id, status (DRAFT, ORDERED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED), notes, ordered_at, closed_at.

### PurchaseOrderLine
purchase_order_id, product_id, quantity_ordered > 0, quantity_received >= 0 (<= ordered), unit_cost >= 0. A product appears once per PO.

### Transfer
reference_number (`TR-000123`), product_id, source_warehouse_id, destination_warehouse_id (different), quantity > 0, notes, created_at. Completes immediately.

### Adjustment
reference_number (`ADJ-000123`), product_id, warehouse_id, direction (INCREASE/DECREASE), quantity > 0, reason (DAMAGE, LOSS, RECOUNT, CORRECTION, OTHER), notes (required when reason = OTHER), created_at.

## Relationships
```
Supplier 1--* PurchaseOrder 1--* PurchaseOrderLine *--1 Product
Warehouse 1--* PurchaseOrder (destination)
Product *--* Supplier (ProductSupplier)
Product 1--* StockLevel *--1 Warehouse
Product/Warehouse 1--* StockMovement
Transfer, Adjustment, PurchaseOrder -> StockMovement (via reference)
```

## Derived (not stored)
- Total quantity per product = sum of StockLevel across warehouses.
- is_low_stock = total quantity <= reorder_level (active products with reorder_level > 0 or equal to 0 and quantity 0 follow the same rule).
- Stock value = quantity x average_cost.

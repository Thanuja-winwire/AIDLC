# Business Rules: Inventory System

## Common
- BR-C1: All quantities have at most 3 decimal places and, for transactions, must be > 0.
- BR-C2: SKU, warehouse code, supplier name and PO/transfer/adjustment numbers are unique; violation -> 409.
- BR-C3: Validation errors -> 422; missing entity -> 404; state or stock conflict -> 409.
- BR-C4: Reference numbers are sequential with a prefix and 6-digit zero padding (PO-000123, TR-000123, ADJ-000123).

## Products, Warehouses, Suppliers
- BR-P1: Records are never hard-deleted; "delete" sets is_active = false. Reactivation is allowed.
- BR-P2: Inactive products, warehouses and suppliers remain usable in new POs, transfers and adjustments (decision), and remain visible in history and reports. List views default to active only with an "include inactive" filter.
- BR-P3: unit_cost and reorder_level must be >= 0. average_cost starts equal to unit_cost.
- BR-P4: Product search matches name, SKU, category (case-insensitive contains).

## Stock Ledger invariants
- BR-S1: Only StockLedgerService changes StockLevel; every change writes a StockMovement in the same transaction.
- BR-S2: A change that would make quantity negative is rejected (409 insufficient stock) and nothing is written.
- BR-S3: StockMovement.balance_after equals the new StockLevel quantity; movements are immutable.
- BR-S4: Rows are locked or updated with a conditional statement to prevent concurrent oversell.

## Purchase Orders
- BR-PO1: Allowed transitions: DRAFT -> ORDERED, DRAFT -> CANCELLED, ORDERED -> PARTIALLY_RECEIVED, ORDERED -> RECEIVED, ORDERED -> CANCELLED, PARTIALLY_RECEIVED -> RECEIVED. All others rejected with 409.
- BR-PO2: A Draft PO is fully editable (supplier, warehouse, lines). Once Ordered, it is locked.
- BR-PO3: Placing an order requires at least one line, a supplier and a warehouse.
- BR-PO4: Receiving supplies per-line quantities; each must be > 0 and cannot push quantity_received above quantity_ordered (no over-receipt).
- BR-PO5: After a receipt, status is RECEIVED if all lines are fully received, otherwise PARTIALLY_RECEIVED.
- BR-PO6: Each received quantity increases stock at the destination warehouse as a PO_RECEIPT movement referencing the PO.
- BR-PO7: Only DRAFT or ORDERED POs (no receipts yet) can be cancelled. PARTIALLY_RECEIVED cannot be cancelled.
- BR-PO8: Weighted average cost on receipt: new_avg = (total_qty_all_warehouses * avg + received_qty * line_unit_cost) / (total_qty + received_qty). If the total after is 0, avg stays unchanged. Rounded to 4 places.
- BR-PO9: A product appears at most once per PO.

## Transfers
- BR-T1: Source and destination warehouses must differ.
- BR-T2: Source stock must be >= quantity; otherwise 409.
- BR-T3: Source decrement (TRANSFER_OUT) and destination increment (TRANSFER_IN) happen atomically with both movements sharing the transfer reference.
- BR-T4: Transfers do not change average_cost.

## Adjustments
- BR-A1: Reason is one of DAMAGE, LOSS, RECOUNT, CORRECTION, OTHER; notes are required when reason is OTHER.
- BR-A2: Decrease cannot take stock below zero.
- BR-A3: Adjustments do not change average_cost.

## Low-Stock
- BR-L1: A product is low-stock when total quantity across warehouses <= reorder_level and the product is active.
- BR-L2: Computed on read; no stored alert state.

## History
- BR-H1: Filters (product, warehouse, type, date range) combine with AND; results sorted newest first and paginated.

## Reports
- BR-R1: Valuation = quantity x average_cost per product and warehouse, plus totals.
- BR-R2: Movement report requires a date range (from <= to).
- BR-R3: PO summary groups by supplier and status with count and total value (sum of quantity_ordered x unit_cost).
- BR-R4: Each report has a CSV variant with the same filters and columns.

## Dashboard
- BR-D1: Cards: total active products, total stock value, low-stock count, open POs (ORDERED + PARTIALLY_RECEIVED); recent 10 movements.

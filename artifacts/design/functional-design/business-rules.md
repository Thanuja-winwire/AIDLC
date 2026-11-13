# Business Rules: Inventory Management System

## Auth and Users
- BR-A1 Login requires an active user and a matching password; failure returns a generic "invalid credentials" error.
- BR-A2 Token carries user id and role, with expiry; expired/invalid token => 401; insufficient role => 403.
- BR-A3 Email unique (case-insensitive); password minimum 8 characters.
- BR-A4 An Admin cannot deactivate or demote themselves, nor the last active Admin (rejected with a clear error).
- BR-A5 Inactive users cannot log in; existing tokens are rejected on next request (active check per request).
- BR-A6 Default Admin seeded on first start only if no users exist.

## Catalog
- BR-C1 SKU unique (case-insensitive, trimmed). Name required.
- BR-C2 unit_cost, sale_price >= 0; reorder_level >= 0 integer.
- BR-C3 Products are deactivated, never deleted. Inactive products cannot be added to new POs, sales, transfers or adjustments; history remains visible.
- BR-C4 Category cannot be deleted while products reference it.
- BR-C5 Staff: read-only for products, categories, locations, suppliers.

## Locations and Stock
- BR-S1 Location code unique; a location cannot be deactivated while it holds non-zero stock or has open (Draft/Approved/Partial) POs targeting it.
- BR-S2 Stock changes only through StockLedger; each change locks the StockLevel row, creates it if absent (qty 0), applies delta, and writes a StockMovement with quantity_after.
- BR-S3 Resulting quantity < 0 is rejected (409 "insufficient stock") and the whole transaction rolls back.
- BR-S4 Movements are immutable; no update or delete.

## Suppliers
- BR-P1 Name required; email format validated if provided. Deactivated suppliers cannot receive new POs; existing POs unaffected.

## Purchase Orders
- BR-PO1 Only Admin creates, edits, approves and cancels. Staff and Admin may receive.
- BR-PO2 PO requires active supplier, active destination location, and at least one line; no duplicate product per PO; quantity > 0, unit_cost >= 0. Unit cost defaults from Product.unit_cost.
- BR-PO3 Lines are editable only in DRAFT.
- BR-PO4 Transitions: DRAFT -> APPROVED; DRAFT -> CANCELLED; APPROVED -> PARTIALLY_RECEIVED | RECEIVED | CANCELLED; PARTIALLY_RECEIVED -> RECEIVED | CANCELLED. All others rejected.
- BR-PO5 Receiving is allowed on APPROVED and PARTIALLY_RECEIVED POs. Per line, received qty in this receipt must be > 0 and <= (ordered - already received). Over-receipt is rejected. A receipt must contain at least one line with quantity > 0.
- BR-PO6 Each receipt adds PO_RECEIPT stock at the destination location via StockLedger. Status becomes RECEIVED when all lines are fully received, else PARTIALLY_RECEIVED.
- BR-PO7 Cancellation after partial receipt is allowed: received stock is kept, remaining quantities are closed, status = CANCELLED. RECEIVED POs cannot be cancelled.
- BR-PO8 Receiving does not change Product.unit_cost.

## Transfers
- BR-T1 Source and destination must differ and both be active; product active; quantity > 0 integer.
- BR-T2 Source must have at least the quantity (BR-S3). Creates TRANSFER_OUT and TRANSFER_IN movements in one transaction, same reference.
- BR-T3 Transfers are completed immediately and cannot be edited or deleted.
- BR-T4 Lock order: StockLevel rows locked in ascending (location_id) order to avoid deadlocks.

## Adjustments
- BR-AD1 Mode DELTA: non-zero signed integer. Mode COUNT: counted_quantity >= 0; delta = counted - current (locked read); a zero delta is rejected as "no change".
- BR-AD2 Reason required (DAMAGE, LOSS, RECOUNT, CORRECTION, OTHER); note required when reason is OTHER.
- BR-AD3 Result may not go below 0 (BR-S3). Recorded as ADJUSTMENT movement. Immutable.

## Sales
- BR-SA1 At least one line; no duplicate product per sale; quantity > 0; active products and active location.
- BR-SA2 unit_price defaults to Product.sale_price and may be edited per line (>= 0).
- BR-SA3 unit_cost_snapshot is copied from Product.unit_cost at sale time and never changes.
- BR-SA4 All lines must have sufficient stock at the location; otherwise the whole sale is rejected naming the offending products. Success decreases stock with SALE movements.
- BR-SA5 line_total = quantity x unit_price; sale total = sum of lines. Sales cannot be edited or deleted (no returns).

## Low-Stock Alerts
- BR-L1 Total view: product total quantity <= reorder_level (active products only). Per-location view: each StockLevel (active product, active location) quantity <= reorder_level.
- BR-L2 Products with reorder_level 0 alert only when stock is 0 (<= 0). Products with no stock rows count as total 0.
- BR-L3 Navigation badge shows the count for the total view. Computed on demand.

## Reports
- BR-R1 Revenue = sum(line_total); units = sum(quantity); estimated gross margin = sum(quantity x (unit_price - unit_cost_snapshot)).
- BR-R2 Date range inclusive; default last 30 days; start <= end. Optional location filter.
- BR-R3 Groupings: product, category, day, month. Top products ranked by revenue (default) or units, limit default 10.
- BR-R4 CSV export reflects the same filters and grouping as the screen.

## Dashboard
- BR-D1 Cards: active product count, total stock value (quantity x current unit_cost), low-stock count, open POs (APPROVED + PARTIALLY_RECEIVED), sales in last 7 days; recent activity = latest 10 movements/documents.

## Validation and Errors
- 400/422 validation field errors; 401 unauthenticated; 403 forbidden; 404 not found; 409 business conflict (insufficient stock, invalid state transition, duplicate SKU/email).
- Error body: `{ code, message, details? }`.

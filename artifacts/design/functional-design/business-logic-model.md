# Business Logic Model: Inventory Management System

All workflows run in one DB transaction; any failure rolls back documents, stock and movements together.

## 1. Login
1. Find user by email; reject if missing/inactive/password mismatch (BR-A1).
2. Issue JWT (user id, role, expiry); update last_login_at.

## 2. StockLedger.apply(product, location, delta, type, ref, user, note)
1. Select StockLevel FOR UPDATE (create with qty 0 if absent, handling concurrent insert).
2. new = qty + delta; if new < 0 -> InsufficientStock.
3. Save new qty; insert StockMovement(delta, quantity_after=new, type, ref, user).
Multi-row operations call apply in ascending (location_id, product_id) order.

## 3. Purchase Order lifecycle
```
DRAFT --approve--> APPROVED --receive(partial)--> PARTIALLY_RECEIVED --receive(rest)--> RECEIVED
DRAFT/APPROVED/PARTIALLY_RECEIVED --cancel--> CANCELLED
```
- Create: validate (BR-PO2), number from sequence, status DRAFT.
- Approve: Admin; DRAFT only; record approved_by/at.
- Receive(po, lines[{po_line_id, qty}]):
  1. Lock PO row; status must be APPROVED or PARTIALLY_RECEIVED.
  2. For each line: qty in 1..(ordered - received) else reject.
  3. Create PurchaseReceipt + lines; line.quantity_received += qty.
  4. StockLedger.apply(+qty, PO_RECEIPT) at destination.
  5. If all lines complete -> RECEIVED else PARTIALLY_RECEIVED.
- Cancel: Admin; not RECEIVED/CANCELLED; set CANCELLED, keep received stock.

## 4. Transfer
1. Validate (BR-T1). 2. Number TR-. 3. Apply -qty TRANSFER_OUT at source and +qty TRANSFER_IN at destination (locks in ascending location order). 4. Save StockTransfer.

## 5. Adjustment
1. Lock StockLevel. 2. DELTA: delta = input. COUNT: delta = counted - current; reject zero. 3. Apply ADJUSTMENT movement with reason/note. 4. Save StockAdjustment with computed delta.

## 6. Sale
1. Validate lines/location. 2. For each line: price = input or Product.sale_price; snapshot cost = Product.unit_cost. 3. Apply -qty SALE for each line (sorted by product_id); any shortage aborts whole sale with list of products. 4. Persist Sale (SO- number) and lines with totals.

## 7. Low-stock query
- Total view: group StockLevel by product, left-join active products; total <= reorder_level.
- Per-location view: StockLevel rows joined to active product/location where quantity <= reorder_level.
- Response includes product, location (if per-location), quantity, reorder_level, shortfall.

## 8. Reports
- Filter sales lines by date range and optional location; aggregate revenue, units, margin; group by product/category/day/month; top-N ordering; CSV serialization from the same aggregate.

## 9. Dashboard
Aggregate queries per BR-D1; each independent and cheap.

## 10. User administration
Create/edit/deactivate with lockout guard (BR-A4): before deactivate/demote, if target is the acting user or the only active Admin, reject.

## 11. Pagination and search
List endpoints accept page, page_size (default 20, max 100), q (text), and entity filters; return items + total.

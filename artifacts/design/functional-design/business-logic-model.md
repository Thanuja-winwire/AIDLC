# Business Logic Model: Inventory System

## 1. StockLedgerService.apply(product, warehouse, delta, type, ref)
1. Lock or create StockLevel (product, warehouse) with quantity 0 if absent.
2. new = quantity + delta. If new < 0 raise InsufficientStock (409).
3. Save StockLevel.quantity = new.
4. Insert StockMovement(type, delta, balance_after = new, ref, occurred_at = now).
Runs inside the caller's transaction.

## 2. Purchase Order lifecycle
```
DRAFT --place--> ORDERED --receive(partial)--> PARTIALLY_RECEIVED --receive(rest)--> RECEIVED
  |                 |  \--receive(all)------------------------------------------------^
  +--cancel--> CANCELLED <--cancel--+
```
- create: generate po_number, status DRAFT, validate lines (unique products, qty > 0).
- update (DRAFT only): replace supplier, warehouse, notes, lines.
- place: validate BR-PO3, status -> ORDERED, set ordered_at.
- receive(lines[{line_id, quantity}]), in one transaction:
  1. Status must be ORDERED or PARTIALLY_RECEIVED.
  2. For each line: check 0 < qty <= ordered - received.
  3. Compute new weighted average cost (BR-PO8) using total stock before the receipt.
  4. ledger.apply(+qty, PO_RECEIPT, PO); line.quantity_received += qty.
  5. Set status by BR-PO5; set closed_at if RECEIVED.
- cancel: BR-PO7, set CANCELLED and closed_at.

## 3. Transfer
create(product, source, dest, qty): validate BR-T1; in one transaction ledger.apply(source, -qty, TRANSFER_OUT) then ledger.apply(dest, +qty, TRANSFER_IN); store Transfer with number. Any failure rolls back everything.

## 4. Adjustment
create(product, warehouse, direction, qty, reason, notes): validate BR-A1; delta = +qty or -qty; ledger.apply(delta, ADJUSTMENT, adjustment); store Adjustment with number.

## 5. Low-Stock
```
SELECT product, SUM(quantity) total FROM stock_level
GROUP BY product HAVING total <= reorder_level   (active products; products with no stock rows count as total 0)
```
Used by `/stock/low`, dashboard count and the low-stock report.

## 6. Stock views
- By product: per-warehouse quantities plus total and low-stock flag.
- By warehouse: products with quantity, average cost, value. Filterable and paginated.

## 7. History query
Filter StockMovement by product, warehouse, type, date range; order occurred_at desc, id desc; paginate.

## 8. Reports
- Valuation: join StockLevel to Product; value = quantity x average_cost; group by product and warehouse; totals.
- Low-stock: shortfall = reorder_level - total.
- Movements: StockMovement within range, with type totals (in/out).
- PO summary: group PurchaseOrder by supplier and status.
- CSV: same queries streamed row by row with a header row.

## 9. Dashboard
Aggregates BR-D1 from the queries above in a single endpoint.

## 10. Error Handling
Domain exceptions: NotFound (404), Conflict/InsufficientStock/InvalidTransition (409), ValidationError (422). Any exception rolls back the request transaction, so no partial stock changes or history exist.

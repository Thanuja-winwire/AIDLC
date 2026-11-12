# Component Methods

Signatures only; detailed rules go in Functional Design. Types are Pydantic schemas; `Page[T]` is a paginated result.

## Products
- `list_products(q, category, active, page, size) -> Page[Product]`
- `get_product(id) -> Product`
- `create_product(data: ProductCreate) -> Product`
- `update_product(id, data: ProductUpdate) -> Product`
- `set_active(id, active) -> Product`
- `set_suppliers(id, supplier_ids) -> Product`

## Warehouses
- `list_warehouses(active, page, size) -> Page[Warehouse]`
- `create_warehouse(data) / update_warehouse(id, data) -> Warehouse`
- `get_warehouse_stock(id, page, size) -> Page[StockBalance]`

## Suppliers
- `list_suppliers(q, active, page, size) -> Page[Supplier]`
- `create_supplier(data) / update_supplier(id, data) -> Supplier`

## Stock
- `list_balances(product_id, warehouse_id, page, size) -> Page[StockBalance]`
- `get_product_stock(product_id) -> ProductStock` (total + per-warehouse)
- `list_low_stock(page, size) -> Page[LowStockItem]`
- `count_low_stock() -> int`

## Stock Ledger
- `apply_movement(product_id, warehouse_id, qty_change, type, reference_type, reference_id, note) -> StockMovement`
- `apply_transfer(product_id, from_wh, to_wh, qty, reference_id) -> (StockMovement, StockMovement)`
- Both run inside the caller's transaction/unit of work and raise `InsufficientStock` if the balance would go below zero.

## Purchase Orders
- `list_pos(status, supplier_id, page, size) -> Page[PurchaseOrder]`
- `get_po(id) -> PurchaseOrder`
- `create_po(data: POCreate) -> PurchaseOrder` (Draft)
- `update_po(id, data) -> PurchaseOrder` (Draft only)
- `place_order(id) -> PurchaseOrder`
- `receive(id, lines: list[ReceiveLine]) -> PurchaseOrder`
- `cancel(id) -> PurchaseOrder`

## Transfers
- `create_transfer(data: TransferCreate) -> Transfer`
- `list_transfers(page, size) -> Page[Transfer]`

## Adjustments
- `create_adjustment(data: AdjustmentCreate) -> Adjustment`
- `list_adjustments(page, size) -> Page[Adjustment]`

## History
- `list_movements(product_id, warehouse_id, type, date_from, date_to, page, size) -> Page[StockMovement]`

## Reports
- `valuation(warehouse_id?) -> list[ValuationRow]`
- `low_stock() -> list[LowStockItem]`
- `movements(date_from, date_to) -> list[StockMovement]`
- `po_summary(group_by: supplier|status) -> list[POSummaryRow]`
- `to_csv(rows) -> Iterator[str]` used by `/api/reports/<name>.csv` endpoints

## Dashboard
- `get_summary() -> DashboardSummary` (product count, stock value, low-stock count, open POs, recent movements)

## Frontend API Client
- One typed function per endpoint, e.g. `api.products.list(params)`, `api.purchaseOrders.receive(id, lines)`, `api.reports.csvUrl(name, params)`.
- React Query hooks: `useProducts`, `useCreateProduct`, `usePurchaseOrder`, `useReceivePO` etc.; mutations invalidate the related stock, history and dashboard queries.

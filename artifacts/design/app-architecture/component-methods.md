# Component Methods

Business rules are detailed in Functional Design. Types are indicative.

## StockLedger
- `apply_change(session, product_id, location_id, delta: int, movement_type, user_id, reference_type, reference_id, note=None) -> StockMovement` : lock row, validate non-negative, update, record movement
- `apply_changes(session, changes: list[StockChange]) -> list[StockMovement]` : batch in deterministic lock order
- `get_quantity(product_id, location_id) -> int`

## auth-users
- `login(email, password) -> TokenResponse`
- `create_user / update_user / deactivate_user / list_users` (Admin)
- `get_current_user(token) -> User`
- `seed_default_admin()`

## catalog
- `list_products(q, category_id, active, page, size) -> Page[Product]`
- `create_product / update_product / deactivate_product / get_product`
- `list_categories / create_category / update_category`

## locations-stock
- `list_locations / create_location / update_location`
- `list_stock(product_id?, location_id?, page, size) -> Page[StockLevel]`
- `list_movements(filters, page, size) -> Page[StockMovement]`

## suppliers
- `list_suppliers / create_supplier / update_supplier / get_supplier`

## purchasing
- `create_po(supplier_id, location_id, lines) -> PurchaseOrder` (Draft)
- `update_draft_po / approve_po / cancel_po`
- `receive_po(po_id, receipts: list[ReceiptLine], user) -> PurchaseOrder` : uses StockLedger, updates status
- `list_pos / get_po`

## stock-operations
- `create_transfer(product_id, from_location, to_location, qty, user) -> Transfer`
- `list_transfers(filters, page, size)`
- `create_adjustment(product_id, location_id, delta, reason, note, user) -> Adjustment`
- `list_adjustments(filters, page, size)`

## sales
- `create_sale(location_id, customer_name?, lines, user) -> SalesOrder`
- `list_sales / get_sale`

## insights
- `get_low_stock(scope: total|location, location_id?) -> list[LowStockItem]`
- `get_low_stock_count() -> int`
- `get_dashboard() -> DashboardSummary`
- `sales_report(date_from, date_to, location_id?, group_by: day|month|product|category) -> SalesReport`
- `top_products(date_from, date_to, limit)`
- `export_sales_csv(params) -> StreamingResponse`

## numbering
- `next_number(kind: PO|SO|TR) -> str`

## Frontend hooks (TanStack Query)
`useProducts, useProduct, useSuppliers, usePOs, useReceivePO, useStock, useMovements, useTransfers, useAdjustments, useSales, useLowStock, useDashboard, useSalesReport, useUsers`, plus `useAuth()` from auth context (`user, isAdmin, login, logout`).

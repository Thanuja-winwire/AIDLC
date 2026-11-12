# Frontend Components: Inventory System

## Styling
Tailwind CSS with a small custom component set (Button, Input, Select, Card, Badge, Table, Modal, Toast, Spinner/Skeleton, EmptyState, PageHeader, Pagination). Indigo primary accent, slate neutrals, semantic green/amber/red/blue. Responsive layout with sidebar collapsing to a drawer on small screens; lucide icons; designed empty, loading and error states for every list and form; filled primary vs outlined secondary vs red destructive buttons.

## Hierarchy
```
App (QueryClientProvider, Router, ToastProvider)
 +- AppLayout (Sidebar, Topbar, low-stock badge)
     +- DashboardPage
     +- ProductsPage / ProductFormModal
     +- WarehousesPage / WarehouseFormModal
     +- SuppliersPage / SupplierFormModal
     +- StockPage (tabs: By product | By warehouse)
     +- PurchaseOrdersPage, PurchaseOrderDetailPage, PurchaseOrderFormPage, ReceiveDialog
     +- TransfersPage / TransferFormModal
     +- AdjustmentsPage / AdjustmentFormModal
     +- LowStockPage
     +- HistoryPage
     +- ReportsPage (tabs: Valuation | Low stock | Movements | PO summary)
```

## Pages: state, interactions, API
| Component | State | Interactions | Endpoints |
|---|---|---|---|
| DashboardPage | server state | cards, alert list, recent movements | GET /api/dashboard |
| ProductsPage | search, category, includeInactive, page | create, edit, deactivate/reactivate | /api/products |
| WarehousesPage | includeInactive | create, edit, deactivate, view stock | /api/warehouses, /api/stock?warehouse_id |
| SuppliersPage | search, includeInactive | CRUD, link products | /api/suppliers |
| StockPage | tab, filters | view totals, per-warehouse breakdown | /api/stock |
| PurchaseOrderFormPage | draft lines | add/remove lines, save draft, place | /api/purchase-orders |
| PurchaseOrderDetailPage | PO | place, cancel, receive | /place, /cancel, /receive |
| ReceiveDialog | per-line qty | max = ordered - received | POST /receive |
| TransfersPage | form | pick product, source, destination, qty | /api/transfers |
| AdjustmentsPage | form | direction, qty, reason, notes | /api/adjustments |
| LowStockPage | page | link to create PO | GET /api/stock/low |
| HistoryPage | product, warehouse, type, date range, page | filter | GET /api/history |
| ReportsPage | tab, filters | view, CSV download | /api/reports/* and .csv |

## Form Validation (mirrors server)
- Required: SKU, name, unit, warehouse code/name, supplier name, PO supplier/warehouse/lines.
- Numbers: quantities > 0, max 3 decimals; cost and reorder level >= 0.
- Transfer: source != destination; quantity not above source stock (hint, server authoritative).
- Adjustment: notes required when reason is Other.
- Server 409/422 messages shown inline or as toasts.

## Data Layer
Typed API client with a base URL `/api` (Vite proxy to port 8000); React Query hooks per resource; mutations invalidate stock, history, dashboard and low-stock queries.

## Status Badges
PO status colors: Draft slate, Ordered blue, Partially Received amber, Received green, Cancelled red. Low-stock rows show an amber badge.

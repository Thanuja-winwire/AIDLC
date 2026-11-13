# Frontend Components: Inventory Management System

## Styling approach
Tailwind CSS with a small custom UI kit (Button, Input, Select, Card, Badge, Modal, Table, Pagination, Toast, Spinner/Skeleton, EmptyState, ErrorState). Indigo primary accent, slate neutral scale, semantic green/amber/red/blue; Inter font; lucide-react icons; cards with subtle borders/shadows; filled primary vs outlined secondary vs red destructive buttons; responsive layout with collapsible sidebar. Every list has loading skeleton, designed empty state and error state with retry.

## Hierarchy
```
App
 +- AuthProvider (token, user, role; Axios interceptor adds JWT, 401 -> logout)
 +- QueryClientProvider (TanStack Query)
 +- Router
     +- LoginPage
     +- ProtectedLayout (Sidebar, Topbar w/ user menu, low-stock badge)
         +- RoleGate (hides/disables admin-only UI)
         +- DashboardPage
         +- ProductsPage / ProductFormModal
         +- CategoriesPanel
         +- LocationsPage (Admin write)
         +- StockPage (levels, movements tabs)
         +- SuppliersPage / SupplierFormModal
         +- PurchaseOrdersPage / PurchaseOrderDetailPage / PurchaseOrderForm / ReceiveDialog
         +- TransfersPage / TransferForm
         +- AdjustmentsPage / AdjustmentForm
         +- SalesPage / SaleForm
         +- AlertsPage (Total | Per location toggle)
         +- ReportsPage (filters, charts, tables, CSV export)
         +- UsersPage (Admin only)
```

## Pages: state, interactions, endpoints
| Page | Key state | Interactions | Endpoints |
|---|---|---|---|
| Login | email, password, error | submit, show error | POST /auth/login, GET /auth/me |
| Dashboard | server data | cards link to pages | GET /dashboard |
| Products | q, category, page, modal | search, filter, create/edit/deactivate (Admin) | GET/POST /products, PUT/PATCH /products/{id}, GET/POST /categories |
| Locations | list, modal | CRUD (Admin) | /locations |
| Stock | product/location filters, tab | view levels and movements | GET /stock, GET /stock/movements |
| Suppliers | q, page, modal | CRUD (Admin) | /suppliers |
| Purchase Orders | status filter, detail | create draft, edit lines, approve, cancel (Admin); receive (all) | /purchase-orders, /{id}/approve, /{id}/cancel, /{id}/receive |
| Transfers | form, history | choose product, from/to, qty; shows available stock | POST/GET /transfers, GET /stock |
| Adjustments | mode (Delta/Count), form | toggle mode; shows current qty and computed delta | POST/GET /adjustments |
| Sales | line items, location | add lines, price prefilled and editable, totals, stock errors inline | POST/GET /sales |
| Alerts | view (total/per-location) | toggle view | GET /alerts?view= |
| Reports | date range, location, group-by | apply, view charts, export CSV | GET /reports/sales, /reports/sales/export |
| Users | list, modal | create, edit, deactivate with lockout error shown | /users |

## Form validation (client, mirrors backend)
- Required fields; numbers >= 0; quantities positive integers; SKU trimmed; email format; password >= 8.
- PO/sale: at least one line, no duplicate products; receive qty <= remaining; transfer from != to and qty <= available (hint only, server authoritative).
- Adjustment: reason required; note required for OTHER; zero delta blocked.
- Server 409/422 errors are surfaced as field or banner messages.

## Role handling
Staff: Create/Edit/Delete buttons on products, locations, suppliers, PO create/approve/cancel, and Users nav are hidden; Receive, transfers, adjustments, sales remain. Backend remains authoritative.

## Data/UX conventions
- TanStack Query keys per resource; mutations invalidate stock, alerts, dashboard and related lists.
- Tables paginated server-side; toasts for success; confirm modal for destructive actions.
- Reports charts: bar (by product/category), line (by day/month) with accessible tables.

# Unit of Work

## Unit 1: Inventory System
A single deployable application in one repository.

### Responsibilities
- Products, warehouses, suppliers and their links (FR-1, FR-2, FR-4)
- Stock levels per product and warehouse (FR-3)
- Purchase orders and goods receipt (FR-5)
- Stock transfers (FR-6) and adjustments (FR-7)
- Low-stock alerts (FR-8), stock history ledger (FR-9)
- Reports with CSV export (FR-10) and dashboard (FR-11)

### Code Organization
- `backend/` FastAPI app, split into modules: products, warehouses, suppliers, stock, purchase_orders, transfers, adjustments, alerts, history, reports
- `frontend/` React app with one area per module plus a dashboard
- Single repository

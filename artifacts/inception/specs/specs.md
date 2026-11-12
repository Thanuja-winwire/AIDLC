# Specification: Inventory Management System

## 1. Overview
A web application to manage products, stock levels, suppliers, purchase orders, stock transfers and inventory adjustments across multiple warehouses, with low-stock alerts, stock history and reports.

## 2. Decisions (from clarifying questions)
- **Stack**: Python (FastAPI) backend + React web frontend; SQLite for dev, PostgreSQL-compatible (via SQLAlchemy).
- **Access control**: None. Single open application, no login or roles.
- **Alerts**: In-app only (dashboard alerts and a low-stock list). No email.
- **Workflow type**: Simple.

## 3. Functional Requirements

### FR-1 Products
- CRUD for products: SKU (unique), name, description, category, unit of measure, unit cost, reorder level (low-stock threshold), active flag.
- Search and filter by name/SKU/category.

### FR-2 Warehouses
- CRUD for warehouses: name, code (unique), location/address, active flag.
- View stock held per warehouse.

### FR-3 Stock Levels
- Stock tracked per product per warehouse (quantity on hand).
- View stock by product (across warehouses) and by warehouse.
- Quantity may never go negative.

### FR-4 Suppliers
- CRUD for suppliers: name, contact person, email, phone, address, active flag.
- Optionally link products to suppliers.

### FR-5 Purchase Orders
- Create PO for a supplier with line items (product, quantity, unit cost) and destination warehouse.
- Statuses: Draft, Ordered, Partially Received, Received, Cancelled.
- Receive goods (full or partial) which increases stock at the destination warehouse and records stock history.
- Only Draft/Ordered POs can be cancelled.

### FR-6 Stock Transfers
- Transfer quantity of a product from a source warehouse to a different destination warehouse.
- Validates sufficient source stock; atomically decrements source and increments destination; records history for both.

### FR-7 Inventory Adjustments
- Manual adjustment (increase or decrease) of a product's stock in a warehouse with a required reason (e.g. damage, loss, recount, correction) and notes.
- Cannot reduce stock below zero.

### FR-8 Low-Stock Alerts
- A product is low-stock when its total (or per-warehouse) quantity is at or below its reorder level.
- Dashboard shows alert count and a list of low-stock items; a dedicated low-stock list page.

### FR-9 Stock History
- Immutable ledger of every stock movement: timestamp, product, warehouse, movement type (PO receipt, transfer out, transfer in, adjustment), quantity change, resulting balance, reference (PO/transfer/adjustment id).
- Filterable by product, warehouse, type and date range.

### FR-10 Reports
- Current stock valuation (quantity x unit cost) by product and warehouse.
- Low-stock report.
- Stock movement report for a date range.
- Purchase order summary by supplier/status.
- CSV export of reports.

### FR-11 Dashboard
- Summary cards: total products, total stock value, low-stock count, open purchase orders; recent movements.

## 4. Non-Functional Requirements
- **Data integrity**: stock changes and history entries written in a single transaction.
- **Validation**: server-side validation with clear error messages; unique SKU/codes.
- **Performance**: list endpoints paginated; responsive for datasets of tens of thousands of products.
- **Usability**: modern, responsive, polished UI with designed empty/loading/error states.
- **API**: REST JSON API with auto-generated OpenAPI docs.
- **Testing**: automated backend tests covering stock logic (receipts, transfers, adjustments, low-stock).
- **Security**: no authentication by scope; input validation and parameterised queries still required.

## 5. Out of Scope
- Authentication/roles, email or push notifications, barcode scanning, multi-currency, sales orders/customer management, batch/serial/expiry tracking.

## 6. Assumptions
- Single currency; single tenant.
- Stock transfers complete immediately (no in-transit state).
- Purchase orders are numbered automatically.

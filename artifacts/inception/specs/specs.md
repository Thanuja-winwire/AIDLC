# Specification: Inventory Management System

## 1. Overview
A full-stack web application for managing products, multi-location stock, suppliers, purchase orders, transfers, adjustments, sales, low-stock alerts and sales reports.

**Workflow type**: Simple. **Project type**: Greenfield.

## 2. Technology Stack
- Frontend: React (SPA), modern component styling
- Backend: Python FastAPI (REST, OpenAPI docs)
- Database: PostgreSQL (SQLAlchemy ORM + Alembic migrations)
- Auth: JWT (access tokens), password hashing (bcrypt)

## 3. Roles and Permissions
| Capability | Admin | Staff |
|---|---|---|
| Manage users | Yes | No |
| Manage products, categories, locations | Yes | View only |
| Manage suppliers | Yes | View only |
| Create / approve POs | Yes | No (view only) |
| Receive POs | Yes | Yes |
| Stock adjustments | Yes | Yes |
| Stock transfers | Yes | Yes |
| Record sales | Yes | Yes |
| View stock, alerts, reports | Yes | Yes |

## 4. Functional Requirements
### FR-1 Authentication and Users
- Login with email/password, returns JWT; protected endpoints require a valid token.
- Role-based access enforced in the backend and reflected in the UI (hidden or disabled actions).
- Admin can create, edit and deactivate users and assign a role.
- A default Admin is seeded on first start.

### FR-2 Product Management
- CRUD for products: SKU (unique), name, description, category, unit of measure, unit cost, sale price, reorder level, active flag.
- Search, filter by category and pagination. Products are deactivated, not hard-deleted.

### FR-3 Locations and Stock Tracking
- Multiple warehouses/locations (Admin-managed).
- Stock quantity tracked per product per location.
- Every change to stock writes an immutable stock movement record (type: PO receipt, sale, transfer out/in, adjustment; quantity delta; user; timestamp; reference).
- Stock never goes negative; such operations are rejected.

### FR-4 Supplier Management
- CRUD for suppliers: name, contact person, email, phone, address, active flag. Admin only for write operations.

### FR-5 Purchase Orders
- Admin creates a PO for a supplier with line items (product, quantity, unit cost) and destination location.
- Status lifecycle: Draft -> Approved (Admin) -> Partially Received / Received; Cancelled.
- Admin or Staff can receive items (full or partial) against an approved PO, which increases stock at the destination location.

### FR-6 Stock Transfers
- Move quantity of a product from one location to another (different locations only), with validation of available stock.
- Atomic operation creating transfer-out and transfer-in movements; transfer history is viewable.

### FR-7 Inventory Adjustments
- Increase or decrease stock at a location with a mandatory reason (e.g. damage, loss, recount, correction) and note.
- Recorded as stock movements and history is viewable.

### FR-8 Sales
- Record sales orders: line items (product, quantity, unit price), source location, optional customer name.
- Recording a sale decreases stock atomically; insufficient stock is rejected.

### FR-9 Low-Stock Alerts
- A product is low-stock when its total quantity (or quantity per location) is at or below its reorder level.
- Dashboard widget and dedicated alerts list, with an alert count badge in the navigation. Computed on demand (no email notifications).

### FR-10 Sales Reports
- Sales by date range, with totals (revenue, units, estimated gross margin using unit cost).
- Breakdown by product, category and day/month; top-selling products.
- Filter by location. Export to CSV.

### FR-11 Dashboard
- Summary cards: total products, total stock value, low-stock count, open POs, recent sales; recent activity.

## 5. Non-Functional Requirements
- **Security**: bcrypt password hashing, JWT with expiry, server-side RBAC, input validation (Pydantic), CORS restricted to configured origins, secrets via environment variables.
- **Data integrity**: stock-changing operations run in database transactions with row locking to avoid race conditions.
- **Performance**: list endpoints paginated; typical responses under 500 ms at small-business scale (up to ~50k products).
- **Usability**: responsive, polished UI with clear loading, empty and error states.
- **Maintainability**: layered backend (routers, services, models), automated tests for core business logic, Docker Compose for local run (frontend, backend, PostgreSQL).

## 6. Out of Scope
Barcode scanning, email/SMS notifications, multi-currency, multi-tenant, customer/invoice management, payment processing, SSO.

## 7. Assumptions
- Single currency, single organization.
- Batch/lot and serial tracking not required.
- Sales are simple internal transactions without returns.

## 8. Traceability
- Multi-location stock per location (Q1-A) -> FR-3, FR-6
- Built-in sales transactions (Q2-A) -> FR-8, FR-10
- Role split (Q3-A) -> Section 3, FR-1

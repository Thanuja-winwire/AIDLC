# Components

Single unit: inventory-management-system. Backend layering: Routers -> Services -> Repositories -> Models. All stock changes go through StockLedger.

## Backend (FastAPI)
| Component | Responsibility |
|---|---|
| core | Config, DB session, security (JWT, bcrypt), RBAC dependencies (`require_admin`, `current_user`), error handling, pagination, CSV helper |
| auth-users | Login, token issue, user CRUD, default admin seed |
| catalog | Products and categories CRUD, search/filter |
| locations-stock | Locations CRUD, stock levels per product/location, movement history. Hosts **StockLedger** |
| suppliers | Supplier CRUD |
| purchasing | PO lifecycle (draft, approve, receive, cancel) |
| stock-operations | Transfers and adjustments |
| sales | Sales orders |
| insights | Low-stock alerts, dashboard, sales reports and CSV export |
| numbering | DB sequences for PO-/SO-/TR- numbers |

Each module has: router, schemas (Pydantic), service, repository, models.

## StockLedger (central stock component)
The only code allowed to modify stock quantities. Locks stock rows (SELECT ... FOR UPDATE, ordered by id to avoid deadlocks), rejects negative results, writes an immutable StockMovement for every change, and runs inside the caller's transaction.

## Frontend (React)
| Component | Responsibility |
|---|---|
| app shell | React Router routes, layout, sidebar with low-stock badge, protected routes |
| auth context | Token storage, current user, role helpers, Axios interceptor (401 -> logout) |
| api layer | Axios client and TanStack Query hooks per module |
| ui kit | Tailwind-based Button, Input, Select, Table, Modal, Badge, Card, Toast, EmptyState, Skeleton, Pagination |
| feature pages | Login, Dashboard, Products, Locations, Stock, Suppliers, Purchase Orders, Transfers, Adjustments, Sales, Alerts, Reports, Users |

## Data store
PostgreSQL, Alembic migrations, sequences for document numbers.

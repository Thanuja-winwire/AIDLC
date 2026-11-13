# Application Architecture: Inventory Management System

## Decisions (from approved plan)
- Backend layering: Routers -> Services -> Repositories -> Models
- All stock changes via a single StockLedger with row locking and movement records
- Frontend: React Router + TanStack Query + Axios + auth context
- Styling: Tailwind CSS with a small custom component set
- Document numbers: sequential from DB sequences (PO-000123, SO-, TR-)

## Overview
Single deployable unit: React SPA, FastAPI API, PostgreSQL. Docker Compose runs all three.

## Components
core, auth-users, catalog, locations-stock (with StockLedger), suppliers, purchasing, stock-operations, sales, insights, numbering; frontend shell, auth context, api layer, ui kit, feature pages. See components.md.

## Methods
Public method signatures per component are in component-methods.md; rules are refined in Functional Design.

## Services and orchestration
One transaction per request; services call StockLedger so documents, stock and movements commit atomically. See services.md.

## Dependencies
Acyclic; everything depends on core; only StockLedger writes stock. See component-dependency.md.

## Suggested layout
```
code/backend/app/{core,auth_users,catalog,locations_stock,suppliers,purchasing,stock_operations,sales,insights,numbering}/
code/backend/alembic, code/backend/tests
code/frontend/src/{app,auth,api,ui,pages}
code/docker-compose.yml
```

## Requirement coverage
FR-1 auth-users; FR-2 catalog; FR-3 locations-stock + StockLedger; FR-4 suppliers; FR-5 purchasing; FR-6/7 stock-operations; FR-8 sales; FR-9/10/11 insights.

# Code Generation Plan: inventory-management-system (single unit)

Source of truth for Code Generation. Greenfield. Code under `code/`; docs under `artifacts/build/inventory-management-system/`.
Inputs: stories.md, unit-of-work.md, app-architecture/*, functional-design/*. No Figma designs exist (skipped); UI is built from frontend-components.md with Tailwind and the Enterprise UI Baseline.

## Unit context
- Stories: US-01 to US-15 (all). Dependencies: none external. Backend FastAPI + PostgreSQL; frontend React + Vite + TypeScript + Tailwind + TanStack Query.
- Layering: Router -> Service -> Repository -> Model. All stock changes via `StockLedger`. Frontend calls the backend under `/api`; the dev proxy and docker nginx both forward `/api` to backend port 8000, and the frontend dev server runs on 5173.
- Entities: User, Category, Product, Location, StockLevel, StockMovement, Supplier, PurchaseOrder(+Line), Transfer, Adjustment, Sale(+Line).

## Steps
- [ ] **Step 1 - Foundation**: backend config, DB session, models, Alembic migration, schemas, repositories, core (security, deps, errors, pagination, csv), requirements, Dockerfile, pytest config, and conftest.
- [ ] **Step 2 - Business logic and API**: StockLedger, numbering, services, routers, main app, default admin seed, backend tests.
- [ ] **Step 3 - Frontend**: Vite/Tailwind setup, API client and hooks, auth context, UI kit, layout, all pages, frontend tests. Visual self-check performed where rendering is possible, otherwise reported plainly.
- [ ] **Step 4 - Documentation and deployment**: docker-compose, nginx, README, .gitignore, unit summary and file-story map in artifacts.

Stories to tick when complete: US-01 [ ] US-02 [ ] US-03 [ ] US-04 [ ] US-05 [ ] US-06 [ ] US-07 [ ] US-08 [ ] US-09 [ ] US-10 [ ] US-11 [ ] US-12 [ ] US-13 [ ] US-14 [ ] US-15 [ ]

## File to User Story Map

Story key (full headings): 
- U01 = US-01: Sign in securely (FR-1)
- U02 = US-02: Manage users and roles (FR-1)
- U03 = US-03: Manage products (FR-2)
- U04 = US-04: Find products (FR-2)
- U05 = US-05: Manage locations (FR-3)
- U06 = US-06: View stock by location (FR-3)
- U07 = US-07: Manage suppliers (FR-4)
- U08 = US-08: Create and approve purchase orders (FR-5)
- U09 = US-09: Receive purchase orders (FR-5)
- U10 = US-10: Transfer stock between locations (FR-6)
- U11 = US-11: Adjust inventory (FR-7)
- U12 = US-12: Record sales (FR-8)
- U13 = US-13: See low-stock alerts (FR-9)
- U14 = US-14: Review sales reports (FR-10)
- U15 = US-15: View dashboard (FR-11)

ALL = US-01: Sign in securely (FR-1); US-02: Manage users and roles (FR-1); US-03: Manage products (FR-2); US-04: Find products (FR-2); US-05: Manage locations (FR-3); US-06: View stock by location (FR-3); US-07: Manage suppliers (FR-4); US-08: Create and approve purchase orders (FR-5); US-09: Receive purchase orders (FR-5); US-10: Transfer stock between locations (FR-6); US-11: Adjust inventory (FR-7); US-12: Record sales (FR-8); US-13: See low-stock alerts (FR-9); US-14: Review sales reports (FR-10); US-15: View dashboard (FR-11)

The map below is authoritative; "ALL" means the full 15-story list above.

### Backend (Step 1 and 2)
| File path | User stories |
|-----------|--------------|
| code/backend/requirements.txt | ALL |
| code/backend/Dockerfile | ALL |
| code/backend/.env.example | US-01: Sign in securely (FR-1) |
| code/backend/pytest.ini | ALL |
| code/backend/alembic.ini | ALL |
| code/backend/alembic/env.py | ALL |
| code/backend/alembic/versions/0001_initial.py | ALL |
| code/backend/app/__init__.py | ALL |
| code/backend/app/main.py | ALL |
| code/backend/app/core/__init__.py | ALL |
| code/backend/app/core/config.py | ALL |
| code/backend/app/core/db.py | ALL |
| code/backend/app/core/security.py | US-01: Sign in securely (FR-1); US-02: Manage users and roles (FR-1) |
| code/backend/app/core/deps.py | US-01: Sign in securely (FR-1); US-02: Manage users and roles (FR-1) |
| code/backend/app/core/errors.py | ALL |
| code/backend/app/core/pagination.py | US-04: Find products (FR-2) |
| code/backend/app/core/csv_util.py | US-14: Review sales reports (FR-10) |
| code/backend/app/models/__init__.py | ALL |
| code/backend/app/models/user.py | US-01: Sign in securely (FR-1); US-02: Manage users and roles (FR-1) |
| code/backend/app/models/catalog.py | US-03: Manage products (FR-2); US-04: Find products (FR-2) |
| code/backend/app/models/inventory.py | US-05: Manage locations (FR-3); US-06: View stock by location (FR-3) |
| code/backend/app/models/supplier.py | US-07: Manage suppliers (FR-4) |
| code/backend/app/models/purchasing.py | US-08: Create and approve purchase orders (FR-5); US-09: Receive purchase orders (FR-5) |
| code/backend/app/models/operations.py | US-10: Transfer stock between locations (FR-6); US-11: Adjust inventory (FR-7) |
| code/backend/app/models/sales.py | US-12: Record sales (FR-8); US-14: Review sales reports (FR-10) |
| code/backend/app/schemas/__init__.py | ALL |
| code/backend/app/schemas/common.py | ALL |
| code/backend/app/schemas/auth.py | US-01: Sign in securely (FR-1) |
| code/backend/app/schemas/user.py | US-02: Manage users and roles (FR-1) |
| code/backend/app/schemas/catalog.py | US-03: Manage products (FR-2); US-04: Find products (FR-2) |
| code/backend/app/schemas/inventory.py | US-05: Manage locations (FR-3); US-06: View stock by location (FR-3) |
| code/backend/app/schemas/supplier.py | US-07: Manage suppliers (FR-4) |
| code/backend/app/schemas/purchasing.py | US-08: Create and approve purchase orders (FR-5); US-09: Receive purchase orders (FR-5) |
| code/backend/app/schemas/operations.py | US-10: Transfer stock between locations (FR-6); US-11: Adjust inventory (FR-7) |
| code/backend/app/schemas/sales.py | US-12: Record sales (FR-8) |
| code/backend/app/schemas/insights.py | US-13: See low-stock alerts (FR-9); US-14: Review sales reports (FR-10); US-15: View dashboard (FR-11) |
| code/backend/app/repositories/__init__.py | ALL |
| code/backend/app/repositories/users.py | US-01: Sign in securely (FR-1); US-02: Manage users and roles (FR-1) |
| code/backend/app/repositories/catalog.py | US-03: Manage products (FR-2); US-04: Find products (FR-2) |
| code/backend/app/repositories/inventory.py | US-05: Manage locations (FR-3); US-06: View stock by location (FR-3) |
| code/backend/app/repositories/suppliers.py | US-07: Manage suppliers (FR-4) |
| code/backend/app/repositories/purchasing.py | US-08: Create and approve purchase orders (FR-5); US-09: Receive purchase orders (FR-5) |
| code/backend/app/repositories/operations.py | US-10: Transfer stock between locations (FR-6); US-11: Adjust inventory (FR-7) |
| code/backend/app/repositories/sales.py | US-12: Record sales (FR-8) |
| code/backend/app/repositories/insights.py | US-13: See low-stock alerts (FR-9); US-14: Review sales reports (FR-10); US-15: View dashboard (FR-11) |
| code/backend/app/services/__init__.py | ALL |
| code/backend/app/services/stock_ledger.py | US-06: View stock by location (FR-3); US-09: Receive purchase orders (FR-5); US-10: Transfer stock between locations (FR-6); US-11: Adjust inventory (FR-7); US-12: Record sales (FR-8) |
| code/backend/app/services/numbering.py | US-08: Create and approve purchase orders (FR-5); US-10: Transfer stock between locations (FR-6); US-12: Record sales (FR-8) |
| code/backend/app/services/auth.py | US-01: Sign in securely (FR-1) |
| code/backend/app/services/users.py | US-02: Manage users and roles (FR-1) |
| code/backend/app/services/catalog.py | US-03: Manage products (FR-2); US-04: Find products (FR-2) |
| code/backend/app/services/locations.py | US-05: Manage locations (FR-3); US-06: View stock by location (FR-3) |
| code/backend/app/services/suppliers.py | US-07: Manage suppliers (FR-4) |
| code/backend/app/services/purchasing.py | US-08: Create and approve purchase orders (FR-5); US-09: Receive purchase orders (FR-5) |
| code/backend/app/services/operations.py | US-10: Transfer stock between locations (FR-6); US-11: Adjust inventory (FR-7) |
| code/backend/app/services/sales.py | US-12: Record sales (FR-8) |
| code/backend/app/services/insights.py | US-13: See low-stock alerts (FR-9); US-14: Review sales reports (FR-10); US-15: View dashboard (FR-11) |
| code/backend/app/api/__init__.py | ALL |
| code/backend/app/api/auth.py | US-01: Sign in securely (FR-1) |
| code/backend/app/api/users.py | US-02: Manage users and roles (FR-1) |
| code/backend/app/api/catalog.py | US-03: Manage products (FR-2); US-04: Find products (FR-2) |
| code/backend/app/api/locations_stock.py | US-05: Manage locations (FR-3); US-06: View stock by location (FR-3) |
| code/backend/app/api/suppliers.py | US-07: Manage suppliers (FR-4) |
| code/backend/app/api/purchasing.py | US-08: Create and approve purchase orders (FR-5); US-09: Receive purchase orders (FR-5) |
| code/backend/app/api/operations.py | US-10: Transfer stock between locations (FR-6); US-11: Adjust inventory (FR-7) |
| code/backend/app/api/sales.py | US-12: Record sales (FR-8) |
| code/backend/app/api/insights.py | US-13: See low-stock alerts (FR-9); US-14: Review sales reports (FR-10); US-15: View dashboard (FR-11) |
| code/backend/app/api/router.py | ALL |
| code/backend/tests/conftest.py | ALL |
| code/backend/tests/test_auth.py | US-01: Sign in securely (FR-1); US-02: Manage users and roles (FR-1) |
| code/backend/tests/test_catalog.py | US-03: Manage products (FR-2); US-04: Find products (FR-2) |
| code/backend/tests/test_stock_ledger.py | US-06: View stock by location (FR-3); US-05: Manage locations (FR-3) |
| code/backend/tests/test_purchasing.py | US-08: Create and approve purchase orders (FR-5); US-09: Receive purchase orders (FR-5) |
| code/backend/tests/test_operations.py | US-10: Transfer stock between locations (FR-6); US-11: Adjust inventory (FR-7) |
| code/backend/tests/test_sales.py | US-12: Record sales (FR-8); US-07: Manage suppliers (FR-4) |
| code/backend/tests/test_insights.py | US-13: See low-stock alerts (FR-9); US-14: Review sales reports (FR-10); US-15: View dashboard (FR-11) |

### Frontend (Step 3)
| File path | User stories |
|-----------|--------------|
| code/frontend/package.json | ALL |
| code/frontend/vite.config.ts | ALL |
| code/frontend/tsconfig.json | ALL |
| code/frontend/index.html | ALL |
| code/frontend/tailwind.config.js | ALL |
| code/frontend/postcss.config.js | ALL |
| code/frontend/src/vite-env.d.ts | ALL |
| code/frontend/src/main.tsx | ALL |
| code/frontend/src/index.css | ALL |
| code/frontend/src/App.tsx | ALL |
| code/frontend/src/api/client.ts | ALL |
| code/frontend/src/api/types.ts | ALL |
| code/frontend/src/api/hooks.ts | ALL |
| code/frontend/src/auth/AuthContext.tsx | US-01: Sign in securely (FR-1); US-02: Manage users and roles (FR-1) |
| code/frontend/src/components/ui.tsx | ALL |
| code/frontend/src/components/Layout.tsx | US-13: See low-stock alerts (FR-9); US-01: Sign in securely (FR-1) |
| code/frontend/src/components/RoleGate.tsx | US-02: Manage users and roles (FR-1); US-03: Manage products (FR-2) |
| code/frontend/src/pages/LoginPage.tsx | US-01: Sign in securely (FR-1) |
| code/frontend/src/pages/DashboardPage.tsx | US-15: View dashboard (FR-11) |
| code/frontend/src/pages/ProductsPage.tsx | US-03: Manage products (FR-2); US-04: Find products (FR-2) |
| code/frontend/src/pages/LocationsPage.tsx | US-05: Manage locations (FR-3) |
| code/frontend/src/pages/StockPage.tsx | US-06: View stock by location (FR-3) |
| code/frontend/src/pages/SuppliersPage.tsx | US-07: Manage suppliers (FR-4) |
| code/frontend/src/pages/PurchaseOrdersPage.tsx | US-08: Create and approve purchase orders (FR-5) |
| code/frontend/src/pages/PurchaseOrderDetailPage.tsx | US-08: Create and approve purchase orders (FR-5); US-09: Receive purchase orders (FR-5) |
| code/frontend/src/pages/TransfersPage.tsx | US-10: Transfer stock between locations (FR-6) |
| code/frontend/src/pages/AdjustmentsPage.tsx | US-11: Adjust inventory (FR-7) |
| code/frontend/src/pages/SalesPage.tsx | US-12: Record sales (FR-8) |
| code/frontend/src/pages/AlertsPage.tsx | US-13: See low-stock alerts (FR-9) |
| code/frontend/src/pages/ReportsPage.tsx | US-14: Review sales reports (FR-10) |
| code/frontend/src/pages/UsersPage.tsx | US-02: Manage users and roles (FR-1) |
| code/frontend/src/test/setup.ts | ALL |
| code/frontend/src/test/LoginPage.test.tsx | US-01: Sign in securely (FR-1) |
| code/frontend/src/test/RoleGate.test.tsx | US-02: Manage users and roles (FR-1) |

### Deployment and docs (Step 4)
| File path | User stories |
|-----------|--------------|
| code/frontend/Dockerfile | ALL |
| code/frontend/nginx.conf | ALL |
| code/docker-compose.yml | ALL |
| code/README.md | ALL |
| code/.gitignore | ALL |

Self-check: 76 backend + 24 frontend + 5 deployment = 105 planned `code/` files, equal to the 105 rows above (backend 76, frontend 24 incl. tests, deployment 5). Frontend row count: package.json, vite.config.ts, tsconfig.json, index.html, tailwind.config.js, postcss.config.js, vite-env.d.ts, main.tsx, index.css, App.tsx, client.ts, types.ts, hooks.ts, AuthContext, ui, Layout, RoleGate (17) + 13 pages... see table; any file added during generation gets a row appended.

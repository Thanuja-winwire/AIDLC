# Code Generation Plan — ecommerce-app

Single unit: FastAPI backend (`code/backend`) + React/Vite frontend (`code/frontend`) in one repository. Sources: app-architecture.md, business-logic-model.md, business-rules.md, domain-entities.md, stories.md. No Figma links exist, so the UI is built from the functional design under the Enterprise UI Baseline (Tailwind + lucide-react).

## Unit context
- Stories: all 15 (US-1 to US-15).
- Dependencies: PostgreSQL (docker-compose provided). The frontend calls the backend at `/api/v1`; the Vite dev server proxies `/api` to `http://localhost:8000`, and the backend allows CORS from `http://localhost:5173`.
- Decisions: tables are created with `Base.metadata.create_all` on startup (no Alembic, to keep the Simple scope small); `seed.py` creates the admin, categories and products.
- Note: US-13 says an admin cannot deactivate or demote themselves, but the approved BR-M6 says there are no such restrictions. The code follows BR-M6, the later and more specific decision.
- Tests are written here and run in Verify. Nothing is run in this stage.

## Steps
- [ ] **Step 1 — Foundation**: backend config, DB session, models, schemas, repositories, security/deps/errors, requirements, env example, seed script, docker-compose, .gitignore.
- [ ] **Step 2 — Business logic and API**: services (auth, catalog, cart, payment, orders/checkout, admin), routers (public and admin), app entrypoint, pytest suites.
- [ ] **Step 3 — Frontend**: Vite/Tailwind setup, API client, contexts, UI kit, layouts, route guards, all customer and admin pages, validators, Vitest tests.
- [ ] **Step 4 — Documentation**: README and unit summary.

## File to User Story Map

Story labels: A = US-1: Register and log in (FR-1); B = US-2: Manage profile (FR-1); C = US-3: Browse products (FR-2); D = US-4: View product detail (FR-2); E = US-5: Search products (FR-3); F = US-6: Filter and sort products (FR-3); G = US-7: Manage cart (FR-4); H = US-8: Checkout with shipping details (FR-5); I = US-9: Pay for an order (FR-6); J = US-10: Track orders (FR-7); K = US-11: Admin dashboard metrics (FR-8); L = US-12: Manage products (FR-8); M = US-13: Manage users (FR-8); N = US-14: Responsive, validated UI (FR-9); O = US-15: Manage orders (FR-8). The table below uses the full headings.

### Backend (Step 1)

| File path | User stories |
|-----------|--------------|
| code/backend/requirements.txt | US-1: Register and log in (FR-1); US-14: Responsive, validated UI (FR-9) |
| code/backend/.env.example | US-1: Register and log in (FR-1) |
| code/backend/pytest.ini | US-14: Responsive, validated UI (FR-9) |
| code/backend/app/__init__.py | US-14: Responsive, validated UI (FR-9) |
| code/backend/app/core/__init__.py | US-14: Responsive, validated UI (FR-9) |
| code/backend/app/core/config.py | US-1: Register and log in (FR-1) |
| code/backend/app/core/database.py | US-14: Responsive, validated UI (FR-9) |
| code/backend/app/core/security.py | US-1: Register and log in (FR-1) |
| code/backend/app/core/deps.py | US-1: Register and log in (FR-1); US-11: Admin dashboard metrics (FR-8) |
| code/backend/app/core/errors.py | US-14: Responsive, validated UI (FR-9) |
| code/backend/app/models.py | US-1: Register and log in (FR-1); US-3: Browse products (FR-2); US-7: Manage cart (FR-4); US-8: Checkout with shipping details (FR-5); US-9: Pay for an order (FR-6); US-10: Track orders (FR-7) |
| code/backend/app/schemas/__init__.py | US-14: Responsive, validated UI (FR-9) |
| code/backend/app/schemas/auth.py | US-1: Register and log in (FR-1); US-2: Manage profile (FR-1) |
| code/backend/app/schemas/product.py | US-3: Browse products (FR-2); US-12: Manage products (FR-8) |
| code/backend/app/schemas/cart.py | US-7: Manage cart (FR-4) |
| code/backend/app/schemas/order.py | US-8: Checkout with shipping details (FR-5); US-9: Pay for an order (FR-6); US-10: Track orders (FR-7); US-15: Manage orders (FR-8) |
| code/backend/app/schemas/admin.py | US-11: Admin dashboard metrics (FR-8); US-13: Manage users (FR-8) |
| code/backend/app/repositories/__init__.py | US-14: Responsive, validated UI (FR-9) |
| code/backend/app/repositories/user_repo.py | US-1: Register and log in (FR-1); US-13: Manage users (FR-8) |
| code/backend/app/repositories/product_repo.py | US-3: Browse products (FR-2); US-5: Search products (FR-3); US-6: Filter and sort products (FR-3); US-12: Manage products (FR-8) |
| code/backend/app/repositories/cart_repo.py | US-7: Manage cart (FR-4) |
| code/backend/app/repositories/order_repo.py | US-10: Track orders (FR-7); US-15: Manage orders (FR-8) |
| code/backend/seed.py | US-1: Register and log in (FR-1); US-3: Browse products (FR-2) |
| code/docker-compose.yml | US-14: Responsive, validated UI (FR-9) |
| code/.gitignore | US-14: Responsive, validated UI (FR-9) |

### Backend business logic and API (Step 2)

| File path | User stories |
|-----------|--------------|
| code/backend/app/services/__init__.py | US-14: Responsive, validated UI (FR-9) |
| code/backend/app/services/auth_service.py | US-1: Register and log in (FR-1); US-2: Manage profile (FR-1) |
| code/backend/app/services/catalog_service.py | US-3: Browse products (FR-2); US-4: View product detail (FR-2); US-5: Search products (FR-3); US-6: Filter and sort products (FR-3) |
| code/backend/app/services/cart_service.py | US-7: Manage cart (FR-4) |
| code/backend/app/services/payment_service.py | US-9: Pay for an order (FR-6) |
| code/backend/app/services/order_service.py | US-8: Checkout with shipping details (FR-5); US-9: Pay for an order (FR-6); US-10: Track orders (FR-7); US-15: Manage orders (FR-8) |
| code/backend/app/services/admin_service.py | US-11: Admin dashboard metrics (FR-8); US-12: Manage products (FR-8); US-13: Manage users (FR-8); US-15: Manage orders (FR-8) |
| code/backend/app/routers/__init__.py | US-14: Responsive, validated UI (FR-9) |
| code/backend/app/routers/auth.py | US-1: Register and log in (FR-1); US-2: Manage profile (FR-1) |
| code/backend/app/routers/products.py | US-3: Browse products (FR-2); US-4: View product detail (FR-2); US-5: Search products (FR-3); US-6: Filter and sort products (FR-3) |
| code/backend/app/routers/cart.py | US-7: Manage cart (FR-4) |
| code/backend/app/routers/orders.py | US-8: Checkout with shipping details (FR-5); US-9: Pay for an order (FR-6); US-10: Track orders (FR-7) |
| code/backend/app/routers/admin.py | US-11: Admin dashboard metrics (FR-8); US-12: Manage products (FR-8); US-13: Manage users (FR-8); US-15: Manage orders (FR-8) |
| code/backend/app/main.py | US-14: Responsive, validated UI (FR-9) |
| code/backend/tests/__init__.py | US-14: Responsive, validated UI (FR-9) |
| code/backend/tests/conftest.py | US-14: Responsive, validated UI (FR-9) |
| code/backend/tests/test_auth.py | US-1: Register and log in (FR-1); US-2: Manage profile (FR-1) |
| code/backend/tests/test_catalog_cart.py | US-3: Browse products (FR-2); US-5: Search products (FR-3); US-6: Filter and sort products (FR-3); US-7: Manage cart (FR-4) |
| code/backend/tests/test_checkout_orders.py | US-8: Checkout with shipping details (FR-5); US-9: Pay for an order (FR-6); US-10: Track orders (FR-7) |
| code/backend/tests/test_admin.py | US-11: Admin dashboard metrics (FR-8); US-12: Manage products (FR-8); US-13: Manage users (FR-8); US-15: Manage orders (FR-8) |

### Frontend (Step 3)

| File path | User stories |
|-----------|--------------|
| code/frontend/package.json | US-14: Responsive, validated UI (FR-9) |
| code/frontend/vite.config.js | US-14: Responsive, validated UI (FR-9) |
| code/frontend/index.html | US-14: Responsive, validated UI (FR-9) |
| code/frontend/tailwind.config.js | US-14: Responsive, validated UI (FR-9) |
| code/frontend/postcss.config.js | US-14: Responsive, validated UI (FR-9) |
| code/frontend/.env.example | US-14: Responsive, validated UI (FR-9) |
| code/frontend/src/index.css | US-14: Responsive, validated UI (FR-9) |
| code/frontend/src/main.jsx | US-14: Responsive, validated UI (FR-9) |
| code/frontend/src/App.jsx | US-14: Responsive, validated UI (FR-9) |
| code/frontend/src/api/client.js | US-1: Register and log in (FR-1); US-14: Responsive, validated UI (FR-9) |
| code/frontend/src/api/endpoints.js | US-1: Register and log in (FR-1); US-3: Browse products (FR-2); US-7: Manage cart (FR-4); US-8: Checkout with shipping details (FR-5); US-10: Track orders (FR-7); US-12: Manage products (FR-8) |
| code/frontend/src/context/AuthContext.jsx | US-1: Register and log in (FR-1); US-2: Manage profile (FR-1) |
| code/frontend/src/context/CartContext.jsx | US-7: Manage cart (FR-4) |
| code/frontend/src/context/ToastContext.jsx | US-14: Responsive, validated UI (FR-9) |
| code/frontend/src/components/ui.jsx | US-14: Responsive, validated UI (FR-9); US-3: Browse products (FR-2) |
| code/frontend/src/components/Layout.jsx | US-14: Responsive, validated UI (FR-9); US-5: Search products (FR-3) |
| code/frontend/src/components/ProductCard.jsx | US-3: Browse products (FR-2) |
| code/frontend/src/routes/guards.jsx | US-1: Register and log in (FR-1); US-11: Admin dashboard metrics (FR-8) |
| code/frontend/src/utils/validators.js | US-1: Register and log in (FR-1); US-8: Checkout with shipping details (FR-5); US-9: Pay for an order (FR-6); US-14: Responsive, validated UI (FR-9) |
| code/frontend/src/utils/format.js | US-10: Track orders (FR-7); US-14: Responsive, validated UI (FR-9) |
| code/frontend/src/pages/ProductList.jsx | US-3: Browse products (FR-2); US-5: Search products (FR-3); US-6: Filter and sort products (FR-3) |
| code/frontend/src/pages/ProductDetail.jsx | US-4: View product detail (FR-2); US-7: Manage cart (FR-4) |
| code/frontend/src/pages/Login.jsx | US-1: Register and log in (FR-1) |
| code/frontend/src/pages/Register.jsx | US-1: Register and log in (FR-1) |
| code/frontend/src/pages/Cart.jsx | US-7: Manage cart (FR-4) |
| code/frontend/src/pages/Checkout.jsx | US-8: Checkout with shipping details (FR-5); US-9: Pay for an order (FR-6) |
| code/frontend/src/pages/Orders.jsx | US-10: Track orders (FR-7) |
| code/frontend/src/pages/OrderDetail.jsx | US-10: Track orders (FR-7); US-9: Pay for an order (FR-6) |
| code/frontend/src/pages/Profile.jsx | US-2: Manage profile (FR-1) |
| code/frontend/src/pages/NotFound.jsx | US-14: Responsive, validated UI (FR-9) |
| code/frontend/src/pages/admin/Dashboard.jsx | US-11: Admin dashboard metrics (FR-8) |
| code/frontend/src/pages/admin/Products.jsx | US-12: Manage products (FR-8) |
| code/frontend/src/pages/admin/Users.jsx | US-13: Manage users (FR-8) |
| code/frontend/src/pages/admin/Orders.jsx | US-15: Manage orders (FR-8) |
| code/frontend/src/pages/admin/OrderDetail.jsx | US-15: Manage orders (FR-8) |
| code/frontend/src/setupTests.js | US-14: Responsive, validated UI (FR-9) |
| code/frontend/src/utils/validators.test.js | US-1: Register and log in (FR-1); US-9: Pay for an order (FR-6) |
| code/frontend/src/components/ui.test.jsx | US-14: Responsive, validated UI (FR-9) |

### Documentation (Step 4)

| File path | User stories |
|-----------|--------------|
| code/README.md | US-14: Responsive, validated UI (FR-9) |

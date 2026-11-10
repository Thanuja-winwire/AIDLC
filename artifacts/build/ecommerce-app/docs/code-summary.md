# Code Summary — ecommerce-app

**Backend** (`code/backend`): FastAPI layered as routers (`public`, `admin`) → services (`catalog_auth`, `cart_service`, `order_service`, `admin_service`, `payment_gateway`) → SQLAlchemy models. JWT auth, bcrypt, transactional checkout with row locks, mock payment gateway behind an interface, forward-only order status, soft-delete products. Seed script and pytest API suite included.

**Frontend** (`code/frontend`): Vite + React, Tailwind + lucide-react, Axios client with Bearer interceptor, AuthContext/CartContext, shared UI kit, route guards, customer pages (catalog, detail, auth, cart, checkout, orders, profile) and admin pages (dashboard, products, users, orders). Vitest tests for validators and UI kit.

**Decisions**: tables via `create_all` (no Alembic); BR-M6 followed (no admin self-protection) over US-13's wording; Vite dev proxy `/api` → `localhost:8000`.

**Deviation from plan**: services are consolidated into fewer files (auth and catalog share `catalog_auth.py`; one `models.py`, one `schemas.py`) rather than one file per class as in the original map.

Stories covered: US-1 to US-15.

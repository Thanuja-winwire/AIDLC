# Code Generation Plan — ecommerce-app

Stories: US-1 to US-15. All files live under `code/`. The file-by-file map is in `build/ecommerce-app/code/file-story-map.md`.

- [x] Step 1: Backend foundation — config, database, security, deps, models, schemas, seed, requirements, docker-compose
- [x] Step 2: Business logic and API — services (catalog/auth, cart, order, admin, payment gateway), routers (public, admin), main, pytest suite
- [x] Step 3: Frontend — Vite, Tailwind, Axios client, contexts, UI kit, guards, customer pages, admin pages, Vitest tests
- [x] Step 4: Documentation — README, code summary

## File to User Story Map (summary)
| Area | Files | Stories |
|---|---|---|
| Auth | core/security.py, core/deps.py, services/catalog_auth.py, pages/Auth.jsx, Profile.jsx | US-1 to US-3 |
| Catalog | services/catalog_auth.py, routers/public.py, pages/ProductList.jsx, ProductDetail.jsx | US-4 to US-6 |
| Cart | services/cart_service.py, pages/Cart.jsx, context/CartContext.jsx | US-7, US-8 |
| Checkout/Payment | services/order_service.py, services/payment_gateway.py, pages/Checkout.jsx | US-9, US-10 |
| Orders | services/order_service.py, pages/Orders.jsx | US-11, US-12 |
| Admin | services/admin_service.py, routers/admin.py, pages/admin/* | US-13 to US-15 |

Note: files are consolidated relative to the original draft (for example `models.py` and `schemas.py` are single modules).

# Application Architecture — ecommerce-app

Consolidates `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`.

## Decisions (from approved plan)
- Backend layering: routers -> services -> repositories -> SQLAlchemy models.
- Frontend state: React Context + hooks (AuthContext, CartContext).
- JWT storage: memory + localStorage, Bearer header via Axios interceptor.
- API: versioned `/api/v1`, admin under `/api/v1/admin`.

## Context diagram
```
+------------------+   HTTP/JSON    +--------------------+   SQL    +------------+
| React SPA (Vite) | -------------> | FastAPI backend    | -------> | PostgreSQL |
| Context + Axios  |   /api/v1      | routers/services/  |          |            |
+------------------+                | repositories       |          +------------+
                                    | MockPaymentGateway |
                                    +--------------------+
```

## Proposed layout
```
code/backend/app/{core,models,schemas,repositories,services,routers,routers/admin}
code/backend/{alembic,tests,seed.py}
code/frontend/src/{api,context,components,pages,pages/admin,routes,utils}
```

## Data model
User(id, email, password_hash, name, role, is_active) ; Category ; Product(category_id, price, stock, image_url) ; Cart(user_id) -> CartItem ; Order(user_id, status, shipping fields, subtotal, shipping, total) -> OrderItem(price snapshot) ; Payment(order_id, status, amount, reference).

## Cross-cutting
- Security: bcrypt, JWT expiry, `require_admin` dependency, CORS limited to frontend origin, env-based config.
- Validation: Pydantic server-side, shared validators client-side, field-level error mapping.
- Integrity: transactional order placement; stock check constraint (>= 0).
- Performance: pagination everywhere; indexes on product name, category, price, FKs.
- UI: one styling approach throughout, responsive, designed loading/empty/error states.
- Testing: pytest for services and API; Vitest + RTL for components.

## Traceability
FR-1 auth; FR-2/3 catalog; FR-4 cart; FR-5/7 order; FR-6 payment; FR-8 admin; FR-9 schemas + UI kit + validation.

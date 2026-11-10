# Component Dependencies — ecommerce-app

## Backend

| From | Depends on |
|---|---|
| Routers | Services, schemas, core deps (auth) |
| Services | Repositories, core security, PaymentProvider |
| Repositories | SQLAlchemy models, DB session |
| PaymentService | OrderRepository (updates order status) |
| OrderService | CartRepository, ProductRepository |

## Frontend

| From | Depends on |
|---|---|
| Pages | Contexts, API modules, UI kit, validation |
| Contexts | API modules |
| API modules | Axios instance (Bearer interceptor, 401 handling) |
| Routing | AuthContext |

## Communication
- Frontend -> backend: JSON over HTTP at `/api/v1`; Vite dev server proxies `/api` to the backend (port 8000), so CORS is also restricted to the frontend origin.
- Backend -> PostgreSQL: SQLAlchemy; schema managed by Alembic.
- No external services (mock payment is in-process).

## Data flow: checkout
```
Cart page -> POST /orders -> OrderService (txn: stock, order, clear cart)
          -> POST /orders/{id}/pay -> PaymentService -> MockPaymentGateway
          -> order paid | payment_failed (retry allowed) -> Order detail timeline
```

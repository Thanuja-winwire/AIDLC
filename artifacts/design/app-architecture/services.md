# Services — ecommerce-app

| Service | Orchestrates | Notes |
|---|---|---|
| AuthService | UserRepository, security | Issues JWTs |
| CatalogService | ProductRepository | Read-only; query filters built in repository |
| CartService | CartRepository, ProductRepository | Validates stock on every mutation |
| OrderService | OrderRepository, CartRepository, ProductRepository | Owns the placement transaction (row locks on products) |
| PaymentService | PaymentRepository, OrderRepository, PaymentProvider | Provider injected via dependency, swappable for Stripe |
| AdminService | All repositories | Enforces status transitions and self-protection rules |

Routers are thin: parse and validate with Pydantic, call a service, return a schema. Services receive a DB session through FastAPI dependencies and commit at the service boundary. Errors are domain exceptions mapped to HTTP responses with field-level details (422 validation, 401/403 auth, 404, 409 conflicts such as insufficient stock).

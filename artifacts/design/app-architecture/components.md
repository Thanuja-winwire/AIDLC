# Components — ecommerce-app

## Backend (FastAPI, layered: routers -> services -> repositories -> models)

| Component | Responsibility |
|---|---|
| core (config, security, deps, db) | Env settings, DB session, password hashing, JWT encode/decode, `get_current_user`, `require_admin` |
| auth module | Register, login, profile (FR-1) |
| catalog module | Product list/detail, search, filters, sort, categories (FR-2, FR-3) |
| cart module | Server-side cart per user with stock validation (FR-4) |
| checkout/order module | Order creation from cart, transactional stock decrement, order history and tracking (FR-5, FR-7) |
| payment module | `PaymentProvider` interface, `MockPaymentGateway`, payment records, retry (FR-6) |
| admin module | Metrics, product/user/order management under `/api/v1/admin` (FR-8) |
| schemas | Pydantic request/response validation (FR-9) |
| models | SQLAlchemy: User, Category, Product, Cart, CartItem, Order, OrderItem, Payment |
| migrations / seed | Alembic migrations, admin and sample data seed script |

## Frontend (React + Vite, JavaScript)

| Component | Responsibility |
|---|---|
| api layer | Axios instance, Bearer interceptor, per-domain API modules, error normalisation |
| AuthContext | User, token (memory + localStorage), login/logout/register |
| CartContext | Cart state and operations, item count |
| routing | React Router, `ProtectedRoute`, `AdminRoute` |
| Layout and UI kit | Navbar, footer, buttons, inputs, cards, spinner/skeleton, empty/error states, toasts |
| Pages (public) | Home/Products, ProductDetail, Login, Register |
| Pages (customer) | Cart, Checkout, Payment result, Orders, OrderDetail (timeline), Profile |
| Pages (admin) | Dashboard, Products, Users, Orders management |
| validation | Form validators shared by forms |

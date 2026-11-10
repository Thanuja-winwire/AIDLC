# Specification — E-commerce Application

## 1. Overview
Full-stack e-commerce web application (greenfield, Simple workflow).

**Stack**: React + JavaScript (frontend), FastAPI + Python (backend), PostgreSQL (database).

## 2. Decisions from Clarifying Questions
| # | Topic | Decision |
|---|-------|----------|
| 1 | Payments | Mock/simulated payment gateway behind a provider interface (no external account); swappable for Stripe later |
| 2 | Authentication | JWT access tokens, email/password, role-based access (customer, admin) |
| 3 | Deployment | Local development only; docker-compose for PostgreSQL optional |

## 3. Functional Requirements

### FR-1 User Authentication
- Register, login, logout, view/update profile.
- Passwords hashed (bcrypt); JWT bearer tokens with expiry.
- Roles: `customer`, `admin`. Admin endpoints and routes are role-protected.

### FR-2 Product Listings
- Paginated product list and product detail page (name, description, price, image URL, category, stock).

### FR-3 Search and Filters
- Keyword search on name/description.
- Filters: category, price range, in-stock only.
- Sorting: price asc/desc, newest.

### FR-4 Shopping Cart
- Add, update quantity, remove, clear items.
- Cart persisted server-side per authenticated user.
- Quantity validated against stock.

### FR-5 Checkout
- Shipping address entry and validation.
- Order summary (subtotal, shipping, total).
- Order created from cart; stock decremented transactionally; cart cleared on success.

### FR-6 Payment Integration (Mock)
- Payment service with a provider interface and a mock gateway.
- Simulated outcomes: success, or failure (e.g., specific test card numbers).
- Payment record stored and linked to the order; failed payment leaves order as `payment_failed` and allows retry.

### FR-7 Order Tracking
- Customer order history and order detail.
- Status lifecycle: `pending` → `paid` → `processing` → `shipped` → `delivered`; also `cancelled`, `payment_failed`.
- Status timeline shown to the customer.

### FR-8 Admin Dashboard
- Summary metrics (total orders, revenue, users, low stock).
- Products: create, edit, delete, manage stock.
- Users: list, view, activate/deactivate, change role.
- Orders: list/filter by status, view details, update status.

### FR-9 UI and Validation
- Responsive UI (mobile, tablet, desktop).
- Client-side form validation and server-side validation (Pydantic) with clear field-level error messages.
- Designed loading, empty, and error states.

## 4. Non-Functional Requirements
- **Security**: bcrypt hashing, JWT expiry, RBAC on server, input validation, CORS restricted to the frontend origin, parameterized queries via ORM, no secrets in code (env config).
- **Performance**: pagination on all lists; indexes on product search/filter fields and foreign keys.
- **Data integrity**: transactional order placement; stock cannot go negative.
- **Usability**: responsive, accessible forms, consistent visual design.
- **Maintainability**: layered backend (routers, services, repositories/models, schemas); DB migrations via Alembic.
- **Testing**: backend unit/API tests (pytest); frontend component tests (Vitest/RTL).

## 5. Technical Approach (summary)
- Backend: FastAPI, SQLAlchemy, Alembic, Pydantic, python-jose/PyJWT, passlib/bcrypt.
- Frontend: React (Vite), React Router, Axios, a single consistent styling approach.
- Database: PostgreSQL with entities User, Category, Product, Cart, CartItem, Order, OrderItem, Payment.
- Local dev: frontend dev server proxies to the backend; optional docker-compose for PostgreSQL only.

## 6. Out of Scope
- Real payment processors, email/SMS notifications, production deployment/CI-CD infrastructure, multi-currency, product reviews, coupons, image upload storage (image URLs only).

## 7. Assumptions
- Single currency (USD), single warehouse.
- Shipping cost is a flat rate.
- The first admin is created via a seed script.

# Components

Decisions applied: Router -> Service -> Repository per module; scheduler calls `SubscriptionService.renew`; React Router + TanStack Query + Axios; `PaymentGateway` interface with `SimulatedGateway`.

## Backend API unit (FastAPI, PostgreSQL)

| Component | Responsibility | Interfaces |
|---|---|---|
| Core/Config | Env settings, DB session, JWT and password utilities, error format, CORS | `Settings`, `get_db`, `create_access_token`, `hash_password` |
| Auth module | Registration, login, current user, role guard, admin seeding | `/auth/*`; `get_current_user`, `require_admin` |
| Plans module | Plan CRUD (admin), active plan listing | `/plans`, `/admin/plans` |
| Subscriptions module | Subscribe, upgrade/downgrade with proration, renew, cancel, status transitions | `/subscriptions/*`; `SubscriptionService` |
| Billing module | Invoice creation and numbering, payment attempts, payment method (brand, last4) | `BillingService`; `/invoices`, `/payments`, `/payment-method` |
| Gateway | `PaymentGateway` interface and `SimulatedGateway` (test-card failures) | `charge(card, amount) -> GatewayResult` |
| Scheduler | APScheduler job finding due subscriptions and invoking renewal | `run_renewals()` |
| Analytics module | MRR, churn, revenue over time, per-plan counts, failed payments | `/admin/analytics/*` |
| Admin module | Customer and subscription search, all invoices and payments, manual renewal trigger | `/admin/*` |
| Repositories | One per entity (User, Plan, Subscription, Invoice, Payment) over SQLAlchemy | CRUD and query methods |
| Models/Migrations | SQLAlchemy models, Alembic migrations, seed data | |

## Frontend App unit (React)

| Component | Responsibility |
|---|---|
| API client | Axios instance, JWT auth interceptor, 401 handling |
| Auth context and route guards | Token storage, current user, `ProtectedRoute`, `AdminRoute` |
| Query hooks | TanStack Query hooks per resource, with mutation invalidation |
| Layout/UI kit | App shell, navigation, buttons, cards, tables, badges, empty/loading/error states |
| Public pages | Login, Register |
| Customer pages | Plans, My Subscription (upgrade, renew, cancel), Invoices (list/detail/print), Payment History, Payment Method |
| Admin pages | Analytics Dashboard, Plan Management, Customers/Subscriptions, All Invoices and Payments |

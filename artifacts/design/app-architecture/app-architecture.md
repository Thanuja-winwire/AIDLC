# Application Architecture (Consolidated)

Sources: `specs.md`, `stories.md`, approved `app-architecture-plan.md`. Details in `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`.

## Style
Two units. A layered modular monolith backend (FastAPI) and a React SPA frontend, joined by a REST/JWT contract, run locally via Docker Compose with PostgreSQL.

## Backend (unit 1)
- Modules: auth, plans, subscriptions, billing, analytics, admin. Each has a router, service and repository.
- Cross-cutting: core (config, DB, JWT, errors), `PaymentGateway` interface with `SimulatedGateway`, and the APScheduler renewal job.
- Key decision: `SubscriptionService.renew` is the single renewal path for the scheduler, the customer "renew now" action and the admin trigger.
- Key decision: the gateway is injected into `BillingService`, so `SimulatedGateway` can be swapped for a real provider.
- Integrity: Decimal money, Alembic migrations, one transaction per subscribe, upgrade or renewal.
- Security: bcrypt, JWT expiry, role dependencies, Pydantic validation, CORS limited to the frontend origin, only brand and last4 stored.

## Frontend (unit 2)
- React Router, TanStack Query, Axios client with auth interceptor.
- Auth context with `ProtectedRoute` and `AdminRoute`.
- A shared UI kit, applied consistently, with designed empty, loading and error states.
- Pages: Login, Register, Plans, My Subscription, Invoices, Payment History, Payment Method, and the admin screens (Analytics, Plans, Customers, Invoices/Payments).

## Overview diagram

```
+-----------+   REST + JWT   +---------------------------+   +------------+
| React SPA | -------------> | FastAPI routers           |   | PostgreSQL |
| (Query,   |                |  -> services -> repos ----+-->|            |
|  Axios)   |                |  Billing -> PaymentGateway|   +------------+
+-----------+                |  Scheduler -> renew()     |
                             +---------------------------+
```

## Story coverage
Onboarding -> Auth. Subscribing, plan changes, renewals and cancellations -> Subscriptions and Billing. Invoices and payments -> Billing. Administration -> Plans, Admin and Analytics.

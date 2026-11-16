# Services and Orchestration

Layering: Router (validation, auth) -> Service (business rules, transactions) -> Repository (SQLAlchemy). Routers never touch repositories directly.

## SubscriptionService (orchestrator)
Coordinates PlanRepository, SubscriptionRepository, BillingService.
- **subscribe**: check no active subscription -> create invoice -> charge -> on success activate, on failure leave not activated. One DB transaction.
- **change_plan**: compute proration -> invoice -> charge if amount > 0 -> update plan, cycle date unchanged.
- **renew**: single entry point for scheduler, "renew now" and the admin trigger. Creates invoice and charges. Success extends the period; failure sets `past_due`. Cancel-at-period-end subscriptions are not renewed and become cancelled.
- **cancel**: immediate or at period end.

## BillingService
Owns invoice numbering, line items, payment records and the stored payment method (brand and last4 only). Receives a `PaymentGateway` by dependency injection (`SimulatedGateway` by default), so a real provider can replace it without changing callers.

## Scheduler
APScheduler runs inside the API process at a configurable interval. It holds no business logic: it calls `SubscriptionService.find_due` and `renew` per subscription, each in its own transaction so one failure does not stop the batch.

## AnalyticsService
Read-only aggregate queries over subscriptions, invoices and payments. No writes.

## AuthService
Password hashing, JWT issue, admin seeding at startup. Role checks are enforced by router dependencies.

## Frontend orchestration
TanStack Query owns server state. Mutations such as subscribe, change, renew and cancel invalidate the subscription, invoice and payment queries. The Axios interceptor attaches the JWT and redirects to login on 401.

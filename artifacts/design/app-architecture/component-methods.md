# Component Methods

Signatures only; detailed rules (proration formula, state transitions) come in Functional Design.

## Backend services

**AuthService**
- `register(email, password, name) -> User`
- `authenticate(email, password) -> TokenResponse`
- `seed_admin() -> None`

**PlanService**
- `list_active() -> list[Plan]`
- `create(data) -> Plan`
- `update(plan_id, data) -> Plan`
- `deactivate(plan_id) -> Plan`

**SubscriptionService**
- `get_current(user_id) -> Subscription | None`
- `subscribe(user_id, plan_id, card) -> Subscription`
- `change_plan(user_id, new_plan_id) -> Subscription`
- `renew(subscription_id) -> Subscription`: shared by scheduler, customer and admin
- `cancel(user_id, at_period_end: bool) -> Subscription`
- `find_due(now) -> list[Subscription]`

**BillingService**
- `create_invoice(subscription, line_items, period) -> Invoice`
- `charge_invoice(invoice, payment_method) -> Payment`
- `list_invoices(user_id | None, page) -> Page[Invoice]`
- `get_invoice(invoice_id, user) -> Invoice`
- `list_payments(user_id | None, page) -> Page[Payment]`
- `save_payment_method(user_id, card) -> PaymentMethod`

**PaymentGateway** (interface)
- `charge(card_number, amount, currency) -> GatewayResult(status, reference, failure_reason)`

**AnalyticsService**
- `summary(period) -> AnalyticsSummary` (MRR, active, new, cancelled, churn, failed payments)
- `revenue_series(period, granularity) -> list[Point]`
- `subscribers_per_plan() -> list[PlanCount]`

**AdminService**
- `search_customers(query, page) -> Page[CustomerSummary]`
- `trigger_renewal(subscription_id) -> Subscription`

**Scheduler**
- `run_renewals() -> RenewalReport`: calls `find_due`, then `renew` per item, in isolated transactions
- `expire_cancelled() -> int`

## Frontend
- `api.auth.login/register/me`
- `api.plans.list/create/update/deactivate`
- `api.subscriptions.current/subscribe/change/renew/cancel`
- `api.invoices.list/get`, `api.payments.list`, `api.paymentMethod.get/save`
- `api.admin.analytics/customers/invoices/payments/renew`
- Hooks: `useCurrentSubscription`, `usePlans`, `useInvoices`, `usePayments`, `useAnalytics`, and mutation hooks that invalidate related queries.

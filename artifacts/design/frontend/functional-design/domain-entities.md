# Domain Entities — Frontend App

Client-side TypeScript view models mirroring the backend API responses. Money is a string (decimal) in API responses and is formatted for display, never used in floating-point arithmetic.

## Entities

**User**: `id`, `email`, `name`, `role` (`customer` | `admin`)

**AuthState**: `token: string | null`, `user: User | null`, `status` (`loading` | `authenticated` | `anonymous`)

**Plan**: `id`, `name`, `description`, `price` (string), `currency`, `interval` (`monthly` | `yearly`), `is_active`, `subscriber_count?` (admin only)

**Subscription**: `id`, `plan` (Plan summary), `status` (`active` | `past_due` | `cancelled` | `expired`), `price_at_subscription`, `current_period_start`, `current_period_end`, `cancel_at_period_end`, `cancelled_at?`, `renewal_attempts`, `is_due` (derived by server or client from the period end)

**PlanChangePreview**: `kind` (`upgrade_prorated` | `downgrade_no_charge` | `interval_change_full_charge`), `amount_due_now` (string), `new_plan`, `new_price`, `new_period_end`, `explanation`

**PaymentMethod**: `brand`, `last4`, `exp_month?`, `exp_year?` (the raw number and CVC are never held after submit)

**CardInput** (form only): `number`, `expiry`, `cvc`, `name?`

**Invoice**: `id`, `number`, `status` (`paid` | `failed` | `pending`), `kind` (`initial` | `renewal` | `proration` | `plan_change`), `total`, `currency`, `period_start`, `period_end`, `issued_at`, `lines: InvoiceLine[]`, `payments: Payment[]`

**InvoiceLine**: `description`, `amount`

**Payment**: `id`, `invoice_id`, `invoice_number`, `amount`, `status` (`succeeded` | `failed`), `failure_reason?`, `reference?`, `created_at`

**Page<T>**: `items: T[]`, `total`, `page`, `page_size`

**CustomerSummary** (admin): `id`, `email`, `name`, `subscription_status?`, `plan_name?`, `joined_at`

**AnalyticsSummary** (admin): `mrr`, `active_subscriptions`, `new_subscriptions`, `cancelled_subscriptions`, `churn_rate`, `failed_payments`

**RevenuePoint**: `bucket` (date string), `revenue`

**PlanCount**: `plan_name`, `count`

**ApiError**: `{ code, message, details? }`, normalised by the API client from `{ error: {...} }`.

## Relationships
User 1-0..1 current Subscription -> 1 Plan. Subscription 1..* Invoice 1..* InvoiceLine and 1..* Payment. User 0..1 PaymentMethod.

## Client-only derived values
- `canChangePlan`: status `active`.
- `canRenew`: status `past_due`, or `active` and `current_period_end <= now`.
- `canCancel`: status `active` or `past_due`, and not already cancelled.
- `hasPendingCancel`: `cancel_at_period_end` and status `active`.
- `isCurrentPlan(plan)`: `subscription.plan.id === plan.id`.

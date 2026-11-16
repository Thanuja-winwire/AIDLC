# Business Logic Model — Backend API

## 1. Subscription lifecycle

```
(none) --subscribe ok--> active
(none) --subscribe payment fails--> (none)  [failed invoice and payment recorded]
active --period end, payment ok--> active   [period extended]
active --period end, payment fails--> past_due
past_due --retry ok--> active
past_due --retry fails, attempts < max--> past_due
past_due --retry fails, attempts = max--> expired
active --cancel immediately--> cancelled
active --cancel at period end--> active (cancel_at_period_end = true)
active (cancel flag) --period end reached--> cancelled
past_due --cancel immediately--> cancelled
```

`cancelled` and `expired` are terminal. The customer may subscribe again afterwards.

## 2. Flows

### 2.1 Subscribe(user, plan_id, card)
1. Load the plan. Reject if missing or inactive (BR-P2).
2. Reject if the user already has an `active` or `past_due` subscription (BR-S1).
3. Validate the card (BR-G1).
4. In one transaction:
   - Create a subscription in a pending state, with the period starting now and ending one interval later.
   - Create an `initial` invoice with one line for the plan.
   - Call the gateway `charge(card, price)` and record a Payment.
5. On success: mark the invoice `paid`, set the subscription `active`, save or update the payment method (brand, last4). Return the subscription.
6. On failure: mark the invoice `failed` and discard the pending subscription. Keep the invoice and payment for history. Return 402 with the reason.

A zero-price plan skips the gateway call and records a `paid` invoice for 0.00.

### 2.2 ChangePlan(user, new_plan_id)
1. Load the user's `active` subscription and the target plan. Validate BR-U1 and BR-U2.
2. If the intervals differ (BR-U3):
   - Create a `plan_change` invoice for the full new price and charge the stored card.
   - On success, set the plan, `price_at_subscription` and a new period starting now. On failure, change nothing and return 402.
3. If the intervals are the same (BR-U4):
   - Compute proration.
   - If it is above 0: create a `proration` invoice with one line, charge, and apply the change on success only.
   - If it is 0 or below: apply the change with no charge and record a zero-amount invoice.
4. Set `price_at_subscription` to the new plan price. The cycle end date is unchanged for same-interval changes.

Worked example: monthly 30-day cycle, 10 days remaining, Basic 10.00 to Pro 25.00.
Proration = (25.00 - 10.00) x 10 / 30 = 5.00.

### 2.3 Renew(subscription_id) — the single renewal path
1. Lock the subscription row and verify BR-R1 or BR-R7.
2. If `cancel_at_period_end` and the period has ended: set `cancelled` and stop (BR-R9).
3. Find the open failed `renewal` invoice for this cycle (BR-R5). If none exists, create one for `price_at_subscription`.
4. Charge the stored payment method and record a Payment.
5. On success: invoice `paid`, period advances one interval from the old `current_period_end`, status `active`, attempts = 0.
6. On failure: invoice `failed`, status `past_due`, attempts + 1. If attempts reach the maximum, status becomes `expired` (BR-R4).
7. If the user has no payment method, treat it as a failed attempt with reason `no_payment_method`.

### 2.4 Scheduler run_renewals()
1. Runs every `RENEWAL_INTERVAL_SECONDS` (configurable).
2. Select due subscriptions (BR-R1), and cancel-flagged subscriptions past their period end.
3. For each one, call `Renew(id)` in its own transaction. An error on one subscription is logged and does not stop the others.
4. Return counts: processed, renewed, failed, expired, cancelled.

### 2.5 Cancel(user, mode)
- `mode = period_end`: set `cancel_at_period_end = true`.
- `mode = immediate`: set `cancelled`, `cancelled_at = now`.
- `undo`: clear `cancel_at_period_end` if the status is still `active`.
- Validation follows BR-C3.

### 2.6 UpdatePaymentMethod(user, card)
Validate the card (BR-G1), derive the brand and last4, and upsert the PaymentMethod. No charge is made.

### 2.7 Gateway charge(card, amount) -> GatewayResult
- Failure numbers return `{status: failed, reason}`.
- Any other valid card returns `{status: succeeded, reference}`.
- The result is deterministic, with no randomness other than the reference.

### 2.8 Invoice numbering
A sequential number is taken from a database sequence, formatted `INV-` plus 6 digits.

### 2.9 Analytics
Computed on demand with aggregate queries per BR-M1 to BR-M7. Inputs are `from`, `to` and `group_by` (day or month). Response shapes are listed in the dashboard summary and the revenue series.

### 2.10 Admin
- Search customers by email or name, with their current subscription status.
- List all invoices and payments with filters on status, user and date range.
- Trigger manual renewal, which calls `Renew(id)`.
- Plan CRUD follows the plan rules above.

## 3. Admin seeding and sample data
On startup, create the admin from environment variables if no admin exists. Seed sample plans (for example Basic, Pro and Business, monthly and yearly) when the plan table is empty.

## 4. Key transaction boundaries
- Subscribe, ChangePlan and Renew each commit the invoice, payment and subscription changes together.
- The failed invoice and Payment records from a failed Subscribe or ChangePlan are committed even though the subscription change is not applied.

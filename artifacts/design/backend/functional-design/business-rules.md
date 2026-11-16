# Business Rules — Backend API

Decisions from the approved plan answers are marked [Q1]–[Q5].

## Authentication and authorization
- BR-A1: Email is unique, case-insensitive. A duplicate returns 409.
- BR-A2: Password minimum is 8 characters.
- BR-A3: Login failure returns a generic 401 that does not reveal which field was wrong.
- BR-A4: Admin endpoints require role `admin`, otherwise 403.
- BR-A5: Customers may only read their own subscriptions, invoices, payments and payment method. Another user's record returns 404.

## Plans
- BR-P1: Price >= 0, interval is `monthly` or `yearly`, name is required and unique.
- BR-P2: Only active plans appear in the customer plan list and can be subscribed to or switched to.
- BR-P3 [Q4]: Deactivating or editing a plan does not change existing subscriptions. Subscribers keep the plan and their `price_at_subscription` until they change or cancel.
- BR-P4: Plans are never deleted, only deactivated.

## Subscribe
- BR-S1: Rejected with 409 if the user already has an `active` or `past_due` subscription.
- BR-S2: A payment method (test card) is required.
- BR-S3: The first payment is charged for the full plan price. On failure the subscription is not activated: the invoice is `failed`, the payment is recorded and nothing is left active.
- BR-S4: On success the subscription is `active`. The period starts now and ends one interval later (1 month or 1 year).

## Plan change
- BR-U1: Only for the user's own `active` subscription. A `past_due` subscription cannot change plan.
- BR-U2: The target plan must be active and different from the current plan.
- BR-U3 [Q3]: If the target plan has a different interval, the new interval starts immediately. The customer is charged the full new price, a new cycle starts now, and no proration applies.
- BR-U4 [Q2]: Same-interval change: `proration = (new_price - old_price) x remaining_days / total_days`, rounded to 2 decimals.
  - `old_price` is `price_at_subscription`. `new_price` is the new plan's current price.
  - `remaining_days = ceil(period_end - now)` in days, `total_days = period_end - period_start` in days.
- BR-U5: If proration > 0, an invoice is created and charged immediately. If the charge fails, the plan change is not applied.
- BR-U6: If proration <= 0 (downgrade), there is no charge, no refund and no credit. The plan changes and the cycle end date is unchanged. A zero-amount `plan_change` invoice is recorded.
- BR-U7: After a same-interval change the cycle end date is unchanged. `price_at_subscription` is set to the new price.
- BR-U8: A pending cancel-at-period-end flag is preserved across a plan change.

## Renewal
- BR-R1: A subscription is due when its status is `active` or `past_due`, `current_period_end <= now`, and `cancel_at_period_end` is false.
- BR-R2: Renewal charges `price_at_subscription` (not the plan's current price) using the stored payment method.
- BR-R3: On success the period moves forward by one interval, status becomes `active`, `renewal_attempts` resets to 0, and the invoice is `paid`.
- BR-R4 [Q1]: On failure the status becomes `past_due`, `renewal_attempts` increases by 1, and the invoice is `failed`. The scheduler retries on each later run until `renewal_attempts` reaches `MAX_RENEWAL_ATTEMPTS` (default 3). Then the subscription becomes `expired`.
- BR-R5: A retry reuses the open failed invoice for that cycle and adds a new Payment to it. It does not create a new invoice.
- BR-R6: Manual "renew now" by the customer or admin runs the same single renewal path (`SubscriptionService.renew`).
- BR-R7: Manual renew is allowed only when the subscription is `past_due`, or `active` and due. Otherwise it returns 409.
- BR-R8: The scheduler is idempotent. Each subscription is processed in its own transaction, with row locking so concurrent runs cannot double-charge.
- BR-R9: A subscription with `cancel_at_period_end` that has reached the period end becomes `cancelled` and is not charged.

## Cancellation
- BR-C1: The default is cancel at period end. This sets `cancel_at_period_end = true` and access continues until the period end.
- BR-C2: Immediate cancellation sets status `cancelled` and `cancelled_at = now`.
- BR-C3: Cancelling an already cancelled or expired subscription returns 409.
- BR-C4: A customer can undo a pending cancel-at-period-end before the period ends.
- BR-C5: There are no refunds or credits.

## Invoices and payments
- BR-I1: An invoice is created for each subscribe, proration or plan change, and renewal.
- BR-I2: Invoice amount equals the sum of its lines.
- BR-I3: Invoice status is `paid` only after a succeeded Payment.
- BR-I4: Every gateway attempt creates a Payment record, including failures with a reason.
- BR-I5: Invoices and payments are immutable after creation apart from status and payment attempts.

## Simulated gateway and payment method
- BR-G1: The card number must be 13–19 digits and pass a Luhn check, except the designated test numbers below.
- BR-G2: `4000000000000002` fails with reason `card_declined`. `4000000000009995` fails with reason `insufficient_funds`.
- BR-G3: Every other valid card succeeds with a generated reference such as `sim_<random>`.
- BR-G4: Only brand and last4 are stored. Brand is derived from the leading digits (Visa, Mastercard, Amex, otherwise Card).
- BR-G5: Updating the payment method does not charge the card. The next renewal uses it. A `past_due` customer can update the method and then renew now.

## Analytics
- BR-M1 [Q5]: MRR is the sum, over `active` subscriptions, of the monthly-normalised `price_at_subscription` (yearly / 12, rounded to 2 decimals). `past_due` subscriptions are excluded.
- BR-M2: Active subscriptions = count with status `active`.
- BR-M3 [Q5]: Churn rate for a period = cancellations in the period / subscriptions active at the period start. If the denominator is 0, churn is 0. A cancellation counts at its `cancelled_at` (immediate) or when the period-end cancellation takes effect.
- BR-M4: New subscriptions in a period = subscriptions created in it that were successfully activated.
- BR-M5: Revenue over time = sum of succeeded payment amounts, grouped by day or month.
- BR-M6: Subscribers per plan = count of `active` subscriptions per plan.
- BR-M7: Failed payments = count of Payments with status `failed` in the period.

## Validation and error format
- All errors return `{ "error": { "code": string, "message": string, "details"?: any } }`.
- 400/422 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 state conflict, 402 payment failed (the body includes the failure reason).

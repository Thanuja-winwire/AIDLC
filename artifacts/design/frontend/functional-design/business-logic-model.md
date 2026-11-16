# Business Logic Model — Frontend App

## 1. Bootstrap
1. Read `sm_token` from localStorage.
2. If present, set status `loading` and call `GET /auth/me`. On success -> `authenticated`. On 401 -> clear the token and set `anonymous`.
3. If absent -> `anonymous`.
4. The router waits for a non-loading status before rendering guarded routes, and shows a full-page spinner meanwhile.

## 2. API client
- Base URL from `VITE_API_BASE_URL`.
- Request interceptor adds `Authorization: Bearer <token>` when a token exists.
- Response interceptor: on 401 (outside `/auth/login`) clear the auth state and redirect to `/login?expired=1`. All error responses are normalised to `ApiError`.
- The PDF download uses `responseType: 'blob'`.

## 3. Route guard logic
```
ProtectedRoute: anonymous -> /login (keep from=path); authenticated -> render
AdminRoute: anonymous -> /login; role != admin -> ForbiddenPage; else render
PublicOnly: authenticated -> redirect to role home
```

## 4. Customer flows

### 4.1 Plans page decision table
| Subscription state | Card action for a plan |
|---|---|
| none, cancelled, expired | "Subscribe" -> SubscribeDialog |
| active, plan is current | "Current plan" (disabled) |
| active, other plan | "Upgrade", "Downgrade" or "Switch" (by price/interval comparison, used only for the label) -> ConfirmPlanChangeDialog |
| past_due | Disabled, tooltip "Resolve the failed payment first" |

### 4.2 Subscribe
```
open SubscribeDialog(plan)
  validate CardForm
  POST /subscriptions {plan_id, card}
    201 -> invalidate subscription, invoices, payments, paymentMethod; toast; go /subscription
    402 -> show reason; keep dialog open
    409 -> show "You already have a subscription"; refetch subscription
    422 -> map to fields
```

### 4.3 Plan change
```
open ConfirmPlanChangeDialog(newPlan)
  GET /subscriptions/change-preview?plan_id=newPlan.id -> PlanChangePreview
  render by preview.kind:
    upgrade_prorated            -> "You will be charged {amount} today for the remaining days."
    downgrade_no_charge         -> "No charge today. No refund or credit for the unused time."
    interval_change_full_charge -> "A new billing cycle starts today. You will be charged {amount}."
  on Confirm: POST /subscriptions/change {plan_id}
    200 -> invalidate; toast; close
    402 -> inline failure reason (plan unchanged)
    409/422 -> inline message; refetch preview
```

### 4.4 Renew now
POST `/subscriptions/renew`. 200 -> toast "Renewed until <date>", invalidate. 402 -> failure reason, and the banner links to the payment method page. 409 -> "Nothing to renew", refetch.

### 4.5 Cancel and undo
POST `/subscriptions/cancel {mode}` with `period_end` (default) or `immediate`. POST `/subscriptions/cancel/undo`. On success, invalidate the subscription and show a toast with the effective date.

### 4.6 Payment method
PUT `/payment-method {card}` -> invalidate `paymentMethod`, clear the form, show the brand and last4. If the subscription is past_due, the success toast offers a "Renew now" action.

### 4.7 Invoice PDF
GET `/invoices/{id}/pdf` as blob -> create an object URL -> trigger download with the file name `<invoice.number>.pdf` -> revoke the URL.

## 5. Admin flows
- Analytics: three parallel queries keyed by the date range and granularity. Changing the range refetches. Each card and chart has its own loading and error state, so one failure does not blank the page.
- Plans: create or update via PlanFormDialog, and the table refetches. Deactivate asks for confirmation.
- Customers: debounced search, paginated table, a drawer that loads the customer's detail. "Trigger renewal" calls `POST /admin/subscriptions/{id}/renew` and shows the outcome.
- Billing: Invoices and Payments tabs with filters kept in URL query parameters, so views are shareable and survive refresh.

## 6. Derived display logic
- `RenewalBanner` text:
  - past_due: "Your last payment failed (attempt {n} of {max}). Update your card or renew now."
  - cancel_at_period_end: "Your subscription ends on {date}."
  - otherwise none.
- Next renewal date = `current_period_end`, shown only when not cancelling.
- Charts: the series are passed as-is from the API. Missing days are not interpolated.

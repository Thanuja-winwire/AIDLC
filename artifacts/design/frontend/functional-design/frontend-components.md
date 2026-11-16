# Frontend Components — Frontend App

Decisions from the approved plan: Tailwind CSS with small custom components [Q1]; Recharts [Q2]; on-screen invoice detail plus server-generated PDF download [Q3]; plan-change confirmation dialog with backend preview [Q4]; card form with test-card hints [Q5]; JWT in localStorage [Q6].

## 1. Route map

| Route | Page | Guard |
|---|---|---|
| `/login`, `/register` | LoginPage, RegisterPage | Public (redirect to home if signed in) |
| `/plans` | PlansPage | ProtectedRoute |
| `/subscription` | MySubscriptionPage | ProtectedRoute |
| `/invoices`, `/invoices/:id` | InvoiceListPage, InvoiceDetailPage | ProtectedRoute |
| `/payments` | PaymentHistoryPage | ProtectedRoute |
| `/payment-method` | PaymentMethodPage | ProtectedRoute |
| `/admin` | AnalyticsDashboardPage | AdminRoute |
| `/admin/plans` | AdminPlansPage | AdminRoute |
| `/admin/customers` | AdminCustomersPage | AdminRoute |
| `/admin/billing` | AdminBillingPage (tabs: Invoices, Payments) | AdminRoute |
| `*` | NotFoundPage | - |

Post-login landing: customer -> `/subscription`, admin -> `/admin`.

## 2. Component hierarchy

```
App
 +-- AuthProvider (token, user, login, logout)
 +-- QueryClientProvider
 +-- Router
      +-- PublicLayout -> LoginPage | RegisterPage
      +-- AppShell (sidebar/top nav by role, user menu, toast host)
           +-- Customer pages
           |    PlansPage -> PlanCard[] -> ConfirmPlanChangeDialog | SubscribeDialog
           |    MySubscriptionPage -> SubscriptionSummaryCard, StatusBadge, RenewalBanner,
           |                          CancelDialog, ConfirmPlanChangeDialog
           |    InvoiceListPage -> DataTable, StatusBadge, Pagination
           |    InvoiceDetailPage -> InvoiceDocument, DownloadPdfButton
           |    PaymentHistoryPage -> DataTable, StatusBadge, Pagination
           |    PaymentMethodPage -> CardForm, TestCardHints, SavedCardCard
           +-- Admin pages
                AnalyticsDashboardPage -> DateRangePicker, KpiCard[], RevenueChart,
                                          PlanDistributionChart, FailedPaymentsCard
                AdminPlansPage -> DataTable, PlanFormDialog
                AdminCustomersPage -> SearchInput, DataTable, CustomerDetailDrawer
                AdminBillingPage -> Tabs, DataTable, FilterBar
```

## 3. Shared UI kit (Tailwind, small custom components)

Button (primary filled, secondary outlined, danger, ghost; loading and disabled states), Input/Select/FormField with inline error text, Card, Badge (status colours), DataTable, Pagination, Dialog, Drawer, Tabs, Toast, Spinner, Skeleton, EmptyState, ErrorState, KpiCard, Icon set (lucide-react).

Design tokens: one brand accent (indigo), a slate neutral scale, semantic colours (green success, amber warning, red error, blue info). Type scale: page title 24/semibold, section 18/semibold, body 14, secondary 12 in slate-500. Spacing in a 4px grid, max content width 1200px, responsive from 360px up (sidebar collapses to a top menu on small screens).

Status badge mapping: active/paid/succeeded = green; past_due/pending = amber; failed/expired = red; cancelled = slate; cancel-at-period-end = amber "Cancels on <date>".

## 4. State and data fetching

- Server state: TanStack Query, one hook per resource. Keys: `['plans']`, `['subscription']`, `['invoices', page]`, `['invoice', id]`, `['payments', page]`, `['paymentMethod']`, `['admin', 'analytics', range]`, `['admin', 'customers', query, page]`, `['admin', 'invoices', filters, page]`, `['admin', 'payments', filters, page]`.
- Mutations invalidate: subscribe, change, renew, cancel, undo-cancel -> `subscription`, `invoices`, `payments`; save payment method -> `paymentMethod`; admin plan changes -> `plans`, admin analytics.
- Client state: AuthContext (token, user), dialog open state, form state (local, controlled).
- Defaults: `staleTime` 30s, no retry on 4xx, one retry on network errors.
- Token in `localStorage` key `sm_token`. On load, if present, call `GET /auth/me`; a 401 clears the token and redirects to `/login`.

## 5. User interaction flows

### 5.1 Register and login
Form -> validate -> POST -> store token -> redirect by role. Server errors (409 duplicate email, 401 invalid credentials) show in an inline alert above the form.

### 5.2 Subscribe
1. PlansPage lists active plans as cards (name, price, interval, description). The current plan is marked "Current plan".
2. Customer without a subscription clicks "Subscribe" -> SubscribeDialog shows the plan summary and a CardForm (prefilled with the saved card summary if one exists, with a "use a different card" option).
3. Submit -> POST subscribe. Success: toast, navigate to `/subscription`. 402: the dialog stays open with a payment-failed alert showing the reason. The customer can retry with another card.
4. A customer with an active or past_due subscription sees "Change plan" instead.

### 5.3 Change plan with preview [Q4]
1. Customer clicks "Upgrade"/"Downgrade"/"Switch" on a plan card or from My Subscription.
2. ConfirmPlanChangeDialog opens in a loading state and calls the preview endpoint.
3. It shows: current plan -> new plan, charge due now (or "No charge"), a one-line explanation (prorated for remaining days / new billing cycle starts today / downgrade with no refund), and the next renewal date.
4. "Confirm" calls the change endpoint. Success: toast, close, invalidate. 402: error stays in the dialog. If the preview fails, the dialog shows an ErrorState with retry, and Confirm is disabled.
5. Past_due subscriptions see the change action disabled with a tooltip: "Resolve the failed payment first".

### 5.4 Renew now
Shown on My Subscription when the status is `past_due`, or `active` and due. A RenewalBanner explains the situation (for past_due: failed attempts so far, next retry, and a link to update the card). "Renew now" calls the renew endpoint and shows success or the failure reason.

### 5.5 Cancel
CancelDialog offers two radio options: "At the end of the billing period" (default) and "Immediately", with consequence text for each (BR-C1, BR-C2, no refunds). A pending cancellation shows an amber banner with "Undo cancellation".

### 5.6 Payment method
CardForm (card number, expiry MM/YY, CVC, optional name). Test-card hints panel [Q5]: `4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` declined, `4000 0000 0000 9995` insufficient funds. After saving only brand and last4 are displayed. The raw number and CVC are never stored in client state beyond the form and are sent once.

### 5.7 Invoices
List shows number, date, amount, status, with pagination. Detail shows an on-screen InvoiceDocument (number, dates, billing period, line items, total, status, payment attempts). "Download PDF" fetches the PDF as a blob from the backend with the auth header and saves it as `<invoice-number>.pdf` [Q3].

### 5.8 Admin analytics [Q2]
DateRangePicker (presets: 7 days, 30 days, 90 days, custom) and granularity toggle (day/month). KPI cards: MRR, active subscriptions, new, cancelled, churn rate, failed payments. RevenueChart (Recharts line/area chart of revenue over time) and PlanDistributionChart (bar chart of subscribers per plan), each with a designed empty and loading state and a tooltip. A table fallback is present for accessibility via aria-labels and a "View as table" toggle.

### 5.9 Admin plans
Table with name, price, interval, active flag, subscriber count. PlanFormDialog creates or edits a plan. A note says that editing does not change existing subscribers (BR-P3). Deactivate asks for confirmation.

### 5.10 Admin customers and billing
Customer search by email or name with debounce (300 ms), status filter, and a detail drawer (subscription, recent invoices, payments) with a "Trigger renewal" action. AdminBillingPage offers filters for status, user and date range.

## 6. Form validation rules (client-side, mirrors server rules)

| Field | Rule |
|---|---|
| Email | Required, valid format |
| Password (register) | Min 8 characters (BR-A2); strength hint |
| Name | Required, max 100 |
| Card number | Digits only after stripping spaces, 13-19 digits, Luhn check passes, except the two designated test numbers |
| Expiry | MM/YY format, not in the past |
| CVC | 3 digits (4 for Amex) |
| Plan name | Required, max 100, unique (server 409 shown inline) |
| Plan price | Number >= 0, max 2 decimals |
| Plan interval | `monthly` or `yearly` |
| Plan description | Optional, max 500 |
| Date range | `from` <= `to` |

Validation runs on blur and on submit. Submit is disabled while pending. Server validation errors (`error.details`) map to the matching fields; other errors show in an alert.

## 7. Screen to endpoint map

| Screen / action | Endpoint |
|---|---|
| Register / Login / Me | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Plans list | `GET /plans` |
| Current subscription | `GET /subscriptions/current` |
| Subscribe | `POST /subscriptions` |
| Plan change preview | `GET /subscriptions/change-preview?plan_id=` |
| Plan change | `POST /subscriptions/change` |
| Renew now | `POST /subscriptions/renew` |
| Cancel / undo | `POST /subscriptions/cancel` with `mode`, `POST /subscriptions/cancel/undo` |
| Invoices | `GET /invoices`, `GET /invoices/{id}`, `GET /invoices/{id}/pdf` |
| Payments | `GET /payments` |
| Payment method | `GET /payment-method`, `PUT /payment-method` |
| Admin analytics | `GET /admin/analytics/summary`, `/revenue`, `/plans` |
| Admin plans | `GET/POST /admin/plans`, `PUT /admin/plans/{id}`, `POST /admin/plans/{id}/deactivate` |
| Admin customers | `GET /admin/customers`, `POST /admin/subscriptions/{id}/renew` |
| Admin billing | `GET /admin/invoices`, `GET /admin/payments` |

**Contract additions for the backend unit** (not yet in the backend design): `GET /subscriptions/change-preview` (returns amount due now, explanation type, new period end) and `GET /invoices/{id}/pdf` (server-generated PDF). They must be added to the backend before Build, or recorded as a design change when Code Generation plans the backend.

## 8. Designed states

| State | Treatment |
|---|---|
| Loading | Skeleton cards/rows for lists and KPI cards, spinner inside buttons and dialogs |
| Empty | Illustrated EmptyState with copy and a primary action (no subscription -> "Browse plans"; no invoices -> "Invoices appear after your first payment"; no analytics data -> "No activity in this period") |
| Error | ErrorState card with message and Retry; inline alert for form errors; toast for transient success/failure |
| 401 | Clear token, redirect to login with "Session expired" message |
| 403 | Forbidden page with link home |
| Past due | Amber banner across My Subscription |

## 9. Styling approach
Tailwind CSS with small custom components. No second component library. Visual quality follows the Enterprise UI Baseline: type scale, spacing grid, colour system, responsive layout, hover/focus/disabled states, a visible primary/secondary/danger action hierarchy, card depth, and purposeful icons (lucide-react).

## 10. Local dev wiring
Backend base URL is read from `VITE_API_BASE_URL`, defaulting to `http://localhost:8000`. The backend CORS origin is the Vite dev origin `http://localhost:5173`.

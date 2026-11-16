# Specification — Subscription Management Platform

Workflow type: Simple | Source: user request + approved answers to requirement-verification-questions.md

## 1. Overview
A full-stack web platform where customers browse subscription plans, subscribe, upgrade/downgrade, renew, cancel, view invoices and payment history; admins manage plans and view analytics. Payments go through a simulated gateway.

## 2. Tech Stack
- Frontend: React (SPA), modern component/styling approach applied consistently
- Backend: Python FastAPI (REST, OpenAPI docs)
- Database: PostgreSQL
- Auth: JWT (access token), password hashing (bcrypt)
- Payments: in-process simulated gateway
- Scheduler: background scheduler (e.g. APScheduler) in the FastAPI process

## 3. Roles and Auth (Q3-A)
- Roles: `customer`, `admin`.
- Customers self-register and log in with email + password.
- A default admin is seeded at startup (credentials via environment variables).
- JWT-protected endpoints; role-based authorization for admin endpoints.

## 4. Functional Requirements

### 4.1 Subscription Plans
- Plan fields: name, description, price, billing interval (monthly/yearly), features list, active flag.
- Admin: create, update, deactivate plans. Customers: list active plans.

### 4.2 Customer Subscriptions
- A customer has at most one active subscription at a time.
- Subscribe to a plan: creates subscription, generates the first invoice, charges via gateway.
- Statuses: `active`, `past_due`, `cancelled`, `expired`.
- Failed first payment: subscription is not activated.

### 4.3 Upgrades / Downgrades (Q1-A: prorated)
- Change plan mid-cycle; the price difference is prorated for the remaining days of the current cycle and charged immediately (invoice + payment).
- Downgrade/negative proration produces no charge in this scope (no refund/credit); new plan takes effect and the cycle date is unchanged.
- Billing cycle end date stays the same after a change.

### 4.4 Renewals (Q2-A)
- Automatic: background scheduler periodically finds active subscriptions due for renewal, generates an invoice and charges the gateway.
- Manual: customer "renew now" action (and admin trigger endpoint) performs the same renewal.
- Successful renewal extends the period by one interval; failed payment sets `past_due` and the invoice stays unpaid/failed.
- Subscriptions flagged cancel-at-period-end are not renewed and become `cancelled`/`expired` at period end.

### 4.5 Cancellations
- Customer may cancel: either at period end (default, retains access until then) or immediately.
- Cancelled subscriptions are not renewed.

### 4.6 Invoices
- Generated for: initial subscription, proration on upgrade, and each renewal.
- Fields: invoice number (unique), customer, subscription, line items, amount, status (`paid`, `failed`, `pending`), issue date, period.
- Customer views own invoices (list + detail, printable view); admin views all.

### 4.7 Payments and History
- Each payment attempt is recorded (amount, status, gateway reference, failure reason, timestamp), linked to an invoice.
- Customer views own payment history; admin views all.

### 4.8 Simulated Payment Gateway (Q4-A)
- Always succeeds, except designated test card numbers that simulate failure (e.g. `4000000000000002` declined, `4000000000009995` insufficient funds).
- Customer supplies a test card at subscribe / payment method update; only last 4 digits and brand are stored, never full card numbers.
- Returns a transaction reference and status.

### 4.9 Admin Analytics
- Dashboard metrics: MRR, active subscriptions, new subscriptions and cancellations over a period, churn rate, revenue over time, subscribers per plan, failed payments count.
- Admin also lists/searches customers and their subscriptions.

## 5. Non-Functional Requirements
- Security: hashed passwords, JWT expiry, role checks, input validation (Pydantic), CORS restricted to frontend origin, no secrets in code.
- Data integrity: money stored as decimal/numeric; DB migrations (Alembic); transactional updates for subscribe/upgrade/renew.
- API: REST with consistent error format; OpenAPI docs.
- Performance: normal single-instance load; indexed foreign keys and status/date columns.
- Quality: backend tests (pytest) for billing logic (proration, renewal, cancellation, gateway) and auth; basic frontend tests.
- UI: responsive, professionally styled, with designed empty/loading/error states.
- Deployment/local: Docker Compose (frontend, backend, PostgreSQL) with env-based config and seeded sample plans.

## 6. Frontend Screens
- Public: login, register.
- Customer: plans, my subscription (upgrade, renew now, cancel), invoices (list/detail), payment history, payment method.
- Admin: analytics dashboard, plan management, customers/subscriptions, all invoices/payments.

## 7. Out of Scope
Real payment processors, tax/VAT, coupons/discounts, refunds/credits, email notifications, multi-currency, multiple concurrent subscriptions per customer, social login/MFA.

## 8. Assumptions
- Single currency (USD).
- Scheduler runs inside the API process; interval configurable.
- Single deployable unit pair (backend + frontend) in one repository.

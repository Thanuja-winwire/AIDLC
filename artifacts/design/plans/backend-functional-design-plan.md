# Functional Design Plan — backend (Backend API)

Scope: detailed business logic, domain entities and business rules for the Backend API unit, built on the approved specs.md, stories.md and app-architecture.md. Technology-agnostic.

## Steps
- [x] Step 1: Define domain entities and relationships (User, Plan, Subscription, Invoice, InvoiceLine, Payment, PaymentMethod)
- [x] Step 2: Define subscription lifecycle and status transitions
- [x] Step 3: Define business logic flows (subscribe, upgrade/downgrade with proration, renew, cancel, scheduler)
- [x] Step 4: Define business rules, validations and error cases
- [x] Step 5: Define analytics metric formulas
- [x] Step 6: Write business-logic-model.md, business-rules.md, domain-entities.md

## Answers applied
- Q1 A: failed renewal -> past_due, scheduler retries up to a limit, then expired
- Q2 A: proration = (new - old) x remaining / total days, 2 decimals
- Q3 B: interval change starts a new cycle with a full charge
- Q4 A: existing subscribers keep the plan and price
- Q5 A: MRR from active subscriptions, monthly-normalised; churn = cancellations / active at start

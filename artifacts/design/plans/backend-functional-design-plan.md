# Functional Design Plan — backend (Backend API)

Scope: detailed business logic, domain entities and business rules for the Backend API unit, built on the approved specs.md, stories.md and app-architecture.md. Technology-agnostic.

## Steps
- [ ] Step 1: Define domain entities and relationships (User, Plan, Subscription, Invoice, InvoiceLine, Payment, PaymentMethod)
- [ ] Step 2: Define subscription lifecycle and status transitions
- [ ] Step 3: Define business logic flows (subscribe, upgrade/downgrade with proration, renew, cancel, scheduler)
- [ ] Step 4: Define business rules, validations and error cases
- [ ] Step 5: Define analytics metric formulas
- [ ] Step 6: Write business-logic-model.md, business-rules.md, domain-entities.md

## Questions

## Question 1
How should a failed renewal payment be handled?

A) Set the subscription to past_due; the scheduler retries on the next run until a retry limit, then expires it

B) Set the subscription to past_due; no automatic retry, the customer must renew manually or update their payment method

C) Expire the subscription immediately on the first failure

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Set the subscription to past_due; the scheduler retries on the next run until a retry limit, then expires it

## Question 2
How should proration be calculated on an upgrade?

A) (new price - old price) x remaining days / total days in the current cycle, rounded to 2 decimals

B) Credit unused value of the old plan and charge the full new plan price for the remaining days

C) Other (please describe after [Answer]: tag below)

[Answer]: A) (new price - old price) x remaining days / total days in the current cycle, rounded to 2 decimals

## Question 3
What happens when a customer changes between plans with different billing intervals (monthly to yearly)?

A) Block it; plan changes are only allowed within the same billing interval

B) Allow it; the new interval starts immediately with a full charge and a new cycle

C) Allow it, using the same proration formula and keeping the current cycle end date

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Allow it; the new interval starts immediately with a full charge and a new cycle

## Question 4
What happens to existing subscribers when an admin deactivates or edits a plan?

A) Existing subscribers keep the plan and its current price until they change or cancel; the plan is only hidden from new sign-ups

B) Existing subscribers are moved to a chosen replacement plan

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Existing subscribers keep the plan and its current price until they change or cancel; the plan is only hidden from new sign-ups

## Question 5
How are the analytics metrics defined?

A) MRR = sum of monthly-normalised plan prices of active subscriptions (yearly / 12); churn = cancellations in period / active at period start

B) MRR = sum of paid invoice amounts in the current month; churn = cancelled / total subscriptions

C) Other (please describe after [Answer]: tag below)

[Answer]: A) MRR = sum of monthly-normalised plan prices of active subscriptions (yearly / 12); churn = cancellations in period / active at period start

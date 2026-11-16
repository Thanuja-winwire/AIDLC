# User Stories — Subscription Management Platform

Organised by user journey. Acceptance criteria use Given/When/Then.

## Journey: Onboarding and Access

### US-1: Register an account (FR 3)
Persona: Customer (Casey)
As a visitor, I want to register with email and password so that I can manage subscriptions.
- Given I am not registered, When I submit a valid unique email and password, Then an account with role `customer` is created and I can log in.
- Given the email already exists, When I register, Then I see a clear validation error and no account is created.

### US-2: Log in and out (FR 3)
Persona: Customer (Casey), Admin (Avery)
As a registered user, I want to log in and out so that my data stays secure.
- Given valid credentials, When I log in, Then I receive a JWT and land on the page for my role.
- Given invalid credentials, When I log in, Then I see an error and no token is issued.
- Given an expired or missing token, When I call a protected page, Then I am redirected to login.

### US-3: Restrict admin areas (FR 3)
Persona: Admin (Avery)
As an admin, I want admin features limited to admins so that customers cannot access them.
- Given I am a customer, When I request an admin endpoint or page, Then access is denied (403) and the UI hides admin navigation.
- Given the seeded admin credentials, When I log in, Then I can see admin pages.

## Journey: Choosing and Starting a Subscription

### US-4: Browse plans (FR 4.1)
Persona: Customer (Casey)
As a customer, I want to see active plans with price, interval and features so that I can compare them.
- Given active plans exist, When I open the plans page, Then I see each plan's name, price, interval and features.
- Given no active plans exist, When I open the page, Then I see a designed empty state.

### US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8)
Persona: Customer (Casey)
As a customer without an active subscription, I want to subscribe using a test card so that I get access.
- Given no active subscription and a valid test card, When I subscribe, Then an invoice is created, the payment succeeds, and the subscription becomes `active`.
- Given I already have an active subscription, When I try to subscribe again, Then it is rejected with a clear message.
- Given only last 4 digits and brand are stored, When the payment completes, Then the full card number is never persisted.

### US-6: Handle a failed first payment (FR 4.2, 4.8)
Persona: Struggling customer (Jordan)
As a customer, I want to be told why my first payment failed so that I can retry.
- Given I use a declined test card, When I subscribe, Then the payment is recorded as failed with a reason and the subscription is not activated.
- Given the failure, When I view the result, Then I see the reason and can retry with another card.

## Journey: Changing Plans

### US-7: Upgrade a plan with proration (FR 4.3)
Persona: Customer (Casey)
As a subscriber, I want to upgrade mid-cycle and pay only the prorated difference so that I am charged fairly.
- Given an active subscription, When I upgrade to a pricier plan, Then the prorated difference for the remaining days is invoiced and charged immediately.
- Given the upgrade succeeds, Then the new plan applies and the cycle end date is unchanged.
- Given the upgrade payment fails, Then the plan is not changed and the failure is shown.

### US-8: Downgrade a plan (FR 4.3)
Persona: Customer (Casey)
As a subscriber, I want to move to a cheaper plan so that I can reduce costs.
- Given an active subscription, When I choose a cheaper plan, Then no charge or refund is made and the new plan takes effect with the same cycle end date.

### US-9: Preview a plan change (FR 4.3)
Persona: Customer (Casey)
As a subscriber, I want to see the prorated amount before confirming so that there are no surprises.
- Given an active subscription, When I select a target plan, Then I see the amount to be charged now before confirming.

## Journey: Renewal

### US-10: Automatic renewal (FR 4.4)
Persona: Customer (Casey)
As a subscriber, I want my subscription to renew automatically so that access continues.
- Given an active subscription due for renewal, When the scheduler runs, Then an invoice is generated, the gateway is charged and the period extends by one interval.
- Given the subscription is flagged cancel-at-period-end, When the period ends, Then it is not renewed and becomes cancelled/expired.

### US-11: Manual renew now (FR 4.4)
Persona: Customer (Casey), Struggling customer (Jordan)
As a customer, I want to renew on demand so that I can retry or renew early.
- Given an active or `past_due` subscription, When I choose "Renew now", Then the same renewal process runs and the result is shown.
- Given the renewal succeeds on a `past_due` subscription, Then its status returns to `active`.

### US-12: Recover from failed renewal (FR 4.4, 4.7)
Persona: Struggling customer (Jordan)
As a customer, I want to see a failed renewal and fix my payment method so that I can recover.
- Given a renewal payment fails, Then the subscription becomes `past_due`, the invoice shows failed and the reason is visible.
- Given I update my test card and renew now, When the payment succeeds, Then the subscription becomes `active` and the invoice is paid.

### US-13: Update payment method (FR 4.8)
Persona: Customer (Casey), Struggling customer (Jordan)
As a customer, I want to update my test card so that future payments use it.
- Given I submit a new test card, When saved, Then only the brand and last 4 digits are stored and displayed.
- Given an invalid card number format, When I submit, Then I see a validation error.

## Journey: Cancellation

### US-14: Cancel at period end (FR 4.5)
Persona: Customer (Casey)
As a subscriber, I want to cancel at period end so that I keep access until I have paid through.
- Given an active subscription, When I cancel at period end, Then it stays active until the period end and is not renewed.

### US-15: Cancel immediately (FR 4.5)
Persona: Customer (Casey)
As a subscriber, I want to cancel immediately so that I stop the subscription now.
- Given an active subscription, When I cancel immediately and confirm, Then status becomes `cancelled` now and no future renewals occur.

## Journey: Billing Records

### US-16: View invoices (FR 4.6)
Persona: Customer (Casey)
As a customer, I want to list and open my invoices so that I can review charges.
- Given I have invoices, When I open the invoices page, Then I see number, date, amount and status for my invoices only.
- Given I open an invoice, Then I see line items, period and a printable view.

### US-17: View payment history (FR 4.7)
Persona: Customer (Casey), Struggling customer (Jordan)
As a customer, I want to see my payment attempts so that I understand what was charged or failed.
- Given payment attempts exist, When I open payment history, Then I see amount, status, reference, date and failure reason where applicable.

## Journey: Administration

### US-18: Manage plans (FR 4.1)
Persona: Admin (Avery)
As an admin, I want to create, edit and deactivate plans so that the catalogue stays current.
- Given I am an admin, When I create or edit a plan with valid fields, Then it is saved and reflected on the customer plans page if active.
- Given I deactivate a plan, Then it no longer appears to customers but existing subscribers are unaffected.

### US-19: Search customers and subscriptions (FR 4.9)
Persona: Admin (Avery)
As an admin, I want to find customers and see their subscriptions so that I can support them.
- Given customers exist, When I search by email or name, Then matching customers with subscription status are listed.

### US-20: View all invoices and payments (FR 4.6, 4.7)
Persona: Admin (Avery)
As an admin, I want to see all invoices and payments so that I can investigate billing issues.
- Given I am an admin, When I open the billing pages, Then I see all customers' invoices and payments with filters by status.

### US-21: View analytics dashboard (FR 4.9)
Persona: Admin (Avery)
As an admin, I want metrics on revenue and churn so that I can monitor the business.
- Given data exists, When I open the dashboard, Then I see MRR, active subscriptions, new vs cancelled over a period, churn rate, revenue over time, subscribers per plan and failed payments count.
- Given no data, Then I see a designed empty state.

### US-22: Trigger a renewal as admin (FR 4.4)
Persona: Admin (Avery)
As an admin, I want to trigger a renewal for a subscription so that I can resolve stuck billing.
- Given a subscription due or `past_due`, When I trigger renewal, Then the standard renewal process runs and the result is shown.

## Coverage
All of specs sections 3, 4.1-4.9 are covered. Persona mapping: Casey (US-1,2,4,5,7-11,13-17), Avery (US-2,3,18-22), Jordan (US-6,11,12,13,17).

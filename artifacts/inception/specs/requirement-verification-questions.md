# Requirements Clarification Questions

Please answer the following questions so the requirements can be finalized.

## Question 1
How should upgrades (and downgrades) be billed mid-cycle?

A) Prorated: charge the price difference for the remaining days of the current cycle immediately

B) No proration: new plan takes effect and is billed at the next renewal

C) Immediate full charge of the new plan with a new billing cycle starting today

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Prorated: charge the price difference for the remaining days of the current cycle immediately

## Question 2
How should renewals be processed in this simulated system?

A) Automatic renewal via a background scheduler, plus a manual "renew now" action

B) Manual renewal only (triggered by customer or admin)

C) Automatic renewal only, triggered by an admin/endpoint "run renewals" action (no background scheduler)

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Automatic renewal via a background scheduler, plus a manual "renew now" action

## Question 3
How should user roles and sign-up work?

A) Two roles (customer, admin); customers self-register, an admin is seeded at startup

B) Two roles; only admins can create accounts

C) Customers only plus a seeded admin, with no self-registration

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Two roles (customer, admin); customers self-register, an admin is seeded at startup

## Question 4
How should the simulated payment gateway behave?

A) Always succeeds, except for designated test card numbers that simulate failure (e.g. declined)

B) Random success/failure rate (configurable)

C) Always succeeds

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Always succeeds, except for designated test card numbers that simulate failure (e.g. declined)

# Story Generation Plan

Request: Subscription Management Platform (customer and admin personas; plans, subscriptions, upgrades, renewals, cancellations, invoices, payments, analytics).

## Story Breakdown Options
- **User Journey-Based**: stories follow workflows (subscribe, upgrade, renew, cancel). Best for billing flows.
- **Feature-Based**: stories per capability (plans, invoices, analytics). Simple to map to units.
- **Persona-Based**: grouped by customer vs admin. Clear role split, may fragment flows.
- **Epic-Based**: epics with sub-stories. More structure than a Simple workflow needs.

## Questions

## Question 1
Which breakdown approach should the stories use?

A) User journey-based

B) Feature-based

C) Persona-based (customer / admin)

D) Other (please describe after [Answer]: tag below)

[Answer]: A) User journey-based

## Question 2
How granular should the stories be?

A) Coarse: about 10-12 stories, one per major capability

B) Medium: about 15-20 stories, one per distinct user action

C) Fine: 20+ small stories

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Medium: about 15-20 stories, one per distinct user action

## Question 3
Which acceptance criteria format should be used?

A) Given/When/Then

B) Bullet checklist

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Given/When/Then

## Question 4
Which personas should be documented?

A) Two: Customer and Admin

B) Three: Customer, Admin and a struggling customer with failed payments

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Three: Customer, Admin and a struggling customer with failed payments

## Generation Steps
- [ ] Generate personas.md with archetypes and characteristics
- [ ] Generate stories.md (INVEST criteria, `### US-<n>: <title> (<FR ids>)` headings, no persona names in titles)
- [ ] Add acceptance criteria for each story in the approved format
- [ ] Map personas to stories via a `Persona:` field
- [ ] Verify coverage of all functional requirements in specs.md

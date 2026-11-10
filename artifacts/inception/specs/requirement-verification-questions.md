# Requirements Clarification Questions

Please answer the following questions to clarify the requirements.

## Question 1
Which payment integration approach should be used?

A) Stripe (test mode, real Stripe API integration)

B) Mock/simulated payment gateway (no external account needed)

C) PayPal sandbox

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Mock/simulated payment gateway (no external account needed)

## Question 2
How should authentication be implemented?

A) JWT access tokens with email/password and role-based access (customer/admin)

B) Session cookies with email/password and roles

C) Other (please describe after [Answer]: tag below)

[Answer]: A) JWT access tokens with email/password and role-based access (customer/admin)

## Question 3
What deployment and packaging expectation do you have?

A) Local development only (docker-compose for PostgreSQL optional)

B) Docker Compose for the full stack (frontend, backend, database)

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Local development only (docker-compose for PostgreSQL optional)

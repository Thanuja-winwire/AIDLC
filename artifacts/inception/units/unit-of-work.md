# Units of Work

## Unit 1: backend (Backend API)
- Stack: Python FastAPI, SQLAlchemy, PostgreSQL, JWT auth, background renewal scheduler.
- Responsibilities: authentication and roles; plan catalogue; subscriptions (subscribe, upgrade with proration, downgrade, cancel, renew); simulated payment gateway; invoices; payment history; admin analytics; seed data (admin, sample plans).
- Modules: auth, plans, subscriptions, billing (invoices, payments, gateway), renewal scheduler, analytics.

## Unit 2: frontend (Frontend App)
- Stack: React SPA, consuming the backend REST API with a JWT.
- Responsibilities: register/login, role-based navigation, plans browsing, subscribe/upgrade/cancel/renew flows, payment method update, invoices and payment history, admin plan management, customer search, billing views, analytics dashboard.

## Code organisation (greenfield, multi-unit)
```
code/
  backend/    FastAPI app, tests, requirements.txt, Dockerfile
  frontend/   React app, tests, package.json, Dockerfile
  docker-compose.yml
  README.md
```
Dev wiring: the frontend calls the backend through a configurable base URL, with defaults that connect locally.

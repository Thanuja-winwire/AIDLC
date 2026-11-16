# Code Generation Plan — backend (Backend API)

Single source of truth for generating `code/backend/`. Built from the approved backend functional design and app architecture.

## Unit context
- Stack: Python 3.12, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL, JWT (python-jose), bcrypt, APScheduler, reportlab (invoice PDF).
- Dependencies: none (built first). The frontend depends on this unit's REST contract.
- Layout decision (Simple): each module is router + service. The service uses the SQLAlchemy session directly, with no separate repository class. This keeps the layering of the architecture without a pass-through layer.
- Invoice number: `INV-` plus the zero-padded invoice id, taken from the identity column, so it is sequential, unique and portable to the SQLite test database.
- Tests run on in-memory SQLite. Production and Docker Compose use PostgreSQL.

## API contract (the frontend reads this literally)
All JSON. Money is a string with 2 decimals. Errors: `{ "error": { code, message, details? } }`.

| Method and path | Auth | Notes |
|---|---|---|
| `POST /auth/register` | public | `{email, password, name}` -> 201 `{user}` |
| `POST /auth/login` | public | `{email, password}` -> `{access_token, token_type, user}` |
| `GET /auth/me` | user | -> `{id, email, name, role}` |
| `GET /plans` | user | active plans |
| `GET /subscriptions/current` | user | subscription or `null` |
| `POST /subscriptions` | customer | `{plan_id, card}` -> 201 subscription; 402 on payment failure |
| `GET /subscriptions/change-preview?plan_id=` | customer | `{kind, amount_due_now, new_plan, new_price, new_period_end, explanation}` |
| `POST /subscriptions/change` | customer | `{plan_id}` |
| `POST /subscriptions/renew` | customer | |
| `POST /subscriptions/cancel` | customer | `{mode: period_end or immediate}` |
| `POST /subscriptions/cancel/undo` | customer | |
| `GET /invoices`, `GET /invoices/{id}`, `GET /invoices/{id}/pdf` | user | own only; page params `page`, `page_size` |
| `GET /payments` | user | own only |
| `GET /payment-method`, `PUT /payment-method` | user | `{card}`; only brand and last4 returned |
| `GET /admin/analytics/summary`, `/revenue`, `/plans` | admin | `from`, `to`, `group_by` |
| `GET/POST /admin/plans`, `PUT /admin/plans/{id}`, `POST /admin/plans/{id}/deactivate` | admin | |
| `GET /admin/customers` | admin | `q`, `page` |
| `POST /admin/subscriptions/{id}/renew` | admin | |
| `GET /admin/invoices`, `GET /admin/payments` | admin | filters `status`, `user_id`, `from`, `to` |
| `GET /health` | public | |

`card` = `{number, expiry, cvc, name?}`. These two endpoints were added to the design during planning: `change-preview` and `invoices/{id}/pdf`.

## Steps
- [x] **Step 1 — Foundation**: project config, settings, database session, security (bcrypt/JWT), error handling, SQLAlchemy models, Pydantic schemas, the simulated gateway, Alembic migration, seed data, Dockerfile and env example. Unit tests for the gateway.
- [ ] **Step 2 — Business logic and API**: auth, plans, billing (invoices, payments, payment method, PDF), subscription service (subscribe, change plan with preview, renew, cancel), analytics, admin service, the renewal scheduler, routers and `main.py`. Unit and API tests for auth, subscriptions, scheduler, billing and admin.
- [ ] **Step 3 — Documentation and deployment**: root `docker-compose.yml`, `.gitignore`, README and the unit summary.

## Stories implemented
All 22 stories (US-1 to US-22) have backend behaviour. See the map below.

## File to User Story Map

| File path | User stories |
|-----------|--------------|
| code/backend/requirements.txt | US-1: Register an account (FR 3) |
| code/backend/Dockerfile | US-1: Register an account (FR 3) |
| code/backend/.env.example | US-3: Restrict admin areas (FR 3) |
| code/backend/pytest.ini | US-1: Register an account (FR 3) |
| code/backend/alembic.ini | US-1: Register an account (FR 3) |
| code/backend/alembic/env.py | US-1: Register an account (FR 3) |
| code/backend/alembic/versions/0001_initial.py | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8); US-16: View invoices (FR 4.6); US-17: View payment history (FR 4.7) |
| code/backend/app/__init__.py | US-1: Register an account (FR 3) |
| code/backend/app/main.py | US-2: Log in and out (FR 3); US-10: Automatic renewal (FR 4.4) |
| code/backend/app/core/__init__.py | US-1: Register an account (FR 3) |
| code/backend/app/core/config.py | US-3: Restrict admin areas (FR 3); US-10: Automatic renewal (FR 4.4) |
| code/backend/app/core/database.py | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8) |
| code/backend/app/core/security.py | US-2: Log in and out (FR 3) |
| code/backend/app/core/errors.py | US-6: Handle a failed first payment (FR 4.2, 4.8) |
| code/backend/app/core/deps.py | US-2: Log in and out (FR 3); US-3: Restrict admin areas (FR 3) |
| code/backend/app/models.py | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8); US-16: View invoices (FR 4.6); US-17: View payment history (FR 4.7) |
| code/backend/app/schemas.py | US-4: Browse plans (FR 4.1); US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8) |
| code/backend/app/gateway.py | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8); US-6: Handle a failed first payment (FR 4.2, 4.8); US-13: Update payment method (FR 4.8) |
| code/backend/app/seed.py | US-3: Restrict admin areas (FR 3); US-4: Browse plans (FR 4.1) |
| code/backend/app/services/__init__.py | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8) |
| code/backend/app/services/auth_service.py | US-1: Register an account (FR 3); US-2: Log in and out (FR 3) |
| code/backend/app/services/plan_service.py | US-4: Browse plans (FR 4.1); US-18: Manage plans (FR 4.1) |
| code/backend/app/services/billing_service.py | US-16: View invoices (FR 4.6); US-17: View payment history (FR 4.7); US-13: Update payment method (FR 4.8); US-20: View all invoices and payments (FR 4.6, 4.7) |
| code/backend/app/services/subscription_service.py | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8); US-6: Handle a failed first payment (FR 4.2, 4.8); US-7: Upgrade a plan with proration (FR 4.3); US-8: Downgrade a plan (FR 4.3); US-9: Preview a plan change (FR 4.3); US-10: Automatic renewal (FR 4.4); US-11: Manual renew now (FR 4.4); US-12: Recover from failed renewal (FR 4.4, 4.7); US-14: Cancel at period end (FR 4.5); US-15: Cancel immediately (FR 4.5) |
| code/backend/app/services/analytics_service.py | US-21: View analytics dashboard (FR 4.9) |
| code/backend/app/services/admin_service.py | US-19: Search customers and subscriptions (FR 4.9); US-22: Trigger a renewal as admin (FR 4.4) |
| code/backend/app/services/pdf.py | US-16: View invoices (FR 4.6) |
| code/backend/app/scheduler.py | US-10: Automatic renewal (FR 4.4); US-12: Recover from failed renewal (FR 4.4, 4.7) |
| code/backend/app/routers/__init__.py | US-2: Log in and out (FR 3) |
| code/backend/app/routers/auth.py | US-1: Register an account (FR 3); US-2: Log in and out (FR 3) |
| code/backend/app/routers/plans.py | US-4: Browse plans (FR 4.1) |
| code/backend/app/routers/subscriptions.py | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8); US-7: Upgrade a plan with proration (FR 4.3); US-9: Preview a plan change (FR 4.3); US-11: Manual renew now (FR 4.4); US-14: Cancel at period end (FR 4.5); US-15: Cancel immediately (FR 4.5) |
| code/backend/app/routers/billing.py | US-13: Update payment method (FR 4.8); US-16: View invoices (FR 4.6); US-17: View payment history (FR 4.7) |
| code/backend/app/routers/admin.py | US-18: Manage plans (FR 4.1); US-19: Search customers and subscriptions (FR 4.9); US-20: View all invoices and payments (FR 4.6, 4.7); US-21: View analytics dashboard (FR 4.9); US-22: Trigger a renewal as admin (FR 4.4) |
| code/backend/tests/__init__.py | US-1: Register an account (FR 3) |
| code/backend/tests/conftest.py | US-2: Log in and out (FR 3) |
| code/backend/tests/test_gateway.py | US-6: Handle a failed first payment (FR 4.2, 4.8); US-13: Update payment method (FR 4.8) |
| code/backend/tests/test_auth.py | US-1: Register an account (FR 3); US-2: Log in and out (FR 3); US-3: Restrict admin areas (FR 3) |
| code/backend/tests/test_subscriptions.py | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8); US-6: Handle a failed first payment (FR 4.2, 4.8); US-7: Upgrade a plan with proration (FR 4.3); US-8: Downgrade a plan (FR 4.3); US-9: Preview a plan change (FR 4.3); US-14: Cancel at period end (FR 4.5); US-15: Cancel immediately (FR 4.5) |
| code/backend/tests/test_scheduler.py | US-10: Automatic renewal (FR 4.4); US-11: Manual renew now (FR 4.4); US-12: Recover from failed renewal (FR 4.4, 4.7) |
| code/backend/tests/test_billing_admin.py | US-16: View invoices (FR 4.6); US-17: View payment history (FR 4.7); US-18: Manage plans (FR 4.1); US-19: Search customers and subscriptions (FR 4.9); US-20: View all invoices and payments (FR 4.6, 4.7); US-21: View analytics dashboard (FR 4.9); US-22: Trigger a renewal as admin (FR 4.4) |
| code/docker-compose.yml | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8) |
| code/.gitignore | US-1: Register an account (FR 3) |
| code/README.md | US-1: Register an account (FR 3) |

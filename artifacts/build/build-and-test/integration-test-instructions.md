# Integration Test Instructions

## Purpose
Verify the Frontend App and Backend API work together against real Postgres, exercising real reads and writes, not just health checks.

## Test Scenarios

### Scenario 1: Backend primary flow (auth first)
- **Setup**: `docker compose up -d --build`, `alembic upgrade head`, `python -m app.seed`.
- **Steps**:
  1. `POST /auth/register` then `POST /auth/login` returns a JWT.
  2. `GET /plans` returns the four seeded plans.
  3. `POST /subscriptions` with test card `4242424242424242` creates a subscription, invoice and payment.
  4. `GET /subscriptions/change-preview?plan_id=...` returns the amount due.
  5. `POST /subscriptions/change` charges that amount.
  6. `GET /invoices`, `GET /invoices/{id}/pdf` (a PDF is returned), `GET /payments`.
  7. `POST /subscriptions/cancel` and the undo call.
  8. Log in as the seeded admin: `GET /admin/analytics`, `GET /admin/customers`, plan create/update/deactivate.
- **Expected**: 2xx on every call; money values are strings with 2 decimals; no 500s (this exercises the ORM relationships).

### Scenario 2: Failure simulation
- Subscribe with `4000000000000002` (declined) and `4000000000009995` (insufficient funds): expect a gateway error in the standard error format and no active subscription.

### Scenario 3: Renewal
- As admin, trigger renewal for a subscription (`/admin/...renew`): expect a new invoice and an extended period. With a failing card the status becomes `past_due`.

### Scenario 4: Frontend to backend contract
- For each literal path in `code/frontend/src/api`, confirm a matching route is registered in the backend (`GET /openapi.json`).
- With both running, open http://localhost:5173, register, subscribe, change plan, download an invoice PDF, and view the admin dashboard.
- **Expected**: no CORS or 404 errors in the browser console.

## Run
```bash
cd code/backend && pytest tests/        # service-level checks
curl -s http://localhost:8000/openapi.json | python -m json.tool | grep '"/'
```

## Cleanup
```bash
cd code && docker compose down -v
```

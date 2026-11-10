# Unit Test Instructions

- Backend: `cd code/backend && pytest -q`. Uses in-memory SQLite and covers auth, catalog filters, cart stock limits, checkout, declined-payment retry, cancel with stock restore, order isolation, admin authorization, product soft delete, forward-only status and user deactivation.
- Frontend: `cd code/frontend && npm test`. Covers validators, formatting and UI kit components.

Expected: all tests pass.

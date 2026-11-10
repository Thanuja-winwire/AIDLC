# Test Results Summary (Version 1)

CI run: https://github.com/Thanuja-winwire/AIDLC/actions/runs/42783468186 (result: succeeded)

| Suite | Tests | Passed | Failed | Skipped |
|---|---|---|---|---|
| Backend (pytest, `code/backend/tests`) | 13 | 13 | 0 | 0 |
| Frontend (vitest, `code/frontend/src/__tests__`) | 8 | 8 | 0 | 0 |

Compile gates: backend `compileall` passed; frontend `npm run build` passed.

Backend tests cover: register/login/duplicate, weak password, auth guard, catalog search and filters, cart stock limit, checkout (stock decrement, cart clear), declined payment then retry, cancel restoring stock, empty-cart checkout, order isolation between users, admin forbidden for customers, admin product CRUD and soft delete, forward-only order status, admin user management.

Frontend tests cover validators and a few UI kit components only. No page-level or API-integration tests exist.

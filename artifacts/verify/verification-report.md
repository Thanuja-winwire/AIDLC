# Verification Report (Version 1)

## Result
The Verify pipeline was re-run on branch `aidlc/e-commerce-app` as GitHub Actions run 43169252396 (https://github.com/Thanuja-winwire/AIDLC/actions/runs/43169252396) and finished as succeeded. This in-place correction replaces the figures from run 42783468186.

| Check | Result |
|---|---|
| Pipeline run | Succeeded, no failed steps reported |
| Backend pytest | 13/13 passed (read from `test-results.xml`) |
| Backend coverage | 86% line coverage (728/843 statements) |
| Frontend build gate and vitest | No step failed; test counts not re-read this run (8/8 in run 42783468186) |
| Frontend coverage | Not available |
| Failures | None |

## Coverage
Backend line coverage is 86%. The weakest modules are `cart_service.py` (61%), `admin_service.py` (74%) and `routers/admin.py` (78%). Per-module figures and the uncovered areas are in `coverage/coverage-summary.md`. Frontend coverage could not be read from the branch, so none is claimed.

## Gaps and caveats
- Frontend results: no frontend results or coverage file could be read from the branch for this run, so the frontend test count is carried from the earlier run.
- Run attribution: result and coverage files carry no run ID. They are matched to this run by fresh timestamps only.
- Runtime exercising: the backend tests exercise auth, catalog, cart, checkout, orders and admin endpoints through the API against the test database. The server was not separately booted against PostgreSQL, and the frontend was never run against the backend.
- Frontend: only validators and UI kit components are tested. Pages, route guards, contexts and API integration are untested.
- Spec conflict: US-13 says admins cannot deactivate or demote themselves, but the code follows BR-M6, which allows it. No test covers this.
- Performance and integration instructions from Build were not executed.
- No visual screenshot self-check of the UI was performed.

## Source edits
None. No files under `code/` were changed.

# Verification Report (Version 1)

Run: https://github.com/Thanuja-winwire/AIDLC/actions/runs/43853371915 (GitHub Actions, result: **succeeded**)

## Results
| Suite | Tests | Passed | Failed | Notes |
|---|---|---|---|---|
| Backend `pytest` | 51 | 51 | 0 | 47/51 passed on the first run; 4 failures fixed (below) |
| Frontend `vitest` | 10 | 10 | 0 | |
| Backend compile (`compileall`) | - | pass | - | |
| Frontend `tsc --noEmit` + `vite build` | - | pass | - | after one fix (below) |

## Coverage
- Backend: **95.6%** lines (1042/1090). Gaps: scheduler start-up, some error branches, `resolve_payment_method` with a new card.
- Frontend: **6.5%** lines (92/1410). Only validation, formatting and route guards have tests. All pages, dialogs, the API client and hooks are untested. This is a significant gap.
- Gap: no test covers the live app (`/health`, Postgres, Docker Compose, the frontend talking to the backend). The suites use in-memory SQLite and mocks. The integration and performance (k6) instructions were **not run**.

## Defects found and fixed in Verify
1. `frontend/src/components/AppShell.tsx` failed `tsc` (TS2322: `"end" in rest ? rest.end` was typed `unknown`). Fixed by giving nav items an explicit `NavItem` type. Real code defect.
2. Four backend **test** defects (the application code was correct):
   - `test_admin_customers_search`: searching `casey` matched two customers, so it now searches by the full email.
   - `test_admin_invoices_payments_filters` and `test_analytics_counts_failed_payments`: a declined first subscribe correctly returns 402, but the helper asserted 201. Added a declined-expectation helper.
   - `test_scheduler_renews_due_subscription`: compared against the pre-due period end; now compared against the due end.
   These edits changed test expectations only, not behaviour.
3. Earlier turns (not re-verified individually): the recharts Tooltip formatter typing in `AnalyticsDashboardPage.tsx` and `tsconfig.json` `types`.

## SonarQube (report-only, nothing fixed)
- Verdict: **PASS**, 0 must-fix issues, 9 MEDIUM issues, 0.0% duplication, 3128 ncloc.
- Quality gate: **ERROR**, only on `new_coverage` (0.0% against a threshold of 80%), caused by the untested frontend.
- Issues: unhandled promises (`S9383`) in the admin plans page and queries; a regex with non-linear backtracking in `validation.ts`; label and non-native interactive element accessibility issues; a `yield` cleanup in the `main.py` lifespan.
- Details: `artifacts/verify/sonar/sonar-summary.md` and `sonar-issues.json`.

## Not verified
- Primary flow against a running stack (login, subscribe, plan change, PDF) via Docker Compose.
- Frontend-to-backend path diff against `openapi.json`.
- Alembic migration on Postgres (tests use `create_all` on SQLite).
- k6 performance targets.

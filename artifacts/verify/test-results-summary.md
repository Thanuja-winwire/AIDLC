# Test Results Summary — Version 1

CI run 44086586573: **succeeded**.

| Suite | Tests | Passed | Failed |
|---|---|---|---|
| Backend (pytest) | 13 | 13 | 0 |
| Frontend (Vitest) | 5 | 5 | 0 |

The live smoke test passed. It covered create, duplicate email (409), get, search, update, dashboard, delete (204) and a 404 after delete.

Earlier runs: run 1 failed on the backend import check (`list` annotation shadowing). Run 2 failed on `test_update_own_email_ok_and_duplicate_rejected` (UTC timestamp consistency). Both were fixed. See `verification-report.md`.

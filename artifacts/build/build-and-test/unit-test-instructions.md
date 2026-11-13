# Unit Test Execution

## Backend
```bash
cd code/backend
pytest --cov=app --cov-report=term-missing --junitxml=test-results.xml
```
- Uses in-memory SQLite fixtures from `conftest.py`.
- Covers auth, catalog and suppliers, stock ledger, purchasing, operations (transfers and adjustments), sales and insights (seven test files).
- Expected: all tests pass.

## Frontend
```bash
cd code/frontend
npm test -- --run
```
Expected: all Vitest tests pass (for example `LoginPage.test.tsx`).

## Reviewing results
- Backend: terminal output and `test-results.xml`
- If tests fail: read the traceback, fix the code, and rerun.
- Note: SQLite does not enforce row locks or sequences. Those paths are checked against PostgreSQL in the integration tests.

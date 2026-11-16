# Unit Test Execution

## Run Unit Tests

### 1. Execute All Unit Tests
```bash
cd code/backend && pytest --cov=app --cov-report=term-missing   # in-memory SQLite, no Postgres needed
cd code/frontend && npm test -- --run
```

### 2. Review Test Results
- **Expected**: all tests pass, 0 failures.
  - Backend: gateway, auth, subscriptions (subscribe, change plan, cancel, renew), scheduler, billing and admin.
  - Frontend: validation, formatting and route guards.
- **Coverage target**: 70% or more on backend services.
- **Reports**: terminal output; optionally `--cov-report=html` in `code/backend/htmlcov/`.

### 3. Fix Failing Tests
1. Read the failing test output.
2. Identify the failing case.
3. Fix the code (or test).
4. Rerun until green.

# Unit Test Instructions — task-manager

## Backend
```bash
cd code/backend
pytest -v --cov=app --cov-report=term-missing   # add pytest-cov if coverage is wanted
```
- `tests/test_data_access.py`: CRUD, filter combination, newest-first sort, summary with all keys.
- `tests/test_api.py`: status codes (201, 204, 404, 422), defaults, title trimming, filters, dashboard reflecting create/update/delete.
- Each test uses a temporary SQLite file via `TASK_DB_PATH`.

## Frontend
```bash
cd code/frontend
npm test
```
- `src/api/client.test.js`: query building, POST, 422 field-error mapping, 204 handling, network failure.

## Expected
All tests pass. Failures should be fixed in `code/`, not by editing the tests to match.

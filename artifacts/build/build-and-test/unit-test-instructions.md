# Unit Test Instructions

## Backend
```
cd code/backend && pytest -v
```
Covers CRUD, validation messages, case-insensitive duplicate email (409), update excluding own record, 404s, newest-first order, search (fields, case, blank, literal wildcards) and dashboard grouping. Tests use an in-memory SQLite database. Expected: all pass.

## Frontend
```
cd code/frontend && npm test
```
Covers client validation rules mirroring BR-1..BR-5. Expected: all pass.

# Code Generation Summary: student-management

## Backend (`code/backend/`)
FastAPI, three layers: routers -> services -> repository, SQLite via SQLAlchemy. Pydantic schemas enforce BR-1..BR-5; case-insensitive unique email index (BR-6..BR-8); search with escaped wildcards (BR-12..BR-14); newest-first ordering (BR-15); dashboard grouping (BR-16..BR-18). Errors map to 404, 409 and 422.

## Frontend (`code/frontend/`)
React + TypeScript + Vite + MUI with one custom theme. Dashboard page with stat cards, course breakdown, debounced search, student table (loading, empty, no-results, error states), add/edit modal with inline validation, delete confirmation and toasts. Vite proxies `/api` to port 8000.

## Checks done by reading the code
- Imports resolve to existing files; packages listed in the manifests.
- Frontend calls match backend routes: `/api/students`, `/api/students/{id}`, `/api/dashboard`.
- Local wiring: frontend 5173 -> proxy -> backend 8000.

All 39 planned files exist. Nothing was run in this phase; execution happens in Verify.

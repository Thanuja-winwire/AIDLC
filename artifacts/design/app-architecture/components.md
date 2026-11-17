# Components

Unit: `student-management` (backend `code/backend/`, frontend `code/frontend/`). Decisions: FastAPI, 3-layer backend, pages + components + one API client + hooks on the frontend, server-side search.

## Backend (FastAPI, SQLite via SQLAlchemy)

| Component | Purpose | Responsibilities |
|---|---|---|
| `main` (app factory) | App entry | Create the FastAPI app, register routers, configure CORS, create tables on startup, map domain errors to HTTP responses |
| `students_router` | HTTP layer for students | Routes under `/api/students`; parse and validate requests via schemas; call `StudentService`; return status codes (201/200/204/404/409/422) |
| `dashboard_router` | HTTP layer for dashboard | `GET /api/dashboard`; call `DashboardService` |
| `schemas` | API contracts (Pydantic) | `StudentCreate`, `StudentUpdate`, `StudentOut`, `DashboardOut`; field validation (required, lengths, email format, phone format, ISO date) and normalization (trim) |
| `StudentService` | Business rules | Email uniqueness (case-insensitive), not-found handling, normalization, orchestration of CRUD and search |
| `DashboardService` | Statistics | Total count and course-wise counts grouped by trimmed, case-insensitive course |
| `StudentRepository` | Data access | All SQL/ORM queries: insert, update, delete, get by id, get by email, list with search, count, group-by-course |
| `models` | Persistence model | `Student` ORM entity (id, name, email, phone, course, enrollment_date, created_at, updated_at); unique index on lowercased email |
| `database` | DB setup | Engine, session factory, `get_db` dependency; configurable `DATABASE_URL` (default SQLite) |
| `errors` | Domain exceptions | `StudentNotFoundError`, `DuplicateEmailError` |

## Frontend (React)

| Component | Purpose | Responsibilities |
|---|---|---|
| `api/client` | Single API client | All fetch calls to `/api/...`; normalizes errors (field errors for 422, duplicate email for 409) |
| `hooks/useStudents` | Data hook | Fetch list with debounced `q`, expose loading/error/refetch, and create/update/delete actions |
| `hooks/useDashboard` | Data hook | Fetch totals and course counts, refetch after mutations |
| `hooks/useDebouncedValue` | Utility hook | Debounce search input (about 300 ms) |
| `pages/DashboardPage` | Main page | Compose summary cards, course breakdown, search box, student table, add/edit modal, delete confirmation |
| `components/StatCard` | Display | Total students and course count cards |
| `components/CourseBreakdown` | Display | Course-wise counts (list with bars), empty state |
| `components/SearchBar` | Input | Search input with clear action |
| `components/StudentTable` | Display | Rows with Edit/Delete actions; loading skeleton, empty, no-results and error states |
| `components/StudentFormModal` | Form | Add/edit form with inline per-field validation and server error display |
| `components/ConfirmDialog` | Confirmation | Delete confirmation |
| `components/StatusViews` | Feedback | Shared spinner, empty, and error panels |
| `App` / `main` | Entry | Mount the page, global styles |

## Interfaces
- Frontend to backend: JSON REST over `/api` (dev proxy to backend port 8000).
- Router to service to repository: plain Python calls; the repository is the only layer that touches the ORM session.

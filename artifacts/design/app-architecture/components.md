# Components — Task Manager

Style: two-layer backend (routes -> data-access module, plain sqlite3); React frontend with API client + hooks.

## Backend (FastAPI)
| Component | Responsibility |
|---|---|
| `routes` (tasks_router, dashboard_router) | HTTP endpoints under `/api`; request validation via Pydantic models; maps errors to HTTP codes (404, 422) |
| `schemas` | Pydantic models: TaskCreate, TaskUpdate, TaskOut, DashboardSummary; enums for Status and Priority; title rules (non-empty, max 200) |
| `data_access` (tasks_db) | All SQLite access via sqlite3 with plain SQL: schema init, CRUD, filtered listing, summary counts. Holds the simple business logic (defaults, filters, aggregation) |
| `app` (main) | FastAPI app, CORS config, startup DB init, router registration |

## Frontend (React)
| Component | Responsibility |
|---|---|
| `api client` | Thin fetch wrapper for every `/api` endpoint; normalizes error messages |
| `hooks` (useTasks, useDashboard) | Hold tasks/filters/summary/loading/error state; re-fetch tasks and summary after every mutation |
| `Dashboard` | Total, counts by status and by priority; empty state |
| `FilterBar` | Status and priority selects, clear-filters |
| `TaskList` / `TaskCard` | Renders tasks, inline status change, edit and delete actions, empty/loading/error states |
| `TaskFormModal` | Create/edit form with validation and error display |
| `ConfirmDialog` | Delete confirmation |
| `App` | Page layout composing the above |

# Application Architecture — Task Manager

Sources: specs.md, stories.md, app-architecture-plan.md answers (two-layer backend, API client + hooks, plain sqlite3).

## Overview
One unit: a FastAPI + SQLite backend and a React frontend. Single user, no authentication.

## Components
- Backend: `app`, `routes`, `schemas`, `data_access` (plain SQL via sqlite3)
- Frontend: `api client`, hooks (`useTasks`, `useDashboard`), `Dashboard`, `FilterBar`, `TaskList`/`TaskCard`, `TaskFormModal`, `ConfirmDialog`, `App`

## Methods and API
- `data_access`: init_db, create_task, get_task, list_tasks(status, priority), update_task, delete_task, get_summary
- REST: GET/POST `/api/tasks`, GET/PUT/DELETE `/api/tasks/{id}`, GET `/api/dashboard/summary`

## Services / orchestration
No separate backend service layer; routes call data_access directly. The frontend hooks re-fetch tasks and summary after each mutation (FR-7).

## Dependencies and communication
```
UI -> hooks -> api client --HTTP /api--> routes -> data_access -> SQLite (tasks.db)
```
Vite dev proxy `/api` -> `localhost:8000`, plus backend CORS, so default config connects without manual setup.

## Story coverage
US-1..US-3: CRUD routes + TaskFormModal/ConfirmDialog. US-4: changeStatus via PUT. US-5: list filters + FilterBar. US-6/US-7: summary endpoint + Dashboard refreshed by hooks.

## Validation
All 7 stories map to at least one component; no circular dependencies.

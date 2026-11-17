# Unit of Work

## Unit: task-manager (single unit)
A single deployable application for one user to manage tasks, with a dashboard and filters.

### Logical modules
| Module | Responsibility |
|---|---|
| Backend API (FastAPI, SQLite) | Task CRUD, status change, filtering by status/priority, dashboard summary counts, validation |
| Frontend UI (React) | Task list, create/edit form, delete confirmation, quick status change, filters, dashboard |

### Code organization (greenfield)
```
code/
  backend/   # FastAPI app, models, routes, tests
  frontend/  # React app
  README.md
```
Frontend talks to the backend over HTTP/JSON; local dev ports and proxy are configured so both run together.

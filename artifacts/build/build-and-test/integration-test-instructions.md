# Integration Test Instructions — task-manager

Single unit with a frontend and a backend. These checks run against the real running processes, not mocks.

## Setup
Start the backend (port 8000) and the frontend (port 5173) as in the build instructions. Use a fresh `TASK_DB_PATH`.

## Primary flow, in order (via the proxy at :5173 or directly at :8000)
1. `GET /api/dashboard/summary` returns total 0 and all six count keys at 0.
2. `POST /api/tasks` with `{"title":"Write report","priority":"High","due_date":"2030-01-01"}` returns 201, status `Pending`.
3. `GET /api/tasks` returns the task; `GET /api/tasks/1` returns 200.
4. `PUT /api/tasks/1` with all fields and `status:"In Progress"` returns 200 with a refreshed `updated_at`.
5. `GET /api/tasks?status=In%20Progress&priority=High` returns it; `?status=Completed` returns `[]`.
6. `GET /api/dashboard/summary` shows total 1, In Progress 1, High 1.
7. `POST` with an empty title returns 422; `GET /api/tasks/999` returns 404; `?status=Bogus` returns 422.
8. `DELETE /api/tasks/1` returns 204; the summary returns to total 0.

## Frontend-to-backend contract (literal paths)
The frontend calls `/api/tasks`, `/api/tasks/{id}` (PUT, DELETE) and `/api/dashboard/summary`. All three are registered by the backend under the `/api` prefix.

## UI checks in a browser
- Create a task from the form: it appears and the dashboard counts update.
- Edit it, change status from the card dropdown, filter by status and priority, then clear the filters.
- Delete it via the confirmation dialog.
- Stop the backend and confirm the error banner with a Retry button appears.

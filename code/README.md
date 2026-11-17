# Task Manager

A simple task manager: create, edit, delete and manage tasks (title, description, priority, due date, status), with a dashboard of summaries and filters by status and priority.

- **Backend**: FastAPI + SQLite (`code/backend`), port 8000
- **Frontend**: React + Vite + Tailwind (`code/frontend`), port 5173 (proxies `/api` to the backend)

## Run the backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```
The database file `tasks.db` is created automatically (override with `TASK_DB_PATH`).

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## Tests
```bash
cd backend && pytest
cd frontend && npm test
```

## API
| Method | Path | Notes |
|---|---|---|
| GET | `/api/tasks?status=&priority=` | Newest first; filters combine with AND |
| POST | `/api/tasks` | 201 on success, 422 on invalid input |
| GET / PUT / DELETE | `/api/tasks/{id}` | 404 if missing; DELETE returns 204 |
| GET | `/api/dashboard/summary` | Totals by status and priority |

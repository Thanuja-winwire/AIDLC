# Student Management

Administrators can add, update, view and delete students, see a dashboard (total students, course-wise counts) and search the student list.

- Backend: FastAPI + SQLAlchemy + SQLite (`backend/`)
- Frontend: React + TypeScript + Vite + Material UI (`frontend/`)

## Run locally

Backend (port 8000):
```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend (port 5173, proxies `/api` to the backend):
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## Tests
```
cd backend && pytest
cd frontend && npm test
```

## API
- `GET /api/students?q=` · `POST /api/students`
- `GET|PUT|DELETE /api/students/{id}`
- `GET /api/dashboard`

Set `DATABASE_URL` to change the database (default `sqlite:///./students.db`).

# Inventory Management System

React + Vite + Tailwind frontend, FastAPI + PostgreSQL backend, JWT auth, Admin and Staff roles.

## Run with Docker
```
docker compose up --build
```
- App: http://localhost:8080
- API docs: http://localhost:8000/docs
- First sign-in: the default admin from `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` (seeded only when there are no users). Change the password and `JWT_SECRET` before real use.

## Run locally
Backend (needs PostgreSQL; copy `.env.example` to `.env`):
```
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
Frontend (dev server on 5173, proxies `/api` to port 8000):
```
cd frontend
npm install
npm run dev
```

## Tests
```
cd backend && pytest
cd frontend && npm test
```

## Notes
- All stock changes go through `StockLedger`, which locks rows, rejects negative stock and records a movement.
- Errors are returned as `{ "detail": ..., "code": ... }`.

# Build Instructions

## Prerequisites
Python 3.11+, Node 18+, PostgreSQL 14+ (or Docker for `code/docker-compose.yml`).

## Backend (`code/backend`)
1. `python -m venv .venv && source .venv/bin/activate`
2. `pip install -r requirements.txt`
3. `cp .env.example .env` (DATABASE_URL, JWT_SECRET, CORS_ORIGINS=http://localhost:5173)
4. Compile gate: `python -m compileall app seed.py` must exit 0.
5. `python seed.py`, then `uvicorn app.main:app --port 8000`.

## Frontend (`code/frontend`)
1. `npm install`
2. Compile gate: `npm run build` must exit 0.
3. `npm run dev` (port 5173). Vite proxies `/api` to `http://localhost:8000`, so the defaults connect with no extra setup.

## Whole-app start
Start the database, then the backend on 8000, then the frontend on 5173. Check `GET http://localhost:8000/health` returns `{"status":"ok"}` and that `http://localhost:5173/api/v1/products` (through the proxy) returns JSON.

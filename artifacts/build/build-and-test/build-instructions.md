# Build Instructions — task-manager

## Prerequisites
- Python 3.11+ and Node.js 18+ with npm.

## Backend (`code/backend`)
```bash
cd code/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -c "import app.main"          # import/compile check, must exit 0
python -m compileall app tests        # syntax check
uvicorn app.main:app --port 8000
```
- The SQLite file is created at `tasks.db`; override with `TASK_DB_PATH`.

## Frontend (`code/frontend`)
```bash
cd code/frontend
npm install
npm run build                         # clean compile gate, must exit 0
npm run dev                           # http://localhost:5173
```

## Start both together
1. Start the backend on port 8000.
2. Start the frontend on port 5173. Vite proxies `/api` to `http://localhost:8000`.
3. The backend CORS allows `http://localhost:5173`, so the two connect with no extra setup.
4. Confirm: `curl http://localhost:5173/api/dashboard/summary` returns JSON through the proxy.

## Expected
- Backend boots with no errors; `GET /health` returns `{"status":"ok"}`.
- `npm run build` finishes with no errors.

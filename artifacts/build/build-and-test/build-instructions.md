# Build Instructions

## Prerequisites
- Python 3.11+, Node.js 18+, npm

## Backend (`code/backend`)
```
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -c "import app.main"          # import/compile check
uvicorn app.main:app --port 8000     # start
```
Expected: "Application startup complete". Database file `students.db` is created on startup.

## Frontend (`code/frontend`)
```
npm install
npm run build      # runs tsc (type check) then vite build; must exit 0
npm run dev        # serves on http://localhost:5173
```

## Run both together
Start the backend on port 8000, then the frontend on 5173. Vite proxies `/api` to `http://localhost:8000`, so no extra configuration is needed. Confirm with `curl http://localhost:5173/api/health` returning `{"status":"ok"}`.

## Primary flow smoke test (real calls, not just health)
```
curl -X POST localhost:8000/api/students -H 'Content-Type: application/json' \
  -d '{"name":"Asha Rao","email":"asha@example.com","phone":"+91 98765 43210","course":"CS","enrollment_date":"2024-06-01"}'   # expect 201
curl localhost:8000/api/students?q=asha          # expect 1 result
curl -X PUT localhost:8000/api/students/1 -H 'Content-Type: application/json' -d '{...same fields, name changed...}'   # expect 200
curl localhost:8000/api/dashboard                # expect total 1, one course
curl -X DELETE localhost:8000/api/students/1     # expect 204
```

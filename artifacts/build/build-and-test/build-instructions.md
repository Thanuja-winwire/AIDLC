# Build Instructions

## Prerequisites
- **Backend**: Python 3.11+, PostgreSQL 16 (or Docker). Dependencies in `code/backend/requirements.txt`.
- **Frontend**: Node 20+, npm. Dependencies in `code/frontend/package.json`.
- **Environment variables**: backend `code/backend/.env.example` (database URL, JWT secret, admin seed credentials); frontend `code/frontend/.env.example` (`VITE_API_BASE_URL`, default `http://localhost:8000`).
- **System**: any OS with Docker; ~2 GB RAM.

## Build Steps

### 1. Install Dependencies
```bash
cd code/backend && pip install -r requirements.txt
cd ../frontend && npm install
```

### 2. Configure Environment
```bash
cp code/backend/.env.example code/backend/.env
cp code/frontend/.env.example code/frontend/.env
```

### 3. Build All Units
```bash
# Backend: compile check
cd code/backend && python -m compileall app
# Frontend: typecheck and production build (must exit clean)
cd code/frontend && npx tsc --noEmit && npm run build
```

### 4. Start the whole application together
```bash
cd code && docker compose up -d --build        # Postgres + backend on :8000
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seed
cd frontend && npm run dev                      # frontend on :5173, calls http://localhost:8000
```
Confirm connection: `curl http://localhost:8000/health` returns 200, and the frontend at http://localhost:5173 loads the login page without CORS or network errors.

### 5. Verify Build Success
- **Expected**: backend image builds, migrations apply, `tsc` and `vite build` exit 0.
- **Artifacts**: `code/frontend/dist/`, backend Docker image.
- **Acceptable warnings**: Vite chunk-size warning.

## Troubleshooting

### Dependency errors
- **Cause**: missing or incompatible package versions.
- **Solution**: use the Python/Node versions above; re-run install.

### Compilation errors
- **Cause**: type mismatch between frontend types and API.
- **Solution**: compare `code/frontend/src/api` with the backend schemas and fix the mismatch.

### Frontend cannot reach the backend
- **Cause**: wrong `VITE_API_BASE_URL` or CORS origin.
- **Solution**: set the URL to the backend host and add the frontend origin to the backend CORS settings.

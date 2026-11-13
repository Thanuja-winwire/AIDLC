# Build Instructions

## Prerequisites
- Python 3.11+, Node.js 20+ with npm, PostgreSQL 14+ (or Docker with Compose)
- Environment variables (see `code/backend/.env.example`): `DATABASE_URL`, `JWT_SECRET`, `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`, CORS origins
- ~2 GB RAM, ~1 GB disk

## Build Steps

### 1. Install dependencies
```bash
cd code/backend && pip install -r requirements.txt
cd ../frontend && npm install
```

### 2. Configure environment
```bash
cd code/backend && cp .env.example .env   # set DATABASE_URL and JWT_SECRET
alembic upgrade head
```

### 3. Build
```bash
cd code/frontend && npm run build          # runs the TypeScript check and Vite build
cd ../backend && python -m compileall app  # backend syntax check
```
Or build everything: `cd code && docker compose build`

### 4. Run all units together
```bash
cd code && docker compose up --build
```
- Frontend (nginx): http://localhost:8080, forwards `/api` to the backend
- Backend: http://localhost:8000 (`/health`, `/docs`)
- Local dev instead: backend on port 8000 and `npm run dev` on port 5173; the Vite proxy forwards `/api` to 8000.

### 5. Verify build success
- `npm run build` exits 0 and writes `code/frontend/dist`
- Backend logs show the migration completed and the server started
- `GET /health` returns 200

## Smoke flow (run in Verify)
1. `POST /api/auth/login` with the default admin credentials returns a JWT.
2. Create a product, location, and supplier (one write and one read each).
3. Create and approve a PO, then receive it; check that stock increases.
4. Create a transfer, an adjustment, and a sale; check that the stock levels and movements change.
5. `GET /api/insights/low-stock` and `GET /api/insights/dashboard` return 200.
6. Open http://localhost:8080 and sign in; confirm the API calls succeed through the proxy.

## Troubleshooting
- **Dependency errors**: check the Python and Node versions, then reinstall.
- **Type-check errors**: run `npx tsc --noEmit` in `code/frontend` and fix them.
- **Migration errors**: confirm `DATABASE_URL` points to a reachable PostgreSQL database.

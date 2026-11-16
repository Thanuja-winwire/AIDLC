# Subscription Management Platform

FastAPI + PostgreSQL backend (`backend/`) and React frontend (`frontend/`).

## Run the backend
```
docker compose up --build
```
API: http://localhost:8000 (docs at /docs). Run migrations and seed (admin + default plans) per `backend/` scripts:
```
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seed
```
Check `backend/.env.example` for the admin credentials and settings.

## Tests
```
cd backend && pip install -r requirements.txt && pytest
```

## Simulated gateway test cards
- `4000000000000002` declined
- `4000000000009995` insufficient funds
- any other valid card succeeds

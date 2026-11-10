# Shopwave — Full-stack E-commerce

React (Vite, Tailwind, lucide-react) + FastAPI + PostgreSQL. Payments are simulated by a mock gateway.

## Quick start

1. **Database** (optional helper): `docker compose up -d` (PostgreSQL on 5432, db `ecommerce`).
2. **Backend** (port 8000):
   ```
   cd backend
   python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   python seed.py                 # admin + sample catalog
   uvicorn app.main:app --reload --port 8000
   ```
3. **Frontend** (port 5173, proxies `/api` to the backend):
   ```
   cd frontend
   npm install
   npm run dev
   ```
Open http://localhost:5173. Admin login: `admin@example.com` / `Admin1234` (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` when seeding).

## Mock payments
`4242 4242 4242 4242` succeeds; `4000 0000 0000 0002` is declined; any other number is rejected. Any future expiry (MM/YY) and 3-4 digit CVC.

## Pricing and rules
No shipping charge, 8% tax. Order status moves forward only (paid → processing → shipped → delivered); cancelling restores stock. Product delete is soft. Admins have no self-protection (BR-M6): if every admin is locked out, run `python seed.py` with a fresh `ADMIN_EMAIL`.

## Tests
- Backend: `cd backend && pytest` (uses in-memory SQLite).
- Frontend: `cd frontend && npm test`.

API docs: http://localhost:8000/docs

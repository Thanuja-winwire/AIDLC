# Units of Work

## Single unit: `ecommerce-app`
A modular monolith delivered as one unit, with two deployable-locally modules.

### Modules
- **Backend (FastAPI, Python, PostgreSQL)**: auth, users, products, cart, orders, payments (mock provider interface), admin.
- **Frontend (React, JavaScript, Vite)**: storefront, cart/checkout, order tracking, admin dashboard.

### Responsibilities
Everything in FR-1..FR-9: JWT auth with customer/admin roles, catalog with search/filter/sort, server-side cart, transactional checkout, mock payment, order tracking, admin management, responsive validated UI.

### Code organization (greenfield)
```
code/
  backend/   app/ (routers, models, schemas, services, core), tests/, requirements.txt
  frontend/  src/ (pages, components, api, context), package.json
  docker-compose.yml  (optional PostgreSQL)
  README.md
```
Frontend reaches the backend through a Vite dev proxy to `/api`.

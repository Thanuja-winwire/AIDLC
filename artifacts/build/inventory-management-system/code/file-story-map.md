# File to Story Map - Inventory Management System

The authoritative map is in `design/plans/code-generation-plan.md`. Summary of what was generated under `code/`:

| Area | Location | Stories |
|------|----------|---------|
| Backend foundation (config, db, models, migration, schemas, repositories, core) | `code/backend/app/...`, `alembic/` | US-01 to US-15 |
| Backend business logic (StockLedger, numbering, services) | `code/backend/app/services/` | US-01 to US-15 |
| Backend API routers | `code/backend/app/api/` | US-01 to US-15 |
| Backend tests | `code/backend/tests/` | US-01 to US-15 |
| Frontend (UI kit, layout, 13 pages, API client, auth) | `code/frontend/src/` | US-01 to US-15 |
| Frontend tests | `code/frontend/src/test/` | US-01, US-02 |
| Deployment and docs | `code/docker-compose.yml`, Dockerfiles, `nginx.conf`, `README.md` | all |

Note: the plan's "105 files" self-check line is inaccurate; the tables are authoritative.

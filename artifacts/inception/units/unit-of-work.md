# Units of Work

## Unit 1: inventory-management-system (single unit)
A monolithic full-stack application made of a FastAPI backend and a React frontend backed by PostgreSQL. It is built, tested and run together via Docker Compose.

### Logical modules
| Module | Responsibility | Stories |
|---|---|---|
| auth-users | JWT login, roles (Admin/Staff), user management | US-01, US-02 |
| catalog | Products, categories, search and filter | US-03, US-04 |
| locations-stock | Locations, per-location stock, movement ledger | US-05, US-06 |
| suppliers | Supplier records | US-07 |
| purchasing | Purchase orders, approval, receiving | US-08, US-09 |
| stock-operations | Transfers and adjustments | US-10, US-11 |
| sales | Sales transactions | US-12 |
| insights | Low-stock alerts, sales reports with CSV export, dashboard | US-13, US-14, US-15 |
| frontend | React UI covering all modules | all |

### Code organization (greenfield, single unit)
```
code/
  backend/   (app/ with api, services, models, schemas, core; tests/; requirements.txt)
  frontend/  (src/ with pages, components, api, auth; package.json)
  docker-compose.yml
  README.md
```
Backend and frontend share one repository. The frontend calls the backend over `/api`.

# Units of Work

## Unit 1: student-management (single unit, monolith)
**Responsibility**: Student CRUD with validation, dashboard statistics and search, delivered as one application.

**Logical modules**
- Backend API (Python, SQLite): student routes, validation, repository, statistics and search
- Frontend (React): dashboard, searchable student list, add/edit form, delete confirmation

**Stories**: US-1 to US-6
**Requirements**: FR-1 to FR-6 in `specs.md`

## Code Organization Strategy (greenfield)
```
code/
  backend/    Python API, SQLite storage, tests
  frontend/   React app, tests
  README.md
```
Two sub-folders sit in one repository and are developed as one unit. The frontend calls the backend API through a dev-time proxy or a configured base URL.

## Project Mode
Single-unit. Design stages use flat paths with no `{unit-name}` folder.

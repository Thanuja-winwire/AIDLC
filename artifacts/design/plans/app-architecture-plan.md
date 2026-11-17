# Application Design Plan — Task Manager (single unit)

## Scope
Single-user Task Management app: FastAPI + SQLite backend, React frontend. Covers FR-1 to FR-7 (specs.md) and stories US-1 to US-7 (stories.md). Depth: minimal.

## Plan Checklist
- [ ] Generate components.md
- [ ] Generate component-methods.md
- [ ] Generate services.md
- [ ] Generate component-dependency.md
- [ ] Generate app-architecture.md (consolidated)
- [ ] Validate design completeness and consistency

## Questions

## Question 1
How should the backend be layered?

A) Three layers: routes (HTTP) -> service (business logic) -> repository (SQLite access)

B) Two layers: routes -> a single data-access module (logic inside routes/CRUD helpers)

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Two layers: routes -> a single data-access module (logic inside routes/CRUD helpers)

## Question 2
How should the frontend manage server data and the dashboard refresh (FR-7)?

A) A small API client module plus React hooks; re-fetch tasks and dashboard summary after every mutation

B) A data-fetching library (e.g. TanStack Query) with cache invalidation after mutations

C) Other (please describe after [Answer]: tag below)

[Answer]: A) A small API client module plus React hooks; re-fetch tasks and dashboard summary after every mutation

## Question 3
How should the database be accessed from Python?

A) SQLAlchemy ORM

B) Python built-in sqlite3 with plain SQL

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Python built-in sqlite3 with plain SQL

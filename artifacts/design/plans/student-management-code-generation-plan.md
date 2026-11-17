# Code Generation Plan: student-management

Single unit, monolith with two modules: `code/backend/` (FastAPI, SQLAlchemy, SQLite) and `code/frontend/` (React, TypeScript, Vite, MUI). Sources: `app-architecture.md`, `business-rules.md`, `domain-entities.md`, `frontend-components.md`, `stories.md`.

## Context
- **Stories**: US-1 to US-6 (all).
- **Dependencies**: none outside the unit. The frontend calls the backend at `/api/...` through a Vite proxy to `http://localhost:8000`.
- **Entity**: `Student` (the only table).
- **API**: GET/POST `/api/students`, GET/PUT/DELETE `/api/students/{id}`, GET `/api/dashboard`.

## Steps
- [x] **Step 1 - Foundation**: backend config, database, model, schemas (validation), errors, repository, with tests for the repository and validation.
- [x] **Step 2 - Business logic and API**: services, routers, the app entry with error mapping, with API tests (CRUD, validation, duplicates, search, dashboard).
- [x] **Step 3 - Frontend**: Vite/React/MUI project, theme, API client, hooks, dashboard page, components and validation tests.
- [x] **Step 4 - Documentation**: README with run instructions, `.gitignore`, unit summary.

## File to User Story Map
All 39 files as approved (see the approved plan); every file now exists under `code/`. Total planned `code/` files: 39.

# Code Generation Plan — task-manager

Sources: app-architecture.md, domain-entities.md, business-rules.md, frontend-components.md, stories.md.
Single unit, greenfield. Code under `code/backend` (FastAPI + sqlite3) and `code/frontend` (React + Vite + Tailwind).

## Unit context
- Stories: US-1 to US-7 (all assigned to this unit). No other units.
- Entity: `tasks` table (id, title, description, priority, due_date, status, created_at, updated_at).
- API: GET/POST `/api/tasks`, GET/PUT/DELETE `/api/tasks/{id}`, GET `/api/dashboard/summary`.
- Local wiring: backend on port 8000; Vite dev server on 5173 proxies `/api` to `http://localhost:8000`; backend CORS allows `http://localhost:5173`.

## Steps
- [ ] **Step 1 — Foundation**: backend structure, requirements, SQLite data access (init_db, CRUD, filtered list, summary) and data-access tests. Stories: US-1..US-7.
- [ ] **Step 2 — Backend API**: Pydantic schemas with validation, FastAPI app, CORS, routes, and API tests. Stories: US-1..US-7.
- [ ] **Step 3 — Frontend**: Vite/Tailwind setup, API client, hooks, Dashboard, FilterBar, TaskList/TaskCard, TaskFormModal, ConfirmDialog, designed states, client test. Stories: US-1..US-7. No Figma links exist.
- [ ] **Step 4 — Documentation**: README, .gitignore, unit summary. Stories: US-1..US-7.

## File to User Story Map

| File path | User stories |
|-----------|--------------|
| code/backend/requirements.txt | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-3: Delete a task (FR-3); US-4: Change task status quickly (FR-4); US-5: Filter tasks by status and priority (FR-5); US-6: View dashboard summary (FR-6); US-7: Dashboard stays current (FR-7) |
| code/backend/app/__init__.py | US-1: Create a task (FR-1) |
| code/backend/app/data_access.py | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-3: Delete a task (FR-3); US-4: Change task status quickly (FR-4); US-5: Filter tasks by status and priority (FR-5); US-6: View dashboard summary (FR-6); US-7: Dashboard stays current (FR-7) |
| code/backend/app/schemas.py | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-4: Change task status quickly (FR-4) |
| code/backend/app/routes.py | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-3: Delete a task (FR-3); US-4: Change task status quickly (FR-4); US-5: Filter tasks by status and priority (FR-5); US-6: View dashboard summary (FR-6); US-7: Dashboard stays current (FR-7) |
| code/backend/app/main.py | US-1: Create a task (FR-1); US-6: View dashboard summary (FR-6) |
| code/backend/tests/__init__.py | US-1: Create a task (FR-1) |
| code/backend/tests/conftest.py | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-3: Delete a task (FR-3) |
| code/backend/tests/test_data_access.py | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-3: Delete a task (FR-3); US-5: Filter tasks by status and priority (FR-5); US-6: View dashboard summary (FR-6) |
| code/backend/tests/test_api.py | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-3: Delete a task (FR-3); US-4: Change task status quickly (FR-4); US-5: Filter tasks by status and priority (FR-5); US-6: View dashboard summary (FR-6); US-7: Dashboard stays current (FR-7) |
| code/backend/pytest.ini | US-1: Create a task (FR-1) |
| code/frontend/package.json | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-3: Delete a task (FR-3); US-4: Change task status quickly (FR-4); US-5: Filter tasks by status and priority (FR-5); US-6: View dashboard summary (FR-6); US-7: Dashboard stays current (FR-7) |
| code/frontend/vite.config.js | US-1: Create a task (FR-1); US-6: View dashboard summary (FR-6) |
| code/frontend/index.html | US-6: View dashboard summary (FR-6) |
| code/frontend/tailwind.config.js | US-6: View dashboard summary (FR-6) |
| code/frontend/postcss.config.js | US-6: View dashboard summary (FR-6) |
| code/frontend/src/main.jsx | US-6: View dashboard summary (FR-6) |
| code/frontend/src/index.css | US-6: View dashboard summary (FR-6) |
| code/frontend/src/constants.js | US-1: Create a task (FR-1); US-4: Change task status quickly (FR-4); US-5: Filter tasks by status and priority (FR-5) |
| code/frontend/src/api/client.js | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-3: Delete a task (FR-3); US-4: Change task status quickly (FR-4); US-5: Filter tasks by status and priority (FR-5); US-6: View dashboard summary (FR-6) |
| code/frontend/src/api/client.test.js | US-1: Create a task (FR-1); US-5: Filter tasks by status and priority (FR-5) |
| code/frontend/src/hooks/useTasks.js | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-3: Delete a task (FR-3); US-4: Change task status quickly (FR-4); US-5: Filter tasks by status and priority (FR-5); US-7: Dashboard stays current (FR-7) |
| code/frontend/src/hooks/useDashboard.js | US-6: View dashboard summary (FR-6); US-7: Dashboard stays current (FR-7) |
| code/frontend/src/components/Dashboard.jsx | US-6: View dashboard summary (FR-6); US-7: Dashboard stays current (FR-7) |
| code/frontend/src/components/FilterBar.jsx | US-5: Filter tasks by status and priority (FR-5) |
| code/frontend/src/components/TaskCard.jsx | US-2: Edit a task (FR-2); US-3: Delete a task (FR-3); US-4: Change task status quickly (FR-4) |
| code/frontend/src/components/TaskList.jsx | US-1: Create a task (FR-1); US-5: Filter tasks by status and priority (FR-5) |
| code/frontend/src/components/TaskFormModal.jsx | US-1: Create a task (FR-1); US-2: Edit a task (FR-2) |
| code/frontend/src/components/ConfirmDialog.jsx | US-3: Delete a task (FR-3) |
| code/frontend/src/components/States.jsx | US-5: Filter tasks by status and priority (FR-5); US-6: View dashboard summary (FR-6) |
| code/frontend/src/App.jsx | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-3: Delete a task (FR-3); US-4: Change task status quickly (FR-4); US-5: Filter tasks by status and priority (FR-5); US-6: View dashboard summary (FR-6); US-7: Dashboard stays current (FR-7) |
| code/README.md | US-1: Create a task (FR-1); US-2: Edit a task (FR-2); US-3: Delete a task (FR-3); US-4: Change task status quickly (FR-4); US-5: Filter tasks by status and priority (FR-5); US-6: View dashboard summary (FR-6); US-7: Dashboard stays current (FR-7) |
| code/.gitignore | US-1: Create a task (FR-1) |

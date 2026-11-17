# Code Generation Plan: student-management

Single unit, monolith with two modules: `code/backend/` (FastAPI, SQLAlchemy, SQLite) and `code/frontend/` (React, TypeScript, Vite, MUI). Sources: `app-architecture.md`, `business-rules.md`, `domain-entities.md`, `frontend-components.md`, `stories.md`.

## Context
- **Stories**: US-1 to US-6 (all).
- **Dependencies**: none outside the unit. The frontend calls the backend at `/api/...` through a Vite proxy to `http://localhost:8000`.
- **Entity**: `Student` (the only table).
- **API**: GET/POST `/api/students`, GET/PUT/DELETE `/api/students/{id}`, GET `/api/dashboard`.

## Steps
- [ ] **Step 1 - Foundation**: backend config, database, model, schemas (validation), errors, repository, with tests for the repository and validation.
- [ ] **Step 2 - Business logic and API**: services, routers, the app entry with error mapping, with API tests (CRUD, validation, duplicates, search, dashboard).
- [ ] **Step 3 - Frontend**: Vite/React/MUI project, theme, API client, hooks, dashboard page, components and validation tests.
- [ ] **Step 4 - Documentation**: README with run instructions, `.gitignore`, unit summary.

## File to User Story Map

| File path | User stories |
|-----------|--------------|
| code/backend/requirements.txt | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4); US-5: See dashboard statistics (FR-5); US-6: Search students (FR-5, FR-6) |
| code/backend/pytest.ini | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4); US-5: See dashboard statistics (FR-5); US-6: Search students (FR-5, FR-6) |
| code/backend/app/__init__.py | US-1: Add a student (FR-1) |
| code/backend/app/database.py | US-1: Add a student (FR-1); US-2: View students (FR-2) |
| code/backend/app/models.py | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3) |
| code/backend/app/schemas.py | US-1: Add a student (FR-1); US-3: Update a student (FR-3) |
| code/backend/app/errors.py | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4) |
| code/backend/app/repository.py | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4); US-5: See dashboard statistics (FR-5); US-6: Search students (FR-5, FR-6) |
| code/backend/app/services.py | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4); US-5: See dashboard statistics (FR-5); US-6: Search students (FR-5, FR-6) |
| code/backend/app/routers/__init__.py | US-2: View students (FR-2) |
| code/backend/app/routers/students.py | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4); US-6: Search students (FR-5, FR-6) |
| code/backend/app/routers/dashboard.py | US-5: See dashboard statistics (FR-5) |
| code/backend/app/main.py | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4); US-5: See dashboard statistics (FR-5); US-6: Search students (FR-5, FR-6) |
| code/backend/tests/__init__.py | US-1: Add a student (FR-1) |
| code/backend/tests/conftest.py | US-1: Add a student (FR-1); US-2: View students (FR-2) |
| code/backend/tests/test_students_api.py | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4) |
| code/backend/tests/test_search_dashboard.py | US-5: See dashboard statistics (FR-5); US-6: Search students (FR-5, FR-6) |
| code/frontend/package.json | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4); US-5: See dashboard statistics (FR-5); US-6: Search students (FR-5, FR-6) |
| code/frontend/tsconfig.json | US-2: View students (FR-2) |
| code/frontend/vite.config.ts | US-2: View students (FR-2); US-5: See dashboard statistics (FR-5) |
| code/frontend/index.html | US-2: View students (FR-2) |
| code/frontend/src/main.tsx | US-2: View students (FR-2) |
| code/frontend/src/App.tsx | US-2: View students (FR-2) |
| code/frontend/src/theme.ts | US-2: View students (FR-2); US-5: See dashboard statistics (FR-5) |
| code/frontend/src/types.ts | US-1: Add a student (FR-1); US-2: View students (FR-2); US-5: See dashboard statistics (FR-5) |
| code/frontend/src/validation.ts | US-1: Add a student (FR-1); US-3: Update a student (FR-3) |
| code/frontend/src/validation.test.ts | US-1: Add a student (FR-1); US-3: Update a student (FR-3) |
| code/frontend/src/api/client.ts | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4); US-5: See dashboard statistics (FR-5); US-6: Search students (FR-5, FR-6) |
| code/frontend/src/hooks/useDebouncedValue.ts | US-6: Search students (FR-5, FR-6) |
| code/frontend/src/hooks/useStudents.ts | US-2: View students (FR-2); US-6: Search students (FR-5, FR-6) |
| code/frontend/src/hooks/useDashboard.ts | US-5: See dashboard statistics (FR-5) |
| code/frontend/src/pages/DashboardPage.tsx | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4); US-5: See dashboard statistics (FR-5); US-6: Search students (FR-5, FR-6) |
| code/frontend/src/components/StatCard.tsx | US-5: See dashboard statistics (FR-5) |
| code/frontend/src/components/CourseBreakdown.tsx | US-5: See dashboard statistics (FR-5) |
| code/frontend/src/components/SearchBar.tsx | US-6: Search students (FR-5, FR-6) |
| code/frontend/src/components/StudentTable.tsx | US-2: View students (FR-2); US-6: Search students (FR-5, FR-6) |
| code/frontend/src/components/StudentFormModal.tsx | US-1: Add a student (FR-1); US-3: Update a student (FR-3) |
| code/frontend/src/components/ConfirmDialog.tsx | US-4: Delete a student (FR-4) |
| code/frontend/src/components/StatusViews.tsx | US-2: View students (FR-2); US-5: See dashboard statistics (FR-5) |
| code/README.md | US-1: Add a student (FR-1); US-2: View students (FR-2); US-3: Update a student (FR-3); US-4: Delete a student (FR-4); US-5: See dashboard statistics (FR-5); US-6: Search students (FR-5, FR-6) |
| code/.gitignore | US-2: View students (FR-2) |

Total planned `code/` files: 39.

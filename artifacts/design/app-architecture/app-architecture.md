# Application Architecture — Student Management

## 1. Summary
A single-unit web app. A React frontend talks to a FastAPI backend over JSON REST. The backend has three layers (routers, services, repository) on SQLite through SQLAlchemy. Search runs on the server through `q`, and the frontend debounces input. Sources: `specs.md`, `stories.md`, and the approved architecture plan answers.

## 2. Decisions
| Topic | Decision |
|---|---|
| Backend framework | FastAPI with Pydantic validation |
| Backend layering | Routes, service, repository |
| Frontend structure | Pages, reusable components, one API client, data hooks |
| Search | Server side via `GET /api/students?q=`, debounced in the browser |
| Persistence | SQLite via SQLAlchemy, `DATABASE_URL` configurable |
| Dev wiring | Backend on port 8000; Vite proxies `/api` to it |

## 3. Proposed Code Layout
```
code/
  backend/
    app/ main.py, database.py, models.py, schemas.py, errors.py,
         repository.py, services.py, routers/students.py, routers/dashboard.py
    tests/
    requirements.txt
  frontend/
    src/ api/client.ts, hooks/, pages/DashboardPage, components/, App, main
    package.json, vite.config (proxy /api -> :8000)
```

## 4. Components
**Backend**: `main`, `students_router`, `dashboard_router`, `schemas`, `StudentService`, `DashboardService`, `StudentRepository`, `models`, `database`, `errors`.
**Frontend**: `api/client`, `useStudents`, `useDashboard`, `useDebouncedValue`, `DashboardPage`, `StatCard`, `CourseBreakdown`, `SearchBar`, `StudentTable`, `StudentFormModal`, `ConfirmDialog`, `StatusViews`.
Details: `components.md`.

## 5. API Contract
| Method | Path | Success | Errors |
|---|---|---|---|
| GET | /api/students?q= | 200 list | none |
| POST | /api/students | 201 student | 409, 422 |
| GET | /api/students/{id} | 200 student | 404 |
| PUT | /api/students/{id} | 200 student | 404, 409, 422 |
| DELETE | /api/students/{id} | 204 | 404 |
| GET | /api/dashboard | 200 `{total_students, total_courses, courses[{course,count}]}` | none |

The frontend must call exactly these literal paths. Routers are mounted with their full `/api/...` prefix in one place, so call sites and registrations match.

## 6. Layering and Dependencies
Routers use services. Services use the repository. The repository uses models. Nothing depends upward. Components are presentational. Only hooks call the API client. See `component-dependency.md`.

## 7. Requirement Coverage
| Requirement | Covered by |
|---|---|
| FR-1 Add | `POST /api/students`, `StudentService.create_student`, `StudentFormModal` |
| FR-2 View | `GET /api/students`, `GET /api/students/{id}`, `StudentTable` |
| FR-3 Update | `PUT /api/students/{id}`, `update_student`, `StudentFormModal` (edit mode) |
| FR-4 Delete | `DELETE /api/students/{id}`, `delete_student`, `ConfirmDialog` |
| FR-5 Dashboard | `DashboardService`, `GET /api/dashboard`, `StatCard`, `CourseBreakdown` |
| FR-6 Search | `list(q)` in the repository, `SearchBar`, `useDebouncedValue` |
| US-1 to US-6 | Mapped through the FRs above |

## 8. Cross-Cutting
- **Validation**: Pydantic schemas (422 with per-field messages); the service enforces uniqueness (409). The frontend mirrors the rules for inline feedback.
- **Errors**: domain exceptions mapped in `main`; frontend `ApiError`.
- **UI states**: loading, empty, no results and error are handled in `StudentTable`, `CourseBreakdown` and `StatusViews`.
- **Security**: server-side validation, ORM parameterized queries, and no authentication in this version (trusted use).
- **Testing**: backend tests for CRUD, validation, duplicate email, search and dashboard counts, using an in-memory SQLite database.

## 9. Validation
- Every FR and story maps to a component.
- Dependencies are acyclic and one-directional.
- The API paths in the frontend client match the router registrations.

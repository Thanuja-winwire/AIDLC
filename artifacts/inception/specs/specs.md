# Student Management Application — Specification

## 1. Overview
A web application that lets administrators manage student records (add, update, view, delete) and see a dashboard with summary statistics and a searchable student list.

## 2. Decisions (from approved clarifying questions)
| Topic | Decision |
|---|---|
| Tech stack | Python backend (FastAPI or Flask) + React frontend |
| Authentication | None — open access for now |
| Courses | Free-text course name per student |
| Validation | Required fields, valid email format, unique email, basic phone format |
| Workflow type | Simple |

## 3. Functional Requirements
- **FR-1 Add student**: create a record with name, email, phone, course, enrollment date.
- **FR-2 View students**: list all students and view a single student's details.
- **FR-3 Update student**: edit any field of an existing student.
- **FR-4 Delete student**: remove a student, with a confirmation prompt in the UI.
- **FR-5 Dashboard**: show
  - total number of students
  - course-wise student counts (grouped by course name, case-insensitive and trimmed)
  - a searchable student list
- **FR-6 Search**: case-insensitive partial match across name, email, phone and course, applied to the student list.

## 4. Data Model
**Student**
| Field | Type | Rules |
|---|---|---|
| id | integer | auto-generated primary key |
| name | string | required, max 100 characters |
| email | string | required, valid format, unique (case-insensitive) |
| phone | string | required, basic format: 7–15 digits, optional leading +, spaces and hyphens allowed |
| course | string | required, free text, max 100 characters |
| enrollment_date | date | required, ISO format (YYYY-MM-DD) |
| created_at / updated_at | timestamp | system-managed |

## 5. API (REST, JSON)
| Method | Path | Purpose |
|---|---|---|
| GET | /api/students?q= | List students, optional search |
| POST | /api/students | Create a student |
| GET | /api/students/{id} | Get one student |
| PUT | /api/students/{id} | Update a student |
| DELETE | /api/students/{id} | Delete a student |
| GET | /api/dashboard | Total count and course-wise counts |

Error handling: 422 for validation errors with per-field messages, 409 for duplicate email, 404 for unknown id.

## 6. UI Requirements
- **Dashboard page**: summary cards (total students, courses), course-wise count list or chart, searchable student table with Edit and Delete actions and an Add Student button.
- **Add/Edit form**: modal or page with inline validation messages.
- Designed states: loading, empty ("no students yet"), no search results, and error.
- Responsive, with a consistent modern styling system that meets the enterprise UI baseline.

## 7. Non-Functional Requirements
- Persistence: SQLite for local use, accessed through an ORM so another database can be swapped in.
- Local dev wiring: the frontend must reach the backend without manual configuration (a dev proxy or a matching default base URL and port).
- Performance: the list and search should respond in under 1 second for up to a few thousand records.
- Security: input validation on the server; no authentication in this version, so the app is intended for trusted or internal use.
- Quality: automated backend tests for CRUD, validation and dashboard counts.

## 8. Out of Scope
Authentication and roles, a managed course catalogue, bulk import/export, pagination beyond basic needs, and deployment infrastructure.

## 9. Assumptions
- Single deployable unit: one backend plus one frontend in a single repository.
- Course-wise counts group by trimmed, case-insensitive course name.

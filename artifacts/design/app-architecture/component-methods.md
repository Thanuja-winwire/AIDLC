# Component Methods

Signatures and purpose only. Detailed business rules are defined in Functional Design.

## Backend

### StudentRepository
| Method | Input | Output | Purpose |
|---|---|---|---|
| `create(data)` | dict of student fields | `Student` | Insert a record |
| `get(student_id)` | int | `Student \| None` | Fetch by id |
| `get_by_email(email)` | str | `Student \| None` | Case-insensitive lookup for uniqueness |
| `list(q)` | `str \| None` | `list[Student]` | List all, or filter by partial match on name, email, phone, course |
| `update(student, data)` | `Student`, dict | `Student` | Apply changes and set `updated_at` |
| `delete(student)` | `Student` | None | Remove a record |
| `count()` | none | int | Total students |
| `count_by_course()` | none | `list[(course, count)]` | Group by trimmed, lowercased course |

### StudentService
| Method | Input | Output | Purpose |
|---|---|---|---|
| `create_student(payload)` | `StudentCreate` | `Student` | Enforce unique email, then create |
| `get_student(id)` | int | `Student` | Raise `StudentNotFoundError` if missing |
| `list_students(q)` | `str \| None` | `list[Student]` | Delegate search to the repository |
| `update_student(id, payload)` | int, `StudentUpdate` | `Student` | Check existence, check email uniqueness excluding self, update |
| `delete_student(id)` | int | None | Check existence, delete |

### DashboardService
| Method | Input | Output | Purpose |
|---|---|---|---|
| `get_dashboard()` | none | `DashboardOut` | Total, number of courses, course-wise counts |

### Routers
| Route | Handler | Success | Errors |
|---|---|---|---|
| `GET /api/students?q=` | `list_students` | 200 `list[StudentOut]` | none |
| `POST /api/students` | `create_student` | 201 `StudentOut` | 422, 409 |
| `GET /api/students/{id}` | `get_student` | 200 `StudentOut` | 404 |
| `PUT /api/students/{id}` | `update_student` | 200 `StudentOut` | 404, 409, 422 |
| `DELETE /api/students/{id}` | `delete_student` | 204 | 404 |
| `GET /api/dashboard` | `get_dashboard` | 200 `DashboardOut` | none |

### Schemas
- `StudentCreate` / `StudentUpdate`: name, email, phone, course, enrollment_date. Update takes the full set of fields.
- `StudentOut`: the above plus `id`, `created_at`, `updated_at`.
- `DashboardOut`: `total_students: int`, `total_courses: int`, `courses: list[{course: str, count: int}]`.

## Frontend

### api/client
| Function | Output |
|---|---|
| `listStudents(q?)` | `Promise<Student[]>` |
| `getStudent(id)` | `Promise<Student>` |
| `createStudent(data)` | `Promise<Student>` |
| `updateStudent(id, data)` | `Promise<Student>` |
| `deleteStudent(id)` | `Promise<void>` |
| `getDashboard()` | `Promise<Dashboard>` |

Failures throw `ApiError { status, message, fieldErrors? }`.

### Hooks
| Hook | Returns |
|---|---|
| `useDebouncedValue(value, delayMs)` | debounced value |
| `useStudents(q)` | `{ students, loading, error, refetch }` |
| `useDashboard()` | `{ data, loading, error, refetch }` |

### Component props (summary)
- `StudentTable({ students, loading, error, hasQuery, onEdit, onDelete, onRetry, onAdd })`
- `StudentFormModal({ open, student?, onSubmit, onClose })`; `onSubmit` returns a promise and surfaces `ApiError` field errors inline
- `ConfirmDialog({ open, title, message, onConfirm, onCancel })`
- `SearchBar({ value, onChange })`
- `StatCard({ label, value, icon })`
- `CourseBreakdown({ courses, total })`

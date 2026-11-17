# Frontend Components — student-management

Styling: **Material UI (MUI)** with `@mui/icons-material`, a custom theme (primary indigo accent, neutral grey scale, semantic success/warning/error/info, a defined type scale, 8px spacing, rounded 10-12px cards with subtle elevation). One theme, used consistently by every screen. Responsive via the MUI grid and breakpoints. Meets the Enterprise UI Baseline: hover/focus/disabled states, designed loading/empty/error states, filled primary vs outlined/text secondary actions, and icons for actions.

## Hierarchy
```
App (ThemeProvider, CssBaseline, SnackbarProvider)
  DashboardPage
    Header (title, Add Student button)
    StatCard x2 (Total students, Courses)
    CourseBreakdown
    SearchBar
    StudentTable
    StudentFormModal
    ConfirmDialog
```

## Components
| Component | Props | State / behavior |
|---|---|---|
| DashboardPage | none | `modal: {mode: 'create'\|'edit', student?} \| null`, `deleteTarget`, `searchInput`; `q = useDebouncedValue(searchInput, 300)`; coordinates refetch and toasts |
| StatCard | `label, value, icon, loading` | Skeleton while loading |
| CourseBreakdown | `courses, loading, error` | List with label, count and proportional bar; empty state "No courses yet" |
| SearchBar | `value, onChange, onClear` | Search icon, clear button when non-empty; placeholder "Search by name, email, phone or course" |
| StudentTable | `students, loading, error, query, onEdit, onDelete, onRetry, onAdd, onClearSearch` | Columns: Name, Email, Phone, Course, Enrollment date, Actions (edit/delete icon buttons with tooltips). Skeleton rows, empty, no-results and error panels. Horizontal scroll on small screens |
| StudentFormModal | `open, mode, student, onClose, onSubmit` | Fields: name, email, phone, course, enrollment date (date input). `values`, `errors`, `touched`, `submitting`, `serverError`. Submit disabled while submitting, with spinner |
| ConfirmDialog | `open, title, message, confirmLabel, loading, onConfirm, onCancel` | Destructive (error color) confirm button |
| StatusViews | `Spinner`, `EmptyState{title, message, action}`, `ErrorState{message, onRetry}` | Shared panels |

## Form validation (client, mirrors server)
Same rules and messages as BR-1..BR-5 in `business-rules.md`. Errors show after blur or submit. Server 422 field errors are mapped to fields; a 409 sets the email error "A student with this email already exists".

## API integration
| Component / hook | Endpoint |
|---|---|
| useStudents list | `GET /api/students?q=` |
| StudentFormModal create | `POST /api/students` |
| StudentFormModal edit | `PUT /api/students/{id}` |
| ConfirmDialog delete | `DELETE /api/students/{id}` |
| useDashboard | `GET /api/dashboard` |

All calls go through `api/client`. Dev wiring: Vite proxy forwards `/api` to `http://localhost:8000`.

## Feedback
After a successful add, edit or delete: close the dialog, show a brief toast (about 3 s), and refetch list and dashboard.

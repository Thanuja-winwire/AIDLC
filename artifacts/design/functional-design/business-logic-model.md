# Business Logic Model — student-management

## Create student (FR-1)
1. Router parses the body into `StudentCreate`; schema trims strings and applies BR-1..BR-5. Failure -> 422.
2. `StudentService.create`: look up `lower(email)` via the repository. Found -> `DuplicateEmailError` (409).
3. Repository inserts the row; `created_at` and `updated_at` set to now (UTC).
4. If the DB raises an integrity error (race), map to `DuplicateEmailError`.
5. Return `StudentOut` with 201.

## List and search (FR-2, FR-6)
1. Router reads optional `q`.
2. Service trims `q`; empty means no filter.
3. Repository builds the query: if `q`, `OR` of case-insensitive `contains` (escaped wildcards) over name, email, phone, course.
4. Order by `created_at` desc, `id` desc. Return a list of `StudentOut`.

## Get student (FR-2)
Repository `get(id)`; missing -> `StudentNotFoundError` (404).

## Update student (FR-3)
1. Validate `StudentUpdate` (same rules as create). Failure -> 422.
2. Load the student; missing -> 404.
3. Look up `lower(email)`; if another student (id differs) owns it -> `DuplicateEmailError` (409).
4. Apply the fields, set `updated_at`, commit, return `StudentOut` (200).

## Delete student (FR-4)
Load by id; missing -> 404. Delete and commit; return 204.

## Dashboard (FR-5)
1. `total_students` = count of all rows.
2. Fetch (course, created_at) rows; group by `lower(trim(course))`.
3. Per group: count; display name = most frequent original (trimmed) spelling, ties broken by earliest created.
4. Sort by count desc, then name asc. `total_courses` = number of groups.
5. Return `DashboardOut`.

## Frontend flows
- **Load**: `DashboardPage` mounts; `useDashboard` and `useStudents('')` fetch in parallel, each with a loading state.
- **Search**: typing updates the input immediately; `useDebouncedValue` (about 300 ms) updates `q`; `useStudents` refetches. The dashboard totals do not change with search. Clear restores the full list.
- **Add**: Add Student opens the modal in create mode -> client-side validation mirrors BR-1..BR-5 on blur and submit -> POST -> on success close modal, toast "Student added", refetch list and dashboard. On 422 show per-field messages; on 409 show the email error inline; the modal stays open.
- **Edit**: Edit opens the modal prefilled -> PUT -> on success close, toast "Student updated", refetch.
- **Delete**: Delete opens `ConfirmDialog` naming the student -> DELETE -> on success close, toast "Student deleted", refetch. On failure show an error toast and keep the list.
- **States**: loading (skeleton rows), empty ("No students yet" with an Add Student action), no results (shows the query and a clear-search action), error (message with Retry).

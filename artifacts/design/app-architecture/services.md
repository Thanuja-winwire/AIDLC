# Services

## StudentService
- **Responsibility**: all student business rules and orchestration of CRUD and search.
- **Collaborators**: `StudentRepository`.
- **Rules owned**: case-insensitive unique email (excluding the record being updated), not-found handling, field trimming.
- **Raises**: `StudentNotFoundError`, `DuplicateEmailError`. The app maps these to 404 and 409.
- **Transactions**: one session per request (`get_db`); commit on a successful write, roll back on failure.

## DashboardService
- **Responsibility**: read-only statistics for the dashboard.
- **Collaborators**: `StudentRepository` (`count`, `count_by_course`).
- **Output**: total students, number of distinct courses, course-wise counts sorted by count descending, then name. The display name for a group is the first-seen original spelling.

## Orchestration Patterns
1. **Create**: router validates the payload via `StudentCreate`, the service checks email uniqueness, the repository inserts, the router returns 201.
2. **Update**: router validates the payload, the service loads the record (404), checks the email against others (409), the repository updates.
3. **Delete**: the service loads the record (404), the repository deletes, the router returns 204.
4. **Search**: the router passes `q` to the service, which passes it to the repository. The repository applies a case-insensitive `LIKE %q%` over name, email, phone and course.
5. **Dashboard refresh (frontend)**: after any create, update or delete, the page calls `refetch` on both `useStudents` and `useDashboard`.

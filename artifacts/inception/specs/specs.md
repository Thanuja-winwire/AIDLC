# Specification — Task Management Application

## 1. Overview
A simple single-user Task Management web application to create, edit, delete and manage tasks, with a dashboard of task summaries and filters by status and priority.

## 2. Decisions (from requirement verification)
- Stack: Python FastAPI backend + React frontend (Q1: B)
- Storage/users: single user, no login, SQLite database (Q2: A)
- Dashboard: counts by status and counts by priority (Q3: A)
- Workflow type: Simple (minimal depth)

## 3. Functional Requirements
- FR-1 Create a task with: title (required), description (optional), priority (Low/Medium/High), due date, status (Pending/In Progress/Completed; default Pending).
- FR-2 Edit any field of an existing task.
- FR-3 Delete a task (with confirmation in the UI).
- FR-4 Change a task's status quickly (e.g. from the task list) .
- FR-5 List tasks, with filters by status and by priority (combinable), plus a clear-filters action.
- FR-6 Dashboard showing total tasks, counts per status, and counts per priority.
- FR-7 Dashboard updates after any create/edit/delete/status change.

## 4. API (REST, JSON)
- GET /api/tasks?status=&priority=
- POST /api/tasks
- GET /api/tasks/{id}
- PUT /api/tasks/{id}
- DELETE /api/tasks/{id}
- GET /api/dashboard/summary  -> {total, by_status, by_priority}
- Validation: title non-empty (max 200 chars); status and priority limited to allowed values; 404 for unknown id.

## 5. Non-Functional Requirements
- Local-run application; no authentication.
- Input validation on server; clear error messages in UI.
- Responsive, polished UI with designed empty/loading/error states.
- Backend unit/API tests with pytest; CORS/dev proxy so frontend connects to backend with default config.

## 6. Out of Scope
Authentication, multi-user, overdue/due-soon dashboard widgets, notifications, file attachments, deployment automation.

## 7. Assumptions
- Single deployable unit (one backend + one frontend, treated as one unit of work).
- Due date is a calendar date (no time component).

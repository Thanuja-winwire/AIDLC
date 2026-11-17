# Business Logic Model — task-manager

## Create task (US-1)
1. UI submits the form to POST /api/tasks.
2. Schema validation applies BR-1 to BR-5.
3. data_access inserts the row, setting created_at and updated_at, and returns the task.
4. Hooks refetch the task list and the summary.

## Edit task (US-2)
1. PUT /api/tasks/{id} with the full field set.
2. 404 if missing (BR-6); validate; update fields and updated_at.
3. Refetch list and summary.

## Delete task (US-3)
1. The user confirms in ConfirmDialog.
2. DELETE /api/tasks/{id} returns 204, or 404 if missing.
3. Refetch list and summary.

## Change status (US-4)
1. The status control on TaskCard calls update with the new status (BR-9).
2. Refetch list and summary.

## List and filter (US-5)
1. FilterBar holds status and priority (or "All").
2. GET /api/tasks?status=&priority= builds a WHERE clause from the provided filters.
3. ORDER BY created_at DESC, id DESC (BR-12).
4. Clear filters resets both and refetches.

## Dashboard summary (US-6, US-7)
1. GET /api/dashboard/summary runs `SELECT status, COUNT(*) ... GROUP BY` and the same for priority.
2. Zero-fill missing keys and compute total.
3. useDashboard refetches after any mutation.

## Frontend states
- Loading: skeletons. Empty: friendly message, with a "no matches" variant plus clear filters when filtered. Error: banner with retry.

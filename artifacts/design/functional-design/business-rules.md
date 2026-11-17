# Business Rules — task-manager

## Validation
- BR-1 Title is required; trimmed; must be non-empty and at most 200 characters.
- BR-2 Status must be one of Pending, In Progress, Completed; default Pending.
- BR-3 Priority must be one of Low, Medium, High; default Medium.
- BR-4 Due date is optional; if provided it must be a valid ISO date (YYYY-MM-DD). Past dates are allowed.
- BR-5 Description is optional, defaults to empty.

## Behaviour
- BR-6 Unknown task id on get/update/delete returns 404.
- BR-7 Invalid input returns 422 with field-level messages, shown in the form.
- BR-8 PUT replaces all editable fields; id and created_at are immutable; updated_at is refreshed.
- BR-9 Quick status change sends a PUT with the existing fields and the new status.
- BR-10 Delete requires UI confirmation and is permanent.

## Listing and filters
- BR-11 Filters by status and priority are optional and combine with AND.
- BR-12 Default sort is newest created first (created_at desc, id desc as tie-breaker).
- BR-13 An invalid filter value returns 422.

## Dashboard
- BR-14 Summary counts all tasks regardless of list filters.
- BR-15 Missing categories are reported as 0.
- BR-16 Overdue tasks get no special treatment (Q3: B); no overdue UI or counts.
- BR-17 The summary is refetched after every create, edit, delete and status change.

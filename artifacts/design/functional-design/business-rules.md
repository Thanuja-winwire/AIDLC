# Business Rules — student-management

## Validation (applied on create and update; server is authoritative, UI mirrors it)
| ID | Field | Rule | Message |
|---|---|---|---|
| BR-1 | name | Trim; required; max 100 | "Name is required" / "Name must be at most 100 characters" |
| BR-2 | email | Trim; required; valid email format; max 254 | "Email is required" / "Enter a valid email address" |
| BR-3 | phone | Trim; required; regex `^\+?[0-9 \-]+$` and digit count 7-15 | "Phone is required" / "Enter a valid phone number (7-15 digits)" |
| BR-4 | course | Trim; required; max 100 | "Course is required" / "Course must be at most 100 characters" |
| BR-5 | enrollment_date | Required; valid ISO date; future dates allowed | "Enrollment date is required" / "Enter a valid date" |

Phone is stored trimmed, exactly as typed (no normalization).

## Uniqueness
- BR-6: Email must be unique case-insensitively (`lower(email)`).
- BR-7: On update, the student's own record is excluded from the duplicate check, so saving with an unchanged email succeeds.
- BR-8: A duplicate returns 409 with field error on `email`: "A student with this email already exists". The database unique index on lowercased email is the final guard against races (an integrity error is mapped to the same 409).

## Update semantics
- BR-9: PUT replaces all editable fields; all fields are required (same rules as create).
- BR-10: `created_at` never changes; `updated_at` is set on every successful update.

## Delete
- BR-11: Delete is a hard delete. Unknown id returns 404. The UI always asks for confirmation first.

## Search
- BR-12: `q` is trimmed; empty or whitespace-only means no filter.
- BR-13: Case-insensitive partial match (`contains`) on name, email, phone and course; a student matches if any field matches.
- BR-14: LIKE wildcards (`%`, `_`) in `q` are escaped and treated literally.

## Ordering
- BR-15: Default list order is newest first (`created_at` desc, then `id` desc).

## Dashboard
- BR-16: `total_students` counts all students (not affected by search).
- BR-17: Courses are grouped by `lower(trim(course))`; the display name is the most frequent spelling in the group (ties: earliest created).
- BR-18: Courses are ordered by count desc, then display name asc.

## Error mapping
| Condition | Status | Body |
|---|---|---|
| Field validation fails | 422 | per-field messages |
| Duplicate email | 409 | `{ "field": "email", "message": ... }` |
| Unknown id | 404 | "Student not found" |

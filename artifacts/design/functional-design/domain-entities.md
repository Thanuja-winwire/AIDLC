# Domain Entities — student-management

## Student
| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | integer | PK, auto-generated | |
| name | string | required, trimmed, 1-100 chars | |
| email | string | required, valid format, max 254, unique case-insensitive | Stored trimmed; compared lowercased |
| phone | string | required, trimmed, 7-15 digits, optional leading `+`, spaces/hyphens allowed | Stored exactly as typed (trimmed) |
| course | string | required, trimmed, 1-100 chars | Free text |
| enrollment_date | date | required, ISO `YYYY-MM-DD`; future dates allowed | |
| created_at | timestamp (UTC) | system-set on insert | Default sort key |
| updated_at | timestamp (UTC) | system-set on insert and update | |

## Derived views (not persisted)
**DashboardSummary**
- `total_students`: integer
- `total_courses`: integer (number of distinct course groups)
- `courses`: list of `CourseCount { course: string, count: integer }`

Course grouping key = `lower(trim(course))`. Display name = the most frequent original spelling in the group (ties: earliest created). Courses are sorted by count descending, then name ascending.

## Relationships
None. Student is the only entity; course is an attribute, not an entity.

## Error entities
- `StudentNotFoundError(id)` -> 404
- `DuplicateEmailError(email)` -> 409
- `ValidationError(field_errors: map field -> message)` -> 422

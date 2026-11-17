# Domain Entities — task-manager

## Task
| Field | Type | Required | Notes |
|---|---|---|---|
| id | integer | auto | Primary key, autoincrement |
| title | string | yes | Trimmed, 1-200 chars |
| description | string | no | Default empty string |
| priority | enum | yes | Low, Medium, High (default Medium) |
| due_date | date (YYYY-MM-DD) | no | Optional (Q1: A); no time component |
| status | enum | yes | Pending, In Progress, Completed (default Pending) |
| created_at | datetime (UTC ISO) | auto | Set on create |
| updated_at | datetime (UTC ISO) | auto | Set on every update |

## Enums
- Status: `Pending`, `In Progress`, `Completed`
- Priority: `Low`, `Medium`, `High`

## DashboardSummary (derived, not stored)
```
{ total: int,
  by_status:   { "Pending": int, "In Progress": int, "Completed": int },
  by_priority: { "Low": int, "Medium": int, "High": int } }
```
All keys are always present, with 0 when empty.

## Storage
SQLite table `tasks` with CHECK constraints on status and priority.

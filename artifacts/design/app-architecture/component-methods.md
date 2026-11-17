# Component Methods — Task Manager

Detailed business rules are defined in Functional Design.

## Backend `data_access`
| Method | Input -> Output | Purpose |
|---|---|---|
| `init_db()` | -> None | Create tasks table if absent |
| `create_task(data: TaskCreate)` | -> Task | Insert; status defaults to Pending |
| `get_task(id: int)` | -> Task or None | Fetch one |
| `list_tasks(status: str or None, priority: str or None)` | -> list[Task] | Filtered listing |
| `update_task(id: int, data: TaskUpdate)` | -> Task or None | Update fields |
| `delete_task(id: int)` | -> bool | Delete; False if not found |
| `get_summary()` | -> DashboardSummary | Total, by_status, by_priority |

## Backend `routes`
| Endpoint | Input -> Output |
|---|---|
| `GET /api/tasks?status=&priority=` | -> list[TaskOut] |
| `POST /api/tasks` | TaskCreate -> TaskOut (201) |
| `GET /api/tasks/{id}` | -> TaskOut or 404 |
| `PUT /api/tasks/{id}` | TaskUpdate -> TaskOut or 404 |
| `DELETE /api/tasks/{id}` | -> 204 or 404 |
| `GET /api/dashboard/summary` | -> {total, by_status, by_priority} |

## Frontend `api client`
`listTasks(filters)`, `createTask(payload)`, `updateTask(id, payload)`, `deleteTask(id)`, `getSummary()`

## Frontend hooks
- `useTasks()` -> `{tasks, filters, setFilters, loading, error, create, update, remove, changeStatus, refresh}`
- `useDashboard()` -> `{summary, loading, error, refresh}`; refreshed after each mutation

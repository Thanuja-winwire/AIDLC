# Services — Task Manager

Per the chosen two-layer design there is no separate service layer on the backend. Orchestration is minimal:

- **Backend**: route handlers validate input (Pydantic), call `data_access` functions, and translate results to HTTP responses. Simple logic (default status, filtering, count aggregation) lives in `data_access`.
- **Frontend orchestration**: the `useTasks` hook coordinates each mutation: call API client -> on success re-fetch tasks list and dashboard summary (FR-7) -> on failure expose error message to the UI.
- **Each request** opens its own short-lived sqlite3 connection (thread-safe with FastAPI's threadpool).

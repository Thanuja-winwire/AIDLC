# Component Dependencies — Task Manager

## Dependency matrix (row depends on column)
| | schemas | data_access | routes | api client | hooks | UI components |
|---|---|---|---|---|---|---|
| routes | X | X | | | | |
| data_access | X | | | | | |
| app (main) | | X (init) | X | | | |
| hooks | | | | X | | |
| UI components | | | | | X | |

## Communication
- Frontend -> Backend: REST/JSON over HTTP at `/api/*`. Dev: Vite proxy forwards `/api` to the backend on port 8000; backend also enables CORS for the dev origin.
- Backend -> SQLite: plain sqlite3 file `tasks.db`.

## Data flow
```
UI component -> hook -> api client --HTTP--> routes -> data_access -> SQLite
     ^                                                      |
     +------------- state update <-- JSON response <--------+
```
After any mutation the hook re-fetches `GET /api/tasks` and `GET /api/dashboard/summary`.

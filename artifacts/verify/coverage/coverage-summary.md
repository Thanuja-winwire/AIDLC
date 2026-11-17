# Coverage Summary

## Backend (`code/backend/app`) — 98.7% statements (153/155)

| File | Statements | Coverage |
|---|---|---|
| data_access.py | 66 | 100% |
| routes.py | 33 | 100% |
| schemas.py | 41 | 100% |
| main.py | 15 | 87% (lines 13-14, the startup `lifespan`, not exercised) |

## Frontend (`code/frontend/src`) — 7.7% lines (55/711), 30% functions, 53% branches

| File | Lines | Coverage |
|---|---|---|
| api/client.js | 59 | 93.2% |
| App.jsx, constants.js, main.jsx | 131 | 0% |
| components/* (ConfirmDialog, Dashboard, FilterBar, States, TaskCard, TaskFormModal, TaskList) | 449 | 0% |
| hooks/useDashboard.js, hooks/useTasks.js | 72 | 0% |

## Gap

The frontend has only API-client unit tests. Every React component and hook is untested, so the UI behavior (forms, filters, dashboard rendering) is verified only by the successful build. This verification did not add tests, per the phase rules.

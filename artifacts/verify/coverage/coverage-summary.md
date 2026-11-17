# Coverage Summary — Version 1

| Area | Coverage |
|---|---|
| Backend statements | 94.2% (275 of 292) |
| Frontend | Only `validation.ts` has tests. Components, hooks and the API client are untested. |
| SonarQube overall | 27.6% |

Backend gaps: app startup (`lifespan`, `init_db`), `get_db`, the health endpoint, the IntegrityError branch in `_commit`, and a few validator error branches.

Raw reports are in `backend/` and `frontend/` under this folder.

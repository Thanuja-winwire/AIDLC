# Build and Test Summary

| Item | Command |
|---|---|
| Backend compile gate | `python -m compileall app seed.py` |
| Backend unit tests | `pytest -q` in `code/backend` |
| Frontend compile gate | `npm run build` in `code/frontend` |
| Frontend unit tests | `npm test` in `code/frontend` |
| Integration | See integration-test-instructions.md |

Ports: backend 8000, frontend 5173 (proxy `/api`), PostgreSQL 5432.
Nothing has been executed in the Build phase; the Verify phase runs these.

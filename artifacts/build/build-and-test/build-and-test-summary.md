# Build and Test Summary

Instructions only. Nothing has been executed in the Build phase; Verify runs everything.

## Units
- Backend API (FastAPI, PostgreSQL), `code/backend`
- Frontend App (React, Vite, Tailwind), `code/frontend`

## Planned checks (run in Verify)
| Check | Command | Expected |
|---|---|---|
| Backend compile | `python -m compileall app` | exit 0 |
| Frontend typecheck and build | `npx tsc --noEmit && npm run build` | exit 0 |
| Backend unit tests | `pytest --cov=app` | all pass |
| Frontend unit tests | `npm test -- --run` | all pass |
| Boot and primary flow | compose up, migrate, seed, login, subscribe, change plan, invoice PDF, admin analytics | no 5xx |
| Frontend/backend paths | compare frontend API paths to `/openapi.json` | all match |
| Performance (optional) | k6 or hey | p95 under 500 ms |

## Status
- **Build, tests, integration, performance**: not yet run.
- **Ready for Verification**: Yes.

## Next Steps
Proceed to the VERIFY phase.

# Build and Test Summary

| Item | Detail |
|---|---|
| Unit | student-management (backend + frontend) |
| Backend build | `pip install -r requirements.txt`, `python -c "import app.main"` |
| Frontend build | `npm install`, `npm run build` (tsc + vite) |
| Unit tests | `pytest` (backend), `npm test` (frontend) |
| Integration | Run both servers; flow in integration-test-instructions |
| Ports | backend 8000, frontend 5173 (proxy `/api`) |

These instructions are executed in the Verify phase. Nothing was run in Build.

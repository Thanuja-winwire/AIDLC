# Build and Test Summary — task-manager

| Item | Detail |
|---|---|
| Units | 1 (`task-manager`) |
| Backend | FastAPI + sqlite3, port 8000; tests with pytest |
| Frontend | React + Vite + Tailwind, port 5173; tests with vitest |
| Local wiring | Vite proxy `/api` to :8000; CORS allows :5173 |

## Commands
- Backend: `pip install -r requirements.txt && pytest`
- Frontend: `npm install && npm run build && npm test`
- Whole app: start both and run the primary flow in `integration-test-instructions.md`

## Status
Instructions only. Nothing has been executed in Build; Verify runs the install, compile, tests and the live flow.

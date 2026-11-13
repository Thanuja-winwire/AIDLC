# Code Summary - Inventory Management System

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL. Router -> Service -> Repository -> Model. `StockLedger` is the only code that changes stock.
- Frontend: React, Vite, TypeScript, Tailwind, TanStack Query, Axios. Dev server 5173 proxies `/api` to 8000; Docker serves via nginx on 8080 and proxies `/api` to the backend.
- Errors use `{detail, code}`; frontend reads `detail`.
- Nothing has been run, compiled or rendered in this phase. Install, typecheck, tests, boot and the primary-flow checks happen in Build and Test instructions and Verify.
- No Figma designs (skipped); no visual self-check was performed because no rendering was available.

# Frontend App — Code Summary

React 18 + TypeScript + Vite, Tailwind, React Router 6, TanStack Query 5, Axios, Recharts. All code is in `code/frontend/`.

## Structure
- `src/lib`: API client (literal backend paths, JWT from sessionStorage, 401 sign-out), formatting, validation.
- `src/auth`: auth context and route guards.
- `src/hooks/queries.ts`: query and mutation hooks; billing actions invalidate related queries.
- `src/components`: UI kit, app shell, card form, subscribe / plan-change / cancel dialogs.
- `src/pages`: customer screens; `src/pages/admin`: analytics, plans, customers, billing.
- `src/App.tsx`: routes with customer and admin guards.

## Notes
- Proration is never computed on the client; the plan-change dialog shows the backend `change-preview`.
- Admin call paths were checked against `routers/admin.py` (`/admin/analytics/*`, `/admin/plans`, `/admin/customers`, `/admin/subscriptions/{id}/renew`, `/admin/invoices`, `/admin/payments`).
- Nothing has been built or run in this phase; Verify executes install, `tsc` and tests.
- Figma Designs was skipped, so no Figma fidelity warnings apply. No screenshot self-check was possible in this stage.

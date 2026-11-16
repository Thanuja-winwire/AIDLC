# Code Generation Plan — frontend (Frontend App)

Single source of truth for generating `code/frontend/`. Built from the approved frontend functional design.

## Unit context
- Stack: React 18, TypeScript, Vite, Tailwind CSS, React Router 6, TanStack Query 5, Axios, Recharts, lucide-react, Vitest and Testing Library.
- Depends on the backend unit's REST contract (see `backend-code-generation-plan.md`). Before writing each API call, the backend routers are read and each literal path is checked against them.
- Local wiring: `VITE_API_BASE_URL` defaults to `http://localhost:8000`. The Vite dev server runs on 5173, which the backend allows through CORS.
- Styling: Tailwind with small custom components, one indigo accent, a slate neutral scale and semantic colours. Enterprise UI Baseline applies. No Figma design exists (Figma Designs was skipped), so screens are built from the functional design.
- Automation: interactive elements carry `data-testid` attributes named `{component}-{role}`.

## Steps
- [ ] **Step 1 — Foundation**: build and Tailwind config, entry point, types, API client, formatting and validation helpers, auth context and route guards, query hooks, the shared UI kit, app shell and routing. Unit tests for validation, formatting and guards.
- [ ] **Step 2 — Customer screens**: login, register, plans, my subscription, invoices, invoice detail with PDF download, payment history, payment method, plus the card form, subscribe, plan-change and cancel dialogs.
- [ ] **Step 3 — Admin screens and documentation**: analytics dashboard, plan management, customers, billing; Dockerfile; the unit summary.

## Stories implemented
All 22 stories have screens, except US-10, which shows status only. See the map below.

## File to User Story Map

| File path | User stories |
|-----------|--------------|
| code/frontend/package.json | US-1: Register an account (FR 3) |
| code/frontend/vite.config.ts | US-1: Register an account (FR 3) |
| code/frontend/tsconfig.json | US-1: Register an account (FR 3) |
| code/frontend/index.html | US-1: Register an account (FR 3) |
| code/frontend/tailwind.config.js | US-4: Browse plans (FR 4.1) |
| code/frontend/postcss.config.js | US-4: Browse plans (FR 4.1) |
| code/frontend/.env.example | US-2: Log in and out (FR 3) |
| code/frontend/Dockerfile | US-1: Register an account (FR 3) |
| code/frontend/src/vite-env.d.ts | US-2: Log in and out (FR 3) |
| code/frontend/src/main.tsx | US-2: Log in and out (FR 3) |
| code/frontend/src/index.css | US-4: Browse plans (FR 4.1) |
| code/frontend/src/App.tsx | US-2: Log in and out (FR 3); US-3: Restrict admin areas (FR 3) |
| code/frontend/src/types.ts | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8); US-16: View invoices (FR 4.6) |
| code/frontend/src/lib/api.ts | US-2: Log in and out (FR 3); US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8) |
| code/frontend/src/lib/format.ts | US-16: View invoices (FR 4.6); US-17: View payment history (FR 4.7) |
| code/frontend/src/lib/validation.ts | US-1: Register an account (FR 3); US-13: Update payment method (FR 4.8) |
| code/frontend/src/auth/AuthContext.tsx | US-2: Log in and out (FR 3) |
| code/frontend/src/auth/guards.tsx | US-2: Log in and out (FR 3); US-3: Restrict admin areas (FR 3) |
| code/frontend/src/hooks/queries.ts | US-4: Browse plans (FR 4.1); US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8); US-16: View invoices (FR 4.6); US-17: View payment history (FR 4.7) |
| code/frontend/src/components/ui.tsx | US-4: Browse plans (FR 4.1); US-21: View analytics dashboard (FR 4.9) |
| code/frontend/src/components/AppShell.tsx | US-3: Restrict admin areas (FR 3) |
| code/frontend/src/components/CardForm.tsx | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8); US-13: Update payment method (FR 4.8) |
| code/frontend/src/components/SubscribeDialog.tsx | US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8); US-6: Handle a failed first payment (FR 4.2, 4.8) |
| code/frontend/src/components/ConfirmPlanChangeDialog.tsx | US-7: Upgrade a plan with proration (FR 4.3); US-8: Downgrade a plan (FR 4.3); US-9: Preview a plan change (FR 4.3) |
| code/frontend/src/components/CancelDialog.tsx | US-14: Cancel at period end (FR 4.5); US-15: Cancel immediately (FR 4.5) |
| code/frontend/src/pages/LoginPage.tsx | US-2: Log in and out (FR 3) |
| code/frontend/src/pages/RegisterPage.tsx | US-1: Register an account (FR 3) |
| code/frontend/src/pages/PlansPage.tsx | US-4: Browse plans (FR 4.1); US-5: Subscribe to a plan (FR 4.2, 4.6, 4.7, 4.8); US-7: Upgrade a plan with proration (FR 4.3); US-8: Downgrade a plan (FR 4.3) |
| code/frontend/src/pages/MySubscriptionPage.tsx | US-10: Automatic renewal (FR 4.4); US-11: Manual renew now (FR 4.4); US-12: Recover from failed renewal (FR 4.4, 4.7); US-14: Cancel at period end (FR 4.5); US-15: Cancel immediately (FR 4.5) |
| code/frontend/src/pages/InvoiceListPage.tsx | US-16: View invoices (FR 4.6) |
| code/frontend/src/pages/InvoiceDetailPage.tsx | US-16: View invoices (FR 4.6) |
| code/frontend/src/pages/PaymentHistoryPage.tsx | US-17: View payment history (FR 4.7) |
| code/frontend/src/pages/PaymentMethodPage.tsx | US-13: Update payment method (FR 4.8) |
| code/frontend/src/pages/NotFoundPage.tsx | US-3: Restrict admin areas (FR 3) |
| code/frontend/src/pages/admin/AnalyticsDashboardPage.tsx | US-21: View analytics dashboard (FR 4.9) |
| code/frontend/src/pages/admin/AdminPlansPage.tsx | US-18: Manage plans (FR 4.1) |
| code/frontend/src/pages/admin/AdminCustomersPage.tsx | US-19: Search customers and subscriptions (FR 4.9); US-22: Trigger a renewal as admin (FR 4.4) |
| code/frontend/src/pages/admin/AdminBillingPage.tsx | US-20: View all invoices and payments (FR 4.6, 4.7) |
| code/frontend/src/test/setup.ts | US-2: Log in and out (FR 3) |
| code/frontend/src/lib/validation.test.ts | US-1: Register an account (FR 3); US-13: Update payment method (FR 4.8) |
| code/frontend/src/lib/format.test.ts | US-16: View invoices (FR 4.6) |
| code/frontend/src/auth/guards.test.tsx | US-3: Restrict admin areas (FR 3) |

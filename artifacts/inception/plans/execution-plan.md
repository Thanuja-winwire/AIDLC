# Execution Plan

## What We'll Build
A subscription management platform where customers browse plans, subscribe, upgrade, renew, cancel, and view invoices and payment history, and admins manage plans and view analytics. Payments run through a simulated gateway.

## Key Features
- Plan catalogue with admin management
- Subscribe, prorated upgrade/downgrade, auto and manual renewal, cancellation
- Invoice generation and payment history
- Simulated payment gateway with test-card failure cases
- JWT authentication with customer and admin roles
- Admin analytics (MRR, churn, revenue, subscribers per plan)

## Development Approach
We'll develop this in 2 units:
1. **Backend API** — FastAPI, PostgreSQL, auth, billing logic, scheduler, gateway, analytics
2. **Frontend App** — React SPA for customer and admin screens

## Success Criteria
- Working backend and frontend runnable via Docker Compose
- Billing flows (proration, renewal, cancellation) covered by tests
- Professionally styled UI with designed empty/loading/error states

## Workflow Selection

> Checked = include (EXECUTE). Unchecked = skip. The user can edit these selections in the UI before approving.

### Inception (completed)
- [x] Workspace Detection — completed — greenfield project
- [x] Workflow Type Selection — completed — Simple
- [x] Requirements Analysis — completed — specs approved

### Inception
- [x] User Stories — `inception:user_stories` — optional — customer and admin personas with acceptance criteria
- [x] Units Generation — `inception:units_generation` — optional — separate backend and frontend units

### Design
- [x] Application Architecture — `design:app_architecture` — required — define components, services and API layout
- [x] Functional Design — `design:functional_design` — required — proration, renewal and invoice business rules
- [ ] NFR Requirements — `design:nfr_requirements` — optional — NFRs already covered in specs
- [ ] NFR Design — `design:nfr_design` — optional — standard patterns suffice
- [ ] Infrastructure Design — `design:infrastructure_design` — optional — local Docker Compose only
- [ ] Figma Designs — `design:figma_designs` — optional — skipped by user (Figma call limit reached; UI built from functional design)

### Build
- [x] Code Generation — `build:code_generation` — required — generate backend and frontend
- [x] Build and Test — `build:build_and_test` — required — build, run and test instructions

### Verify
- [x] Quality Assurance — `verify:quality_assurance` — required — run tests and coverage

### Release
- [ ] Operations — `release:operations` — optional — local Docker Compose deployment, no cloud target

# Test Plan — E-commerce Application

## 1. Introduction
### 1.1 Purpose
Define how the E-commerce application will be verified against FR-1..FR-9 and the stated non-functional requirements.
### 1.2 Project Overview
Full-stack web store: React (Vite, Tailwind) frontend, FastAPI backend, PostgreSQL database. Features: authentication, product listing, search/filter, cart, checkout, mock payment, order tracking, admin dashboard. Local development only.
### 1.3 Audience
Test lead, automation and manual testers, developers, product owner.

## 2. Testing Scope
### 2.1 In Scope
- Backend API and service logic (pytest + httpx): auth, RBAC, products, cart, checkout, payment, orders, admin.
- Frontend component and flow behavior (Vitest/RTL), form validation, loading/empty/error states.
- Data integrity: transactional order placement, stock never negative.
- Responsive layout and basic accessibility.
### 2.2 Out of Scope
Real payment processors, email/SMS, production deployment/CI-CD, multi-currency, reviews, coupons, image upload storage.

## 3. Testing Synopsis
### 3.1 Features to be Tested
| Feature | Requirement | Stories |
|---|---|---|
| Authentication & profile | FR-1 | US-1, US-2 |
| Product listing/detail | FR-2 | US-3, US-4 |
| Search, filters, sort | FR-3 | US-5, US-6 |
| Cart | FR-4 | US-7 |
| Checkout | FR-5 | US-8 |
| Mock payment | FR-6 | US-9 |
| Order tracking | FR-7 | US-10 |
| Admin dashboard | FR-8 | US-11, US-12, US-13, US-15 |
| Responsive/validated UI | FR-9 | US-14 |
### 3.2 Features Not to be Tested
Third-party library internals, real payment gateway, email notifications, production infrastructure, load/stress testing beyond pagination checks.

## 4. Test Strategy
### 4.1 Test Objectives
- Verify every acceptance criterion in US-1..US-15.
- Confirm security controls: bcrypt, JWT expiry, server-side RBAC, CORS, input validation.
- Confirm order and stock integrity and payment state transitions.
- Surface the requirement gaps in the Requirement Analysis Report early.
### 4.2 Test Assumptions
- Single currency (USD), flat shipping, seeded first admin (seed.py).
- Mock gateway has deterministic test cards.
- Test database is isolated from development data.
- Open gaps (token expiry, transition matrix, etc.) will be clarified or documented as assumptions.
### 4.3 Scope and Levels of Testing
#### 4.3.1 Smoke Testing
After each build: backend starts, DB connects, register/login works, product list loads, frontend builds.
#### 4.3.2 System Testing
End-to-end by feature: register → browse → cart → checkout → pay → track; admin manage products/users/orders; negative and boundary cases.
#### 4.3.3 Regression Testing
Full pytest and Vitest suites re-run on each change, with priority on auth, checkout, payment and status transitions.
#### 4.3.4 UAT
Product owner walks through the customer and admin journeys on a local environment with seeded data.

## 5. Execution Strategy
### 5.1 Analysis & Planning — Entry/Exit Criteria
- Entry: approved requirements, specs and stories (Inception complete).
- Exit: Requirement Analysis Report reviewed; this Test Plan approved.
### 5.2 Test Phase — Entry/Exit Criteria
- Entry: Build phase code available under code/, environment and dependencies installed, smoke test passes.
- Exit: all planned tests executed; no open S1/S2 defects; pass rate meets 6.3.
### 5.3 Test Cycles
- Cycle 1 (Build): unit tests written alongside each unit of work.
- Cycle 2 (Verify): full system and API tests, defect logging and fixes.
- Cycle 3 (Verify): regression and UAT sign-off before Release.

## 6. Test Management and Defect Tracking
### 6.1 Test Reports
Test result files and coverage summary per run, plus a Verify summary with pass/fail counts per feature.
### 6.2 Defect Tracking & Reporting
Each defect is logged with ID, linked requirement/story, steps, expected vs. actual, severity, and status (New → Fixed → Retested → Closed).
### 6.3 Pass/Fail Criteria
Pass: 100% of S1/S2 scenarios pass, at least 95% of all planned tests pass, no open S1/S2 defects. Fail otherwise.
### 6.4 Severity & Priority Definition
| Severity | Definition |
|----------|------------|
| S1 — Critical | Security breach, data loss, payment or stock corruption, or app unusable |
| S2 — High | Core flow (auth, cart, checkout, order) broken with no workaround |
| S3 — Medium | Feature partly broken, workaround exists |
| S4 — Low | Minor functional issue with little impact |
| S5 — Cosmetic | UI text/styling issues |
### 6.5 Suspension Criteria & Resumption
Suspend if the build fails smoke test, the DB is unavailable, or an S1 blocks most flows. Resume once a fixed build passes smoke.

## 7. Test Deliverables
Requirement Analysis Report, Test Plan, test cases (unit or manual), test scripts, execution results, defect log, coverage report, Verify summary.

## 8. Environmental and Infrastructure Need
### 8.1 Software
Python, FastAPI 0.111, SQLAlchemy 2.0, Pydantic 2.8, PyJWT, bcrypt, pytest 8.2, httpx; Node, React 18, Vite 5, Vitest 1.6, React Testing Library, jsdom; PostgreSQL.
### 8.2 Infrastructure
Local machine or CI runner; docker-compose for PostgreSQL; separate test database.
### 8.3 Browser Support
Latest Chrome, Edge, Firefox, Safari; mobile viewport emulation for responsive checks.
### 8.4 Tools
pytest, httpx, Vitest, RTL, browser dev tools, Git.

## 9. Testing Schedule
| Sprint/Unit | Activity | Phase |
|---|---|---|
| Sprint 1 | Test planning, requirement analysis | Inception/Design |
| Sprint 2 | Unit tests per unit of work | Build |
| Sprint 3 | System, API and UI testing, defect fixes | Verify |
| Sprint 4 | Regression, UAT | Verify |

| Release | Activity | Phase |
|---|---|---|
| R1 | Verify sign-off and test summary | Verify |
| R1 | Release readiness review | Release |

## 10. Risk and Contingencies
| Risk | Contingency Plan | Mitigation Plan | Probability | Impact | Status |
|------|-------------------|------------------|--------------|--------|--------|
| Ambiguous requirements (transitions, limits) | Document assumptions and test against them | Clarify with product owner | High | Medium | Open |
| Payment/idempotency defects | Hotfix and retest | Dedicated negative tests | Medium | High | Open |
| Stock race conditions | Add DB-level constraints | Concurrency tests | Medium | High | Open |
| Test DB instability | Recreate from seed | Isolated disposable DB | Low | Medium | Open |
| Limited frontend test coverage | Manual checks | Prioritize critical flows | Medium | Medium | Open |

## 11. Terms and Definitions
| Term | Definition |
|------|------------|
| JWT | JSON Web Token used for authentication |
| RBAC | Role-based access control (customer, admin) |
| UAT | User acceptance testing |
| Smoke test | Minimal check that the build is testable |
| Mock gateway | Simulated payment provider |

## 12. Resource Planning
- Test Lead: plan, reporting, defect triage.
- Automation Engineer: pytest and Vitest suites, regression.
- Manual Tester: exploratory, responsive, accessibility and UAT support.
- Developer support: defect fixes and environment setup.

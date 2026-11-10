# Test Plan — E-commerce Application

## 1. Introduction
### 1.1 Purpose
Define the approach, scope, environment, and schedule for verifying the E-commerce application against the approved requirements (FR-1..FR-9, US-1..US-15).
### 1.2 Project Overview
Full-stack retail web app: React (Vite) frontend, FastAPI backend, PostgreSQL database. Features: authentication with roles, product listing/search/filters, server-side cart, checkout, mock payment, order tracking, and an admin dashboard. Local development only.
### 1.3 Audience
Test lead, automation engineers, manual testers, developers, product owner.

## 2. Testing Scope
### 2.1 In Scope
- Authentication/RBAC, profile, product listing/detail, search/filter/sort, cart, checkout, mock payment, order tracking, admin products/users/orders/metrics.
- Server-side and client-side validation; responsive layouts; loading/empty/error states.
- Backend API tests (pytest) and frontend component tests (Vitest/RTL).
### 2.2 Out of Scope
Real payment processors, email/SMS notifications, production deployment/CI-CD, multi-currency, reviews, coupons, image upload storage, formal load testing.

## 3. Testing Synopsis
### 3.1 Features to be Tested
FR-1 Authentication; FR-2 Product listings; FR-3 Search & filters; FR-4 Cart; FR-5 Checkout; FR-6 Mock payment; FR-7 Order tracking; FR-8 Admin dashboard; FR-9 UI & validation.
### 3.2 Features Not to be Tested
Third-party library internals (bcrypt, JWT libraries), real gateway integrations, hosting/infrastructure, Alembic tooling beyond schema creation.

## 4. Test Strategy
### 4.1 Test Objectives
- Verify each acceptance criterion in US-1..US-15.
- Confirm RBAC and data isolation (customers see only own orders; admin-only routes return 403).
- Confirm transactional integrity: stock never negative, cart cleared only on success.
- Confirm validation and clear error messaging.
### 4.2 Test Assumptions
- Single currency (USD), flat shipping, single warehouse.
- Seed script creates the first admin.
- Mock gateway uses defined test cards (to be confirmed — see Requirement Analysis gaps).
- Open clarifications in the Requirement Analysis Report are resolved or tested per documented assumptions.
### 4.3 Scope and Levels of Testing
#### 4.3.1 Smoke Testing
Backend starts, DB connects, register/login, list products, add to cart, place order, pay, admin login — run on each build.
#### 4.3.2 System Testing
End-to-end functional, API, validation, security (RBAC, JWT expiry), boundary and negative testing per requirement; responsive checks at mobile/tablet/desktop.
#### 4.3.3 Regression Testing
Automated pytest and Vitest suites rerun after each fix; priority on checkout, payment, and RBAC.
#### 4.3.4 UAT
Product-owner walkthrough of customer purchase flow and admin management flow on a seeded local environment.

## 5. Execution Strategy
### 5.1 Analysis & Planning — Entry/Exit Criteria
- Entry: approved requirements, specs, and user stories.
- Exit: Requirement Analysis Report reviewed; Test Plan approved.
### 5.2 Test Phase — Entry/Exit Criteria
- Entry: Build phase code complete for the unit; environment and seed data available; smoke test passes.
- Exit: all planned tests executed; no open S1/S2 defects; pass rate meets criteria in 6.3.
### 5.3 Test Cycles
Build → Verify: Cycle 1 runs smoke and full functional suites on the first Build output; Cycle 2 verifies defect fixes and runs full regression; a final cycle confirms exit criteria before Release.

## 6. Test Management and Defect Tracking
### 6.1 Test Reports
Per-cycle results summary (executed/passed/failed/blocked), coverage per requirement, and defect summary stored in Verify artifacts.
### 6.2 Defect Tracking & Reporting
Defects logged with ID, linked requirement, steps, expected vs actual, severity, priority, and status; triaged after each cycle.
### 6.3 Pass/Fail Criteria
Pass: 100% of High-risk requirement tests pass, ≥95% overall pass, no open S1/S2. Fail otherwise.
### 6.4 Severity & Priority Definition
| Severity | Definition |
|----------|------------|
| S1 — Critical | Data loss/corruption, security bypass, checkout or payment unusable |
| S2 — High | Major feature broken with no workaround |
| S3 — Medium | Feature impaired; workaround exists |
| S4 — Low | Minor functional issue with limited impact |
| S5 — Cosmetic | Visual/text issue with no functional effect |
### 6.5 Suspension Criteria & Resumption
Suspend if the backend or database cannot start, or a blocking S1 defect prevents core flows. Resume once a fix is deployed and smoke tests pass.

## 7. Test Deliverables
Test Plan, Requirement Analysis Report, test cases, automated test code (pytest/Vitest), execution results, defect log, final test summary.

## 8. Environmental and Infrastructure Need
### 8.1 Software
Python (FastAPI, SQLAlchemy, Pydantic, pytest), Node.js (React, Vite, Vitest, RTL), PostgreSQL.
### 8.2 Infrastructure
Local developer machine with docker-compose for PostgreSQL; seeded database; frontend dev server proxying to backend.
### 8.3 Browser Support
Latest Chrome, Edge, Firefox, and Safari; mobile viewport emulation.
### 8.4 Tools
pytest, Vitest, React Testing Library, browser dev tools, Docker Compose, Git.

## 9. Testing Schedule
Per sprint (AI-DLC cycle):
| Phase | Activity |
|-------|----------|
| Inception | Requirement analysis, test planning |
| Design | Test plan approval, test case design |
| Build | Unit tests alongside code; smoke on build |
| Verify | System, regression, UAT cycles |

Per release:
| Phase | Activity |
|-------|----------|
| Verify | Final regression and exit-criteria check |
| Release | Sign-off and test summary hand-off |

## 10. Risk and Contingencies
| Risk | Contingency Plan | Mitigation Plan | Probability | Impact | Status |
|------|-------------------|------------------|--------------|--------|--------|
| Ambiguous requirements (payment cards, thresholds) | Test with documented assumptions | Resolve gaps from Requirement Analysis Report | Medium | High | Open |
| Stock race conditions at checkout | Manual concurrent test | Add transactional/concurrency tests | Medium | High | Open |
| RBAC defects | Block release | Dedicated authorization tests | Low | High | Open |
| Environment/DB setup issues | Use docker-compose reset | Seed and setup scripts | Medium | Medium | Open |

## 11. Terms and Definitions
| Term | Definition |
|------|------------|
| RBAC | Role-based access control (customer, admin) |
| JWT | JSON Web Token used for authentication |
| Mock gateway | Simulated payment provider with test cards |
| UAT | User acceptance testing |

## 12. Resource Planning
- Test lead: plan ownership, triage, reporting.
- Automation engineer: pytest API tests and Vitest component tests.
- Manual tester: exploratory, responsive, and UAT flows.
- Developer support: defect fixes and environment help.

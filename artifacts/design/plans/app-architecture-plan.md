# Application Design Plan

Scope: single unit "Inventory System" (FastAPI backend + React frontend) covering FR-1 to FR-11 (see specs.md, stories.md).

## Plan Steps
- [ ] Generate components.md
- [ ] Generate component-methods.md
- [ ] Generate services.md
- [ ] Generate component-dependency.md
- [ ] Generate app-architecture.md (consolidated)
- [ ] Validate design completeness and consistency

## Questions

## Question 1
How should the backend be layered?

A) Feature modules, each with router, service and repository layers (Recommended)

B) Flat layers: all routers, all services, all repositories in separate folders

C) Routers calling the database directly with no service layer

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Feature modules, each with router, service and repository layers (Recommended)

## Question 2
Where should stock changes (receipt, transfer, adjustment) be centralised?

A) A single Stock Ledger service that all movements go through, writing balance and history in one transaction (Recommended)

B) Each module (PO, transfer, adjustment) updates stock and history itself

C) Other (please describe after [Answer]: tag below)

[Answer]: A) A single Stock Ledger service that all movements go through, writing balance and history in one transaction (Recommended)

## Question 3
How should low-stock be evaluated?

A) Computed on read from stock balances vs reorder level, on total quantity across warehouses (Recommended)

B) Computed on read, per product per warehouse

C) Stored alert records created when stock changes

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Computed on read from stock balances vs reorder level, on total quantity across warehouses (Recommended)

## Question 4
How should the frontend talk to the backend and manage data?

A) Typed API client module with React Query for fetching and caching (Recommended)

B) Plain fetch calls inside components

C) Redux-based global state

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Typed API client module with React Query for fetching and caching (Recommended)

## Question 5
How should report CSV export be produced?

A) Backend endpoints return CSV streams for each report (Recommended)

B) Frontend builds CSV from the JSON data

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Backend endpoints return CSV streams for each report (Recommended)

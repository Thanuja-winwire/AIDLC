# Application Architecture Plan

Scope: single unit "inventory-management-system" (FastAPI backend + React frontend + PostgreSQL), per specs.md and the stories.

## Plan Checklist
- [ ] Generate components.md
- [ ] Generate component-methods.md
- [ ] Generate services.md
- [ ] Generate component-dependency.md
- [ ] Generate app-architecture.md (consolidated)
- [ ] Validate completeness and consistency

## Questions

## Question 1
Which backend layering style should be used?

A) Routers -> Services -> SQLAlchemy models directly (simple, fewer files)

B) Routers -> Services -> Repositories -> Models (extra abstraction layer)

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Routers -> Services -> Repositories -> Models (extra abstraction layer)

## Question 2
How should stock changes be centralized?

A) A single StockLedger service that all modules (receiving, sales, transfers, adjustments) must call, so every change writes a movement and uses row locking

B) Each module updates stock itself and writes its own movements

C) Other (please describe after [Answer]: tag below)

[Answer]: A) A single StockLedger service that all modules (receiving, sales, transfers, adjustments) must call, so every change writes a movement and uses row locking

## Question 3
How should the frontend manage server state and routing?

A) React Router + TanStack Query + Axios, with an auth context

B) React Router + Redux Toolkit (RTK Query)

C) React Router + plain fetch and useState/useEffect

D) Other (please describe after [Answer]: tag below)

[Answer]: A) React Router + TanStack Query + Axios, with an auth context

## Question 4
How should the frontend be styled?

A) Tailwind CSS with a small custom component set

B) MUI component library

C) Ant Design

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Tailwind CSS with a small custom component set

## Question 5
How should document numbers (PO number, sale number) be generated?

A) Sequential human-readable numbers from database sequences (e.g. PO-000123)

B) UUIDs only

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Sequential human-readable numbers from database sequences (e.g. PO-000123)

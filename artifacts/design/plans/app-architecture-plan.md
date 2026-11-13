# Application Architecture Plan

Scope: single unit "inventory-management-system" (FastAPI backend + React frontend + PostgreSQL), per specs.md and the stories.

## Plan Checklist
- [x] Generate components.md
- [x] Generate component-methods.md
- [x] Generate services.md
- [x] Generate component-dependency.md
- [x] Generate app-architecture.md (consolidated)
- [x] Validate completeness and consistency

## Decisions (answered)
1. Layering: B) Routers -> Services -> Repositories -> Models
2. Stock changes: A) single StockLedger service
3. Frontend state: A) React Router + TanStack Query + Axios + auth context
4. Styling: A) Tailwind CSS with custom components
5. Numbering: A) Sequential numbers from DB sequences

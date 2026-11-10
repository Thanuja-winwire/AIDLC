# Application Design Plan — ecommerce-app

**Scope**: single unit (FastAPI backend + React frontend). Source: `specs.md`, `stories.md`, `unit-of-work.md`.

## Checklist
- [x] Generate components.md
- [x] Generate component-methods.md
- [x] Generate services.md
- [x] Generate component-dependency.md
- [x] Generate app-architecture.md (consolidated)
- [x] Validate design completeness and consistency

## Questions

## Question 1
How should the backend be layered?

A) Routers -> services -> repositories -> SQLAlchemy models (Recommended; matches the spec's maintainability NFR)

B) Routers -> services -> SQLAlchemy models directly (no repository layer)

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Routers -> services -> repositories -> SQLAlchemy models (Recommended; matches the spec's maintainability NFR)

## Question 2
How should the frontend manage shared state (auth, cart)?

A) React Context + hooks (Recommended for this scope)

B) Redux Toolkit

C) Other (please describe after [Answer]: tag below)

[Answer]: A) React Context + hooks (Recommended for this scope)

## Question 3
How should the frontend store the JWT?

A) In memory plus localStorage, sent as a Bearer header via an Axios interceptor (Recommended)

B) HttpOnly cookie set by the backend

C) Other (please describe after [Answer]: tag below)

[Answer]: A) In memory plus localStorage, sent as a Bearer header via an Axios interceptor (Recommended)

## Question 4
How should API routes be organized?

A) Versioned prefix `/api/v1/...`, with an `/api/v1/admin/...` sub-tree for admin endpoints (Recommended)

B) Unversioned `/api/...`

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Versioned prefix `/api/v1/...`, with an `/api/v1/admin/...` sub-tree for admin endpoints (Recommended)

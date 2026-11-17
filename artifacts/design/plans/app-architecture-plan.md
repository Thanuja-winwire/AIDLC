# Application Architecture Plan

**Scope**: Student Management app, single unit `student-management` (FastAPI/Flask backend + React frontend, SQLite). Covers FR-1 to FR-6 and US-1 to US-6.

## Plan Steps
- [ ] Generate components.md
- [ ] Generate component-methods.md
- [ ] Generate services.md
- [ ] Generate component-dependency.md
- [ ] Generate app-architecture.md (consolidated)
- [ ] Validate design completeness and consistency

## Questions

## Question 1
Which backend framework should the design target?

A) FastAPI (automatic validation via Pydantic, built-in API docs)

B) Flask

C) Other (please describe after [Answer]: tag below)

[Answer]: A) FastAPI (automatic validation via Pydantic, built-in API docs)

## Question 2
How should the backend be layered?

A) Three layers: routes, service (business rules and statistics), repository (database access)

B) Two layers: routes and repository, with rules in the routes

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Three layers: routes, service (business rules and statistics), repository (database access)

## Question 3
How should the frontend be organized?

A) Pages plus reusable components, with one API client module and React hooks for data fetching

B) A single page with all components in one place

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Pages plus reusable components, with one API client module and React hooks for data fetching

## Question 4
Where should the dashboard search be applied?

A) On the server through the `q` query parameter, with the frontend debouncing input

B) In the browser, filtering the already-loaded list

C) Other (please describe after [Answer]: tag below)

[Answer]: A) On the server through the `q` query parameter, with the frontend debouncing input

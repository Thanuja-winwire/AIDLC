# Unit of Work Plan

Decomposition was settled in the approved execution plan (2 units: Backend API, Frontend App) and the Simple workflow type, so no open questions remain.

## Decisions
- Grouping: by deployable runtime (API vs SPA), one codebase per unit under `code/`.
- Dependency: Frontend depends on Backend over REST/JSON with JWT; Backend is built first.
- Deployment: local Docker Compose (PostgreSQL, backend, frontend).

## Steps
- [x] Define units and responsibilities in `unit-of-work.md`
- [x] Document code organisation strategy (greenfield)
- [x] Generate dependency matrix in `unit-of-work-dependency.md`
- [x] Map all 22 stories to units in `unit-of-work-story-map.md`
- [x] Validate boundaries and that every story is assigned

# Unit Dependencies

| Unit | Depends on | Contract | Build order |
|---|---|---|---|
| backend | PostgreSQL | SQL via SQLAlchemy | 1 |
| frontend | backend | REST/JSON, `Authorization: Bearer <JWT>` | 2 |

- No circular dependencies.
- The frontend must use the backend's actual route paths, verified against the generated backend code.

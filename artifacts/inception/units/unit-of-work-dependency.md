# Unit Dependencies

There is a single unit, so there are no inter-unit dependencies.

| Unit | Depends on | Depended on by |
|---|---|---|
| inventory-management-system | PostgreSQL (external runtime service) | none |

## Internal module dependencies
| Module | Depends on |
|---|---|
| auth-users | none |
| catalog | auth-users |
| locations-stock | auth-users, catalog |
| suppliers | auth-users |
| purchasing | suppliers, catalog, locations-stock |
| stock-operations | locations-stock |
| sales | catalog, locations-stock |
| insights | catalog, locations-stock, sales, purchasing |
| frontend | all backend modules, through the REST API |

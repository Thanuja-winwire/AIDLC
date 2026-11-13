# Component Dependencies

## Backend dependency matrix (row depends on column)
| | core | auth-users | catalog | locations-stock (Ledger) | suppliers | numbering |
|---|---|---|---|---|---|---|
| auth-users | X | | | | | |
| catalog | X | | | | | |
| locations-stock | X | | X | | | |
| suppliers | X | | | | | |
| purchasing | X | | X | X | X | X |
| stock-operations | X | | X | X | | X |
| sales | X | | X | X | | X |
| insights | X | | X | X | | |

All modules depend on core (auth, DB, RBAC). No circular dependencies. Only locations-stock (StockLedger) writes stock tables.

## Communication patterns
- Frontend -> Backend: REST/JSON over HTTPS, `Authorization: Bearer <JWT>`; dev uses a Vite proxy to the backend.
- Within backend: direct in-process service calls sharing one transaction.
- Backend -> PostgreSQL: SQLAlchemy sessions; row locks for stock.

## Data flow
```
+---------+   HTTP/JSON   +---------+   calls   +----------+   +--------------+
| React   | ------------> | Routers | --------> | Services | ->| Repositories |
| (Query) | <------------ | (RBAC)  | <-------- |          |   +------+-------+
+---------+               +---------+           +----+-----+          |
                                                     |                v
                                                     v          +------------+
                                              +-------------+   | PostgreSQL |
                                              | StockLedger | ->|            |
                                              +-------------+   +------------+
```

## Frontend dependencies
Pages -> api hooks (TanStack Query) -> Axios client -> auth context (token). Pages -> ui kit. Routes guarded by auth context role.

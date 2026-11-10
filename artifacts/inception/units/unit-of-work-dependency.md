# Unit Dependencies

| Unit | Depends on | Notes |
|---|---|---|
| ecommerce-app | none (internal) | Single unit |

Internal module dependency: Frontend -> Backend (REST over `/api`, JWT bearer); Backend -> PostgreSQL. External: none (payment is a mock provider).

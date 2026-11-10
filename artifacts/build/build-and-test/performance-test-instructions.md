# Performance Test Instructions

Optional for this scope. With the seeded database running, load `GET /api/v1/products?page=1&page_size=12` and `POST /api/v1/auth/login` with a tool such as `hey` or `locust` at 50 concurrent users for 30 seconds. Target: p95 under 500 ms for catalog reads and no 5xx errors. Concurrent checkouts of the last unit of stock should produce exactly one success and the rest 409, with stock never below 0.

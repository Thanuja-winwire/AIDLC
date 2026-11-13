# Integration Test Instructions

## Purpose
Check the frontend, backend and PostgreSQL together, including the parts unit tests mock or run on SQLite.

## Setup
```bash
cd code && docker compose up -d --build
curl http://localhost:8000/health
```

## Scenarios
1. **Auth**: log in as the default admin and call `/api/auth/me` with the token. Expect 200. Staff users must get 403 on admin-only writes.
2. **Catalog reads and writes**: create and then list a product, a location and a supplier.
3. **Purchase order**: create, approve and receive a PO. Stock increases at the location and a movement is recorded. Over-receipt returns an error with a `detail` and `code`.
4. **Transfer**: stock moves between locations. Moving more than is available is rejected and nothing changes.
5. **Adjustment**: the delta form and the counted-quantity form both update stock.
6. **Sale**: stock decreases and the unit cost is recorded. A sale with insufficient stock is rejected and names every short product.
7. **Insights**: low-stock (total and per-location), dashboard and sales report return data. CSV export works.
8. **Numbering**: PO-, SO- and TR- numbers come from the PostgreSQL sequences and increase.
9. **Frontend wiring**: open http://localhost:8080, sign in, and load the Products and Dashboard pages. Confirm the `/api` calls succeed through nginx, and that each path the frontend calls is registered on the backend.
10. **Concurrency**: two simultaneous sales of the last unit. One must fail and stock must never go negative.

## Cleanup
```bash
cd code && docker compose down -v
```

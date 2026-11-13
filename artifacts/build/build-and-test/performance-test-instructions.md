# Performance Test Instructions

## Targets (from specs)
- List and read endpoints: p95 < 500 ms with realistic data (about 10k products)
- Error rate < 1%
- Concurrent users: a small team (about 25)

## Setup
```bash
cd code && docker compose up -d --build
```
Seed about 10k products and stock rows through the API or a SQL script.

## Run
```bash
k6 run perf/load.js   # or any equivalent load tool
```
Suggested mix: 70% reads (products, stock, dashboard), 20% sales, 10% PO and transfer operations. Ramp up over 30 s and hold for 5 minutes.

## Analyze
- Check p95 latency and error rate against the targets.
- Check slow queries and missing indexes in PostgreSQL logs.
- Confirm that row locking on concurrent stock writes causes no deadlocks.

Note: no load script is included in the codebase. Create one if this check is needed.

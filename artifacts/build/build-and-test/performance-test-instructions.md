# Performance Test Instructions

## Purpose
Basic sanity check on API latency. The specification sets modest targets for a local Docker Compose deployment, so a formal load test is optional.

## Requirements
- **Response time**: under 500 ms for 95% of requests on read endpoints.
- **Concurrent users**: around 50.
- **Error rate**: under 1%.

## Run (optional)
```bash
cd code && docker compose up -d --build
# after migrating and seeding, log in to get a token, then:
k6 run --vus 50 --duration 60s perf.js   # script hits GET /plans, /subscriptions/me, /invoices
```
Where k6 is unavailable: `hey -z 60s -c 50 -H "Authorization: Bearer $TOKEN" http://localhost:8000/plans`

## Analyze
Compare p95 latency and error rate to the targets. If they are missed, check missing indexes on `subscriptions` and `invoices` (user_id, status) and the DB pool size.

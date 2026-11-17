# Performance Test Instructions — task-manager

A single-user local app with SQLite. No formal performance targets were specified, so this is an optional sanity check.

## Optional smoke load
1. Seed 1,000 tasks by looping `POST /api/tasks`.
2. Time `GET /api/tasks` and `GET /api/dashboard/summary`, for example with `curl -w "%{time_total}\n"`.
3. Reference expectation: both respond in well under 500 ms locally.

No load testing tool is required.

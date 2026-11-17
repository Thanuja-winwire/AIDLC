# Integration Test Instructions

Start backend (8000) and frontend (5173) together, as in the build instructions.

1. `GET http://localhost:5173/api/health` returns 200 through the proxy.
2. Create a student via `POST /api/students` (201), then fetch it with `GET /api/students/{id}`.
3. Create a second student with the same email in different case: expect 409 with `{"field":"email",...}`.
4. `PUT` the first student (own email unchanged): expect 200.
5. `GET /api/students?q=` with a name fragment, with `%`, and with blank: expect filtered, literal-wildcard and full results.
6. `GET /api/dashboard`: totals and course counts match the data.
7. `DELETE` then `GET` the same id: 204 then 404.

Frontend-to-backend paths used by the UI (all must exist): `/api/students`, `/api/students/{id}`, `/api/dashboard`.

Manual UI check at http://localhost:5173: add, edit, delete (with confirmation), search, dashboard updates after each change.

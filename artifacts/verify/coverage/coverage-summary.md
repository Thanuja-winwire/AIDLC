# Coverage Summary (Version 1)

Source: backend `coverage.json` read from branch `aidlc/e-commerce-app` after CI run 43169252396 (coverage timestamp 2026-11-12T06:36:34Z, 11 seconds after the pytest results). Line coverage only; branch coverage was off.

## Backend (`code/backend/app`) from the 13 pytest tests

**Total: 86% (728 of 843 statements covered, 115 missing, 4 excluded).**

| Module | Covered / statements | % |
|---|---|---|
| core/config.py | 12 / 12 | 100 |
| core/errors.py | 5 / 5 | 100 |
| models.py | 104 / 104 | 100 |
| core/deps.py | 21 / 22 | 95 |
| services/payment_gateway.py | 20 / 21 | 95 |
| schemas.py | 192 / 204 | 94 |
| core/database.py | 14 / 15 | 93 |
| main.py | 22 / 24 | 92 |
| routers/public.py | 61 / 68 | 90 |
| services/order_service.py | 88 / 109 | 81 |
| services/catalog_auth.py | 46 / 57 | 81 |
| core/security.py | 16 / 20 | 80 |
| routers/admin.py | 38 / 49 | 78 |
| services/admin_service.py | 43 / 58 | 74 |
| services/cart_service.py | 46 / 75 | 61 |

## Gaps in the backend figures
- Cart item update, remove and clear paths in `cart_service.py` are not exercised at all.
- Profile update, product update, admin order listing and detail, admin single-user lookup, categories and the order list endpoint are not exercised.
- `verify_password` failure branch and the invalid/expired token branches in `security.py` are not covered.

## Frontend
Not available. No frontend coverage file (`coverage-summary.json` or `coverage-final.json`) could be read from the branch, so no frontend percentage is reported.

## Caveat
The JUnit and coverage files on the branch do not carry the run ID, so their match to run 43169252396 is inferred from the fresh timestamps, not proven.

# Domain Entities — Backend API

Money is a fixed-point decimal (2 places, USD). All timestamps are UTC.

## Entities

### User
| Field | Notes |
|---|---|
| id | unique identifier |
| email | unique, case-insensitive |
| password_hash | bcrypt hash |
| full_name | |
| role | `customer` or `admin` |
| is_active | boolean |
| created_at | |

### Plan
| Field | Notes |
|---|---|
| id | |
| name | unique among plans |
| description | |
| price | decimal >= 0 |
| interval | `monthly` or `yearly` |
| features | list of strings |
| is_active | false = hidden from new sign-ups only |
| created_at, updated_at | |

### PaymentMethod
| Field | Notes |
|---|---|
| id | |
| user_id | one current method per user |
| brand | derived from card number |
| last4 | last 4 digits only |
| created_at, updated_at | |

The full card number is never stored. It is used only for the gateway call, then discarded.

### Subscription
| Field | Notes |
|---|---|
| id | |
| user_id | |
| plan_id | current plan |
| status | `active`, `past_due`, `cancelled`, `expired` |
| current_period_start, current_period_end | current cycle |
| cancel_at_period_end | boolean |
| cancelled_at | nullable |
| renewal_attempts | integer, failed renewal retries in this cycle |
| price_at_subscription | decimal, price locked at subscribe/change time |
| created_at, updated_at | |

`price_at_subscription` implements the rule that existing subscribers keep their price when a plan is edited.

### Invoice
| Field | Notes |
|---|---|
| id | |
| number | unique, e.g. `INV-000123` |
| user_id, subscription_id | |
| type | `initial`, `proration`, `renewal`, `plan_change` |
| status | `pending`, `paid`, `failed` |
| amount | total, decimal |
| period_start, period_end | |
| issued_at, paid_at | |

### InvoiceLine
| Field | Notes |
|---|---|
| id, invoice_id | |
| description | |
| amount | decimal |

### Payment
| Field | Notes |
|---|---|
| id | |
| invoice_id, user_id | |
| amount | |
| status | `succeeded` or `failed` |
| gateway_reference | transaction reference |
| failure_reason | nullable |
| attempted_at | |

## Relationships
- User 1 — 0..1 PaymentMethod
- User 1 — * Subscription (at most one with status `active` or `past_due` at a time)
- Plan 1 — * Subscription
- Subscription 1 — * Invoice
- Invoice 1 — * InvoiceLine
- Invoice 1 — * Payment (one per attempt; a retried renewal adds a Payment to the same invoice)

## Constraints
- A user can hold at most one subscription in `active` or `past_due`.
- Invoice number is unique and sequential.
- `current_period_end` is later than `current_period_start`.

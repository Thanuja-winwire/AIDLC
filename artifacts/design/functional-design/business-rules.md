# Business Rules — ecommerce-app

## Authentication
| ID | Rule |
|---|---|
| BR-A1 | Email is required, valid format, unique case-insensitively, stored lowercase. |
| BR-A2 | Password is 8-72 chars with at least one letter and one digit; stored as a bcrypt hash. |
| BR-A3 | Name is required, 1-100 chars. |
| BR-A4 | Inactive users cannot log in, and their existing tokens are rejected. |
| BR-A5 | New registrations are always role=customer. The first admin comes from the seed script. |
| BR-A6 | Login failures return one generic message and never reveal whether the email exists. |
| BR-A7 | JWT expires after a configurable time (default 60 minutes). |

## Catalog
| ID | Rule |
|---|---|
| BR-C1 | Only active products appear in public listings, search and detail. |
| BR-C2 | page >= 1; page_size 1-50, default 12. |
| BR-C3 | min_price and max_price >= 0 and min <= max. |
| BR-C4 | Product: name 1-200, description <= 2000, price > 0 with 2 decimals, stock integer >= 0, image_url valid http(s) URL or empty, category required. |

## Cart
| ID | Rule |
|---|---|
| BR-K1 | One cart per user; one line per product. |
| BR-K2 | Quantity is an integer from 1 to 99 and cannot exceed current stock. |
| BR-K3 | Guests cannot use the cart; the UI redirects them to login. |
| BR-K4 | Cart lines show the current price; the price is snapshotted only at order creation. |

## Checkout and pricing
| ID | Rule |
|---|---|
| BR-O1 | Shipping is always 0.00. |
| BR-O2 | Tax is 8% of subtotal, rounded half-up to 2 decimals. |
| BR-O3 | total = subtotal + shipping + tax. |
| BR-O4 | Checkout needs a non-empty cart with no unavailable items. |
| BR-O5 | Stock check and decrement plus order creation happen in one transaction; stock can never go below 0. |
| BR-O6 | Address: full name 1-100, line1 1-200, line2 optional, city 1-100, state 1-100, postal code 3-10 alphanumeric, country 2-100, phone optional 7-15 digits. |
| BR-O7 | The cart is cleared only when the order is created. |

## Payment
| ID | Rule |
|---|---|
| BR-P1 | Card number is 16 digits after removing spaces; expiry is MM/YY and not in the past; CVC is 3-4 digits. |
| BR-P2 | 4242 4242 4242 4242 succeeds; 4000 0000 0000 0002 declines; any other number declines. |
| BR-P3 | The full card number and CVC are never persisted or logged; only the last 4 digits are stored. |
| BR-P4 | Success sets the order to paid; failure sets payment_failed. |
| BR-P5 | Only pending or payment_failed orders may be paid, and only by their owner. |
| BR-P6 | Each attempt creates a Payment record, so history is kept. |

## Order status
| ID | Rule |
|---|---|
| BR-S1 | Statuses: pending, paid, payment_failed, processing, shipped, delivered, cancelled. |
| BR-S2 | Admin transitions are forward-only: paid -> processing -> shipped -> delivered. Skipping or going backward is rejected (409). |
| BR-S3 | Customer cancel is allowed from pending, paid, processing and payment_failed. |
| BR-S4 | Admin cancel is allowed from any status except delivered and cancelled. |
| BR-S5 | Cancelling restores stock for every item once; a paid order's payment becomes refunded. |
| BR-S6 | delivered and cancelled are terminal. |
| BR-S7 | Each change writes a status event with timestamp and actor. |

Transition table:
| From | Customer | Admin |
|---|---|---|
| pending | cancel | cancel |
| payment_failed | pay, cancel | cancel |
| paid | cancel | processing, cancel |
| processing | cancel | shipped, cancel |
| shipped | none | delivered, cancel |
| delivered | none | none |
| cancelled | none | none |

## Admin
| ID | Rule |
|---|---|
| BR-M1 | All /api/v1/admin routes need role=admin (403 otherwise). |
| BR-M2 | Product delete is a soft delete (is_active=false); the product is kept for order history. Admin can re-activate it. |
| BR-M3 | Admin product writes follow BR-C4. |
| BR-M4 | Low stock means stock <= 5. |
| BR-M5 | Revenue counts orders in paid, processing, shipped and delivered. |
| BR-M6 | Per the plan decision, there are no self-protection restrictions: an admin may deactivate or demote any user, including themselves or the last admin. Risk noted: this can lock out all admins, and the seed script is the recovery path. |

## Validation and errors
| ID | Rule |
|---|---|
| BR-V1 | Server-side Pydantic validation is authoritative; the client mirrors the same rules. |
| BR-V2 | Validation errors return 422 with field-level messages the UI maps to inputs. |
| BR-V3 | Errors: 401 unauthenticated, 403 forbidden, 404 not found or not owned, 409 stock or state conflict. |
| BR-V4 | Resources owned by another user return 404, not 403. |

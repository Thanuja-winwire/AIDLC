# WinWire Unit Test Cases — E-commerce Store (FastAPI backend)

**Source:** code/backend/app (schemas.py, services/cart_service.py, services/order_service.py, services/payment_gateway.py, core/security.py). No requirement document was used; the cases are derived from code.

## Test Cases
| ID | Linked Requirement | Title | Scenario | Preconditions | Test Data | Steps | Expected Result | Status |
|----|---------------------|-------|----------|----------------|-----------|-------|------------------|--------|
| UTC-01 | — | Password hash round trip | Hash then verify the same password | None | password "Passw0rdX" | 1. hash_password 2. verify_password with same password | Returns True | Not Run |
| UTC-02 | — | Wrong password rejected | Verify with a different password | None | "Passw0rdX" vs "Wrong123" | 1. hash 2. verify wrong | Returns False | Not Run |
| UTC-03 | — | Malformed hash handled | verify_password with an invalid hash | None | hash "notahash" | 1. Call verify_password | Returns False, no exception | Not Run |
| UTC-04 | — | Token encode/decode | Create a JWT and decode it | None | user_id 1, role customer | 1. create_access_token 2. decode_token | Payload sub "1", role "customer" | Not Run |
| UTC-05 | — | Invalid token | Decode a tampered token | None | "abc.def.ghi" | 1. decode_token | Returns None | Not Run |
| UTC-06 | — | Expired token | Decode a token that has expired | jwt_expire_minutes set to negative/patched | token | 1. Create expired token 2. decode_token | Returns None | Not Run |
| UTC-07 | — | Register valid | RegisterIn accepts valid data | None | user@example.com, "Passw0rd1", "Test User" | 1. Instantiate RegisterIn | Model is created | Not Run |
| UTC-08 | — | Password too short | Reject a password under 8 characters | None | "Ab1" | 1. Instantiate RegisterIn | ValidationError | Not Run |
| UTC-09 | — | Password too long | Reject a password over 72 characters | None | "a1"*37 | 1. Instantiate RegisterIn | ValidationError | Not Run |
| UTC-10 | — | Password lacks digit/letter | Reject all-letter and all-digit passwords | None | "abcdefgh", "12345678" | 1. Instantiate RegisterIn for each | ValidationError for both | Not Run |
| UTC-11 | — | Invalid email | Reject a malformed email | None | "not-an-email" | 1. Instantiate RegisterIn | ValidationError | Not Run |
| UTC-12 | — | Empty name | Reject an empty name | None | name "" | 1. Instantiate RegisterIn | ValidationError | Not Run |
| UTC-13 | — | Profile update password rule | ProfileUpdateIn validates new_password | None | new_password "short" | 1. Instantiate ProfileUpdateIn | ValidationError; None is allowed | Not Run |
| UTC-14 | — | ProductIn valid | Accept a valid product | None | price 19.99, stock 5, image https://x.test/a.png | 1. Instantiate ProductIn | Created | Not Run |
| UTC-15 | — | Product price must be positive | Reject zero or negative price | None | price 0, -1 | 1. Instantiate ProductIn | ValidationError | Not Run |
| UTC-16 | — | Product price decimals | Reject more than 2 decimal places | None | price 1.999 | 1. Instantiate ProductIn | ValidationError | Not Run |
| UTC-17 | — | Product negative stock | Reject negative stock | None | stock -1 | 1. Instantiate ProductIn | ValidationError | Not Run |
| UTC-18 | — | Image URL scheme | Reject a non-http URL; accept empty | None | "ftp://x", "" | 1. Instantiate ProductIn for each | ftp rejected; empty accepted | Not Run |
| UTC-19 | — | Cart quantity bounds | CartItemIn accepts 1..99 only | None | qty 0, 1, 99, 100 | 1. Instantiate for each | 0 and 100 rejected; 1 and 99 accepted | Not Run |
| UTC-20 | — | Address valid | Accept a valid address | None | Jane Doe, 1 Main St, Springfield, IL, 62701, US, phone 5551234567 (fictional) | 1. Instantiate AddressIn | Created | Not Run |
| UTC-21 | — | Address postal code invalid | Reject special characters or a too-short code | None | "12", "62@01" | 1. Instantiate AddressIn | ValidationError | Not Run |
| UTC-22 | — | Phone validation | Phone must be 7-15 digits; empty becomes None | None | "123", "abc1234567", "", "5551234567" | 1. Instantiate for each | Invalid values rejected; "" becomes None; valid accepted | Not Run |
| UTC-23 | — | Card number validation | Accept 16 digits, strip spaces; reject others | None | "4242 4242 4242 4242", "4242" | 1. Instantiate CardIn | Spaces stripped on valid input; short number rejected | Not Run |
| UTC-24 | — | Card expiry format | Reject an invalid expiry format | None | "13/30", "1/30", "2030-01" | 1. Instantiate CardIn | ValidationError | Not Run |
| UTC-25 | — | Card expired | Reject a past expiry; accept a future one | None | "01/20", "12/99" | 1. Instantiate CardIn | Past rejected "Card has expired"; future accepted | Not Run |
| UTC-26 | — | CVC validation | CVC must be 3-4 digits | None | "12", "123", "1234", "12a" | 1. Instantiate CardIn | 3 and 4 digits accepted; others rejected | Not Run |
| UTC-27 | — | StatusUpdateIn literal | Only allowed statuses accepted | None | "shipped", "paid" | 1. Instantiate StatusUpdateIn | "paid" rejected | Not Run |
| UTC-28 | — | Tax calculation | calc_tax uses 8% with half-up rounding | None | 10.00, 0.06, 0.00 | 1. Call calc_tax | 0.80, 0.00 (0.0048 rounds down), 0.00 | Not Run |
| UTC-29 | — | Tax rounding half-up | Exact half cent rounds up | None | subtotal 0.0625 → 0.005 | 1. Call calc_tax | 0.01 | Not Run |
| UTC-30 | — | Cart view totals | Compute subtotal, tax, total, count | In-memory DB cart with 2 products | price 10.00 x2, 5.50 x1 | 1. build_cart_view | subtotal 25.50, tax 2.04, total 27.54, count 3, shipping 0 | Not Run |
| UTC-31 | — | Cart view excludes inactive | Inactive product is flagged and excluded from totals | Cart has an inactive product | inactive item 10.00 x1 | 1. build_cart_view | unavailable True; subtotal and count exclude it | Not Run |
| UTC-32 | — | Get or create cart | Creates a cart once and reuses it | User without a cart | user id 1 | 1. get_or_create_cart twice | Same cart id returned | Not Run |
| UTC-33 | — | Add item new | Add an active product | Product stock 10 | qty 2 | 1. add_item | Cart has the item with qty 2 | Not Run |
| UTC-34 | — | Add item merges | Adding an existing product increments qty | Cart has qty 2 | add 3 | 1. add_item | Quantity is 5 | Not Run |
| UTC-35 | — | Add item missing/inactive | Reject unknown or inactive product | Product id 999; inactive product | — | 1. add_item | DomainError 404 "Product not found" | Not Run |
| UTC-36 | — | Add item over stock | Reject when the total exceeds stock | Stock 3 | qty 4 | 1. add_item | DomainError 409 "Only 3 in stock" | Not Run |
| UTC-37 | — | Add item over 99 | Reject when the total exceeds 99 | Stock 200, cart qty 98 | add 2 | 1. add_item | DomainError 422 | Not Run |
| UTC-38 | — | Update item qty | Update quantity within stock | Cart item exists | qty 4 | 1. update_item | Quantity 4 | Not Run |
| UTC-39 | — | Update item over stock | Reject an update above stock | Stock 3 | qty 5 | 1. update_item | DomainError 409 | Not Run |
| UTC-40 | — | Update/remove foreign item | Unknown or other-user item id | Item id 9999 | — | 1. update_item / remove_item | DomainError 404 "Cart item not found" | Not Run |
| UTC-41 | — | Remove item | Remove an item from the cart | Cart has 2 items | one item id | 1. remove_item | Only the other item remains | Not Run |
| UTC-42 | — | Clear cart | Remove all items | Cart has items | — | 1. clear | Items empty, subtotal 0 | Not Run |
| UTC-43 | — | Mock gateway success | Test card succeeds | None | 4242424242424242, 10.00 | 1. charge | success True, reference starts "mock_" | Not Run |
| UTC-44 | — | Mock gateway decline | Decline card | None | 4000000000000002 | 1. charge | success False, reason "Card declined" | Not Run |
| UTC-45 | — | Mock gateway invalid | Any other card is invalid | None | 4111111111111111 | 1. charge | success False, reason "Invalid test card" | Not Run |
| UTC-46 | — | Place order success | Create order from cart, decrement stock, clear cart | Cart with items, sufficient stock | address from UTC-20 | 1. place_order | Status pending, totals correct, stock reduced, order items and pending event created, cart empty | Not Run |
| UTC-47 | — | Place order empty cart | Reject an empty cart | Empty cart | — | 1. place_order | DomainError 409 "Cart is empty" | Not Run |
| UTC-48 | — | Place order unavailable item | Reject when the cart has an inactive product | Cart has an inactive product | — | 1. place_order | DomainError 409 | Not Run |
| UTC-49 | — | Place order insufficient stock | Reject when stock dropped below the cart qty | Stock lowered after add | — | 1. place_order | DomainError 409 "Insufficient stock for: ..."; stock unchanged | Not Run |
| UTC-50 | — | Pay success | Pay a pending order with the success card | Pending order | 4242424242424242 | 1. pay | Order paid, Payment success, card_last4 "4242", returns True | Not Run |
| UTC-51 | — | Pay declined | Declined payment sets payment_failed | Pending order | 4000000000000002 | 1. pay | Status payment_failed, Payment failed with reason, returns False | Not Run |
| UTC-52 | — | Retry payment after failure | A payment_failed order can be paid again | Order in payment_failed | success card | 1. pay | Status paid | Not Run |
| UTC-53 | — | Pay invalid status | Cannot pay a paid or cancelled order | Order paid | any card | 1. pay | DomainError 409 | Not Run |
| UTC-54 | — | Order ownership | Another user's order is not visible | Order of user A | user B | 1. get_own_order / pay / cancel | DomainError 404 | Not Run |
| UTC-55 | — | List orders pagination | Own orders only, newest first, paged | 3 orders for A, 1 for B | page 1 size 2 | 1. list_orders | total 3, 2 items, newest first | Not Run |
| UTC-56 | — | Customer cancel restores stock | Cancel a paid order | Paid order | — | 1. cancel_order | Status cancelled, stock restored, success payment becomes refunded | Not Run |
| UTC-57 | — | Customer cancel not allowed | Cancel a shipped, delivered or cancelled order | Order shipped | — | 1. cancel_order | DomainError 409 | Not Run |
| UTC-58 | — | Admin forward transitions | paid→processing→shipped→delivered | Paid order | — | 1. admin_update_status in sequence | Each succeeds and an event is recorded | Not Run |
| UTC-59 | — | Admin invalid transition | Skip a step or go backward | Paid order | "shipped"; "paid" order to "delivered" | 1. admin_update_status | DomainError 409 | Not Run |
| UTC-60 | — | Admin cancel | Cancel in an allowed state; reject for delivered or cancelled | Orders in various states | — | 1. admin_update_status "cancelled" | Allowed states cancel and restock; delivered/cancelled raise 409 | Not Run |
| UTC-61 | — | Admin list filter | Filter orders by status | Orders in mixed statuses | status "paid" | 1. admin_list_orders | Only paid orders; total correct | Not Run |
| UTC-62 | — | Admin get missing order | Unknown order id | — | 9999 | 1. admin_get_order | DomainError 404 | Not Run |

## Test Data Notes
Test data was derived from the validation rules and constants in the code. The test card numbers are the mock gateway's documented values. Names, emails, addresses and phone numbers are fictional, and no real personal data is used. Service tests (UTC-30 onward) need an in-memory or test database (see backend/tests/conftest.py). Some order tests (UTC-46, UTC-49) use `with_for_update`, which SQLite ignores.

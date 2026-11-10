# Business Logic Model — ecommerce-app

Technology-agnostic flows for FR-1 to FR-9. Decisions come from the approved functional design plan: no shipping charge, 8% tax, mock card rules, customer/admin cancellation, forward-only status, soft delete, no admin safety restrictions, Tailwind + lucide-react.

## Money calculation
- subtotal = sum(unit_price_snapshot x quantity)
- shipping = 0.00
- tax = round(subtotal x 0.08, 2), half-up
- total = subtotal + shipping + tax
- All money uses Decimal with 2 places (USD).

## 1. Authentication (FR-1)
**Register**: validate -> reject if email exists (case-insensitive) -> hash password -> create user (role=customer, is_active=true) -> create empty cart -> return token + user.
**Login**: find by email -> reject if missing, wrong password, or inactive (same generic "Invalid credentials" for the first two) -> issue JWT (sub, role, exp) -> return token + user.
**Logout**: client discards token and clears cart state (stateless server).
**Profile**: get current user; update name and optionally password (needs current password).
**Authorization**: every request decodes JWT, loads the user, and rejects if inactive. Admin routes require role=admin.

## 2. Catalog (FR-2, FR-3)
**List/Search**: query only active products (is_active=true). Apply, in order:
1. keyword: case-insensitive match on name OR description
2. category_id
3. min_price / max_price (reject min > max)
4. in_stock=true -> stock > 0
5. sort: newest (default), price_asc, price_desc
6. paginate: page (>=1), page_size (default 12, max 50)
Return items, total, page, page_size.
**Detail**: active product by id, else 404.
**Categories**: list all.

## 3. Cart (FR-4)
- **Get**: the user's cart with items, line totals, subtotal, tax, total. Items whose product became inactive are flagged `unavailable` and excluded from totals.
- **Add(product, qty)**: product must be active; new qty (existing + qty) must be <= stock, else 409 with available stock. Upsert the line.
- **Update(item, qty)**: qty >= 1 and <= stock; qty = 0 is rejected (use Remove).
- **Remove / Clear**: delete line(s) owned by the user only.
- Ownership: an item belonging to another user returns 404.

## 4. Checkout and order placement (FR-5)
Input: shipping address + card details.
1. Load the cart; reject if empty or has unavailable items.
2. Validate the address (see rules).
3. Begin transaction:
   a. Lock product rows (ordered by id, to avoid deadlocks).
   b. Verify stock >= qty for every line, else roll back with 409 naming the products.
   c. Decrement stock.
   d. Create Order (status=pending) with the address, subtotal, shipping, tax, total.
   e. Create OrderItems with name and price snapshots.
   f. Clear the cart.
4. Commit, then call payment (below) for the order.
The order is created before payment so a decline leaves a retryable `payment_failed` order.

## 5. Payment (FR-6)
`PaymentGateway.charge(amount, card_number, order_ref)` -> {success, reference, reason}.
**Mock rules**: digits only after stripping spaces. `4242424242424242` -> success. `4000000000000002` -> decline "Card declined". Anything else -> decline "Invalid test card".
**Pay flow** (used by checkout and retry):
- Order must belong to the user and be `pending` or `payment_failed`.
- Call the gateway. Create a Payment record (status success/failed, amount, reference).
- Success -> order.status = paid. Failure -> order.status = payment_failed.
- Retry on a `payment_failed` order repeats the flow with no new stock change.
- The card number is never stored. Only the last 4 digits are kept on the Payment.

## 6. Order tracking and cancellation (FR-7)
- **List**: the user's orders, newest first, paginated.
- **Detail**: own order with items, payment summary and a status timeline built from status history.
- Every status change appends an OrderStatusEvent (status, timestamp, actor).
- **Customer cancel**: allowed when status in {pending, paid, processing}. Restore stock for all items, set cancelled. If the order was paid, the payment is marked `refunded` (simulated).
- **Payment_failed cancel**: customer may also cancel; stock is restored.

## 7. Admin (FR-8)
**Dashboard metrics**: total orders, revenue (sum of totals of orders in paid/processing/shipped/delivered), user count, low-stock count (active products with stock <= 5), recent orders.
**Products**: create, edit, set stock, soft delete (is_active=false). Soft-deleted products leave the catalog and carts show them unavailable. Order history is unaffected. Admin list includes inactive products with a toggle.
**Users**: list with search, view, activate/deactivate, change role. No self-protection rules apply (per plan decision).
**Orders**: list filterable by status, view detail, update status by forward-only transitions, or cancel (non-delivered; stock restored).

## 8. Frontend components (FR-9)
Styling: Tailwind CSS with lucide-react icons; a theme with an indigo primary, a slate neutral scale, and green/amber/red/blue semantic colors. A type scale, a 4px spacing system, cards with subtle shadow, and filled vs outlined button hierarchy.

**UI kit**: Button (primary/secondary/danger, loading), Input/Select with field error, Card, Badge (status colors), Modal/ConfirmDialog, Spinner, Skeleton, EmptyState, ErrorState, Pagination, Toast, QuantityStepper.
**Layout**: Navbar (search, cart badge, account menu, responsive drawer), Footer, AdminLayout (sidebar collapses on mobile).
**Providers**: AuthContext (user, token, login, register, logout), CartContext (cart, add, update, remove, count). Axios interceptor adds the Bearer token and logs out on 401.
**Pages**:
| Route | Page | Access |
|---|---|---|
| / and /products | ProductList with search, filters, sort, pagination | public |
| /products/:id | ProductDetail with add to cart | public |
| /login, /register | Auth forms | guest |
| /cart | Cart | customer |
| /checkout | Address and card form, summary | customer |
| /orders, /orders/:id | History, detail with timeline, cancel, retry payment | customer |
| /profile | Profile | customer |
| /admin | Dashboard | admin |
| /admin/products | Table, create/edit modal, delete | admin |
| /admin/users | Table, activate, role | admin |
| /admin/orders, /admin/orders/:id | Filter, status update | admin |
Route guards: ProtectedRoute (login required, redirect with return path) and AdminRoute (role=admin, else 403 page).
**States**: every data page has a skeleton while loading, an EmptyState with a call to action, and an ErrorState with retry. Forms show inline field errors and disable submit while pending.

## Story coverage
Auth: 1-3 | Catalog and search: 4-6 | Cart: 7-8 | Checkout and payment: 9-10 | Orders: 11-12 | Admin: 13-15 (as mapped in the story map).

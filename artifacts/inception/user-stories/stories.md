# User Stories

Feature-based, mapped to FR-1..FR-9. Acceptance criteria as checklists.

## US-1: Register and log in (FR-1)
As a **customer**, I want to register and log in so that I can shop and track orders.
- [ ] Register with name, email, password; email unique; password min 8 chars
- [ ] Login returns a JWT with expiry; invalid credentials show a clear error
- [ ] Logout clears the token; protected routes redirect to login
- [ ] Field-level validation errors shown client- and server-side

## US-2: Manage profile (FR-1)
As a **customer**, I want to view and update my profile so that my details stay current.
- [ ] Profile shows name, email, default address
- [ ] Update validated; success and error feedback shown

## US-3: Browse products (FR-2)
As a **customer or guest**, I want a paginated product list so that I can discover items.
- [ ] Public access; pagination controls; responsive grid
- [ ] Loading skeleton and empty state designed
- [ ] Cards show image, name, price, stock status

## US-4: View product detail (FR-2)
As a **customer or guest**, I want a product detail page so that I can decide to buy.
- [ ] Shows name, description, price, image, category, stock
- [ ] Out-of-stock disables add to cart; unknown product shows not-found state

## US-5: Search products (FR-3)
As a **customer or guest**, I want keyword search so that I can find items fast.
- [ ] Matches name and description; debounced input
- [ ] No-results state with suggestion to clear filters

## US-6: Filter and sort products (FR-3)
As a **customer or guest**, I want filters and sorting so that I can narrow results.
- [ ] Filter by category, price range, in-stock only
- [ ] Sort by price asc/desc and newest; combinable with search; invalid ranges rejected

## US-7: Manage cart (FR-4)
As a **customer**, I want to add, update, remove and clear cart items so that I control my purchase.
- [ ] Cart persisted server-side per user; requires login
- [ ] Quantity validated against stock with clear message
- [ ] Empty cart state; totals update live

## US-8: Checkout with shipping details (FR-5)
As a **customer**, I want to enter a shipping address and review a summary so that I can place an order.
- [ ] Address fields validated; summary shows subtotal, flat shipping, total
- [ ] Order created transactionally; stock decremented; cart cleared on success
- [ ] Insufficient stock at checkout blocks the order with a clear message

## US-9: Pay for an order (FR-6)
As a **customer**, I want to pay by card so that my order is confirmed.
- [ ] Mock gateway via provider interface; test cards give success or failure
- [ ] Payment record linked to order; success sets status `paid`
- [ ] Failure sets `payment_failed` and allows retry

## US-10: Track orders (FR-7)
As a **customer**, I want order history and detail with a status timeline so that I know where my order is.
- [ ] Paginated history; detail shows items, address, payment, totals
- [ ] Timeline for pending, paid, processing, shipped, delivered, cancelled, payment_failed
- [ ] Customers can only see their own orders; empty state shown

## US-11: Admin dashboard metrics (FR-8)
As an **admin**, I want summary metrics so that I can see business health.
- [ ] Total orders, revenue, users, low-stock count
- [ ] Admin-only access; non-admins get 403 and redirect

## US-12: Manage products (FR-8)
As an **admin**, I want to create, edit, delete products and manage stock so that the catalog stays accurate.
- [ ] Validated form (price > 0, stock >= 0); delete confirmation
- [ ] Stock cannot go negative

## US-13: Manage users (FR-8)
As an **admin**, I want to list users, activate/deactivate, and change roles so that I control access.
- [ ] Paginated list and detail; deactivated users cannot log in
- [ ] Admin cannot deactivate or demote themselves

## US-14: Responsive, validated UI (FR-9)
As a **customer or admin**, I want a responsive UI with clear states so that it works on any device.
- [ ] Mobile, tablet, desktop layouts
- [ ] Designed loading, empty, and error states; accessible forms with field-level errors

## US-15: Manage orders (FR-8)
As an **admin**, I want to list, filter, view and update order status so that I can fulfil orders.
- [ ] Filter by status; detail view; only valid status transitions allowed
- [ ] Status change reflected in the customer timeline

## Coverage
FR-1: US-1, US-2 | FR-2: US-3, US-4 | FR-3: US-5, US-6 | FR-4: US-7 | FR-5: US-8 | FR-6: US-9 | FR-7: US-10 | FR-8: US-11, US-12, US-13, US-15 | FR-9: US-14

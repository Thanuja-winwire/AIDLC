# Integration Test Instructions

Run against the real PostgreSQL database with both services started (see build instructions). Seed first with `python seed.py`.

Primary flow, in order (each call must return the stated status):
1. `POST /api/v1/auth/login` with `admin@example.com` / `Admin1234` returns 200 with a token (login is exercised first).
2. `POST /api/v1/auth/register` with a new customer returns 201.
3. `GET /api/v1/products?q=keyboard&in_stock=true` returns 200 (read: Product and Category).
4. `POST /api/v1/cart/items` with `{product_id, quantity: 1}` returns 200 (write: Cart, CartItem).
5. `POST /api/v1/orders` with an address and card 4242424242424242 returns 201, `payment_success: true`, order status `paid` (write: Order, OrderItem, Payment, status events).
6. `GET /api/v1/orders/{id}` returns 200 with a timeline.
7. `GET /api/v1/admin/metrics` as admin returns 200; as customer returns 403.
8. `PUT /api/v1/admin/orders/{id}/status` `{status: "processing"}` returns 200; `{status: "delivered"}` straight from paid returns 409.
9. `POST /api/v1/admin/products` creates a product (201); `DELETE` returns 204 and the product disappears from `GET /api/v1/products`.
10. `GET /api/v1/admin/users` returns 200 (read: User).

Frontend wiring: open http://localhost:5173, log in, add to cart, check out with the test card, and confirm the order page shows the paid timeline. Paths called by the frontend (`/api/v1/auth/*`, `/products`, `/categories`, `/cart`, `/orders`, `/admin/*`) match the registered backend routes.

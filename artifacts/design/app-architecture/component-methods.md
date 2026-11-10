# Component Methods — ecommerce-app

## Backend services (business rules in brackets)

**AuthService**
- `register(data) -> User` [unique email; bcrypt hash; role=customer]
- `login(email, password) -> Token` [active users only; JWT with expiry]
- `get_profile(user)`, `update_profile(user, data)`

**CatalogService**
- `list_products(q, category_id, min_price, max_price, in_stock, sort, page, size) -> Page[Product]` [q matches name/description; paginated]
- `get_product(id)` [404 if missing]
- `list_categories()`

**CartService**
- `get_cart(user)`, `add_item(user, product_id, qty)`, `update_item(user, item_id, qty)`, `remove_item(user, item_id)`, `clear(user)` [qty >= 1 and <= stock]

**OrderService**
- `place_order(user, shipping_address) -> Order` [cart not empty; single transaction: lock products, verify stock, decrement, create order and items, flat shipping, clear cart; status pending]
- `list_orders(user, page)`, `get_order(user, id)` [owner only]
- `cancel_order(user, id)` [only pending/payment_failed; restores stock]

**PaymentService**
- `pay(user, order_id, card) -> Payment` [order owner; status pending or payment_failed; provider charge; success -> order paid; failure -> payment_failed]
- `PaymentProvider.charge(amount, card) -> ChargeResult` ; `MockPaymentGateway` (test card ending 0002 declines; others succeed)

**AdminService**
- `metrics()` [orders, revenue of paid+ orders, users, low-stock count]
- Products: `create/update/delete/set_stock` [delete blocked or soft when referenced by orders]
- Users: `list_users`, `get_user`, `set_active`, `set_role` [admin cannot deactivate or demote self]
- Orders: `list_orders(status, page)`, `get_order`, `update_status(id, status)` [allowed transitions only: paid->processing->shipped->delivered]

## Repositories
`UserRepository`, `ProductRepository`, `CartRepository`, `OrderRepository`, `PaymentRepository`: `get`, `list/search`, `add`, `update`, `delete` as needed.

## REST API (`/api/v1`)
- Auth: `POST /auth/register`, `POST /auth/login`, `GET/PUT /auth/me`
- Catalog: `GET /products`, `GET /products/{id}`, `GET /categories`
- Cart: `GET /cart`, `POST /cart/items`, `PUT /cart/items/{id}`, `DELETE /cart/items/{id}`, `DELETE /cart`
- Orders: `POST /orders`, `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel`
- Payments: `POST /orders/{id}/pay`
- Admin: `GET /admin/metrics`; `GET/POST /admin/products`, `PUT/DELETE /admin/products/{id}`; `GET /admin/users`, `GET /admin/users/{id}`, `PUT /admin/users/{id}`; `GET /admin/orders`, `GET /admin/orders/{id}`, `PUT /admin/orders/{id}/status`

## Frontend
- API modules: `authApi`, `productsApi`, `cartApi`, `ordersApi`, `paymentsApi`, `adminApi`
- Contexts: `useAuth()` -> `{user, login, register, logout, isAdmin}`; `useCart()` -> `{cart, add, update, remove, clear, count}`

# Domain Entities — ecommerce-app

Money fields are NUMERIC(10,2). IDs are integers. All entities have created_at; mutable ones have updated_at.

## User
id, email (unique, lowercase), password_hash, name, role (customer|admin), is_active (default true), created_at, updated_at.

## Category
id, name (unique), slug (unique).

## Product
id, category_id -> Category, name, description, price, stock (CHECK >= 0), image_url, is_active (default true), created_at, updated_at.
Indexes: name, category_id, price, is_active.

## Cart
id, user_id -> User (unique, one cart per user), updated_at.

## CartItem
id, cart_id -> Cart, product_id -> Product, quantity (1-99). Unique (cart_id, product_id).

## Order
id, user_id -> User, status, subtotal, shipping (always 0.00), tax, total, ship_full_name, ship_line1, ship_line2, ship_city, ship_state, ship_postal_code, ship_country, ship_phone, created_at, updated_at.
Index: (user_id, created_at), status.

## OrderItem
id, order_id -> Order, product_id -> Product, product_name (snapshot), unit_price (snapshot), quantity, line_total.

## OrderStatusEvent
id, order_id -> Order, status, actor_user_id -> User (nullable for system), created_at.
Feeds the customer status timeline.

## Payment
id, order_id -> Order, amount, status (success|failed|refunded), reference, card_last4, failure_reason (nullable), created_at.
An order may have many payments (retries).

## Relationships
```
User 1--1 Cart 1--* CartItem *--1 Product *--1 Category
User 1--* Order 1--* OrderItem *--1 Product
Order 1--* Payment
Order 1--* OrderStatusEvent
```

## Enumerations
- Role: customer, admin
- OrderStatus: pending, paid, payment_failed, processing, shipped, delivered, cancelled
- PaymentStatus: success, failed, refunded

## Notes
- Order status events and the payment table extend the architecture data model for tracking and retries.
- Seed data: one admin user, several categories, and sample products.

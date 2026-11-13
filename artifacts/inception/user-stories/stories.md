# User Stories

### US-01: Sign in securely (FR-1)
Persona: Admin, Staff
As a user, I want to sign in with email and password, so that I can access the system according to my role.
- Valid credentials return a JWT and open the dashboard; invalid credentials show a clear error.
- Protected API endpoints reject missing or expired tokens.
- A default Admin exists on first start.

### US-02: Manage users and roles (FR-1)
Persona: Admin
As an Admin, I want to create, edit and deactivate users and assign roles, so that I control who can do what.
- Admin can create a user with Admin or Staff role.
- Deactivated users cannot sign in.
- Staff cannot access user management (UI hidden, API returns 403).

### US-03: Manage products (FR-2)
Persona: Admin
As an Admin, I want to create, edit and deactivate products with SKU, category, pricing and reorder level, so that the catalog is accurate.
- SKU must be unique; duplicates are rejected.
- Products are deactivated, never hard-deleted.
- Staff see products read-only.

### US-04: Find products (FR-2)
Persona: Admin, Staff
As a user, I want to search, filter by category and page through products, so that I can find items quickly.
- Search matches SKU and name; category filter works; lists are paginated.

### US-05: Manage locations (FR-3)
Persona: Admin
As an Admin, I want to manage warehouses/locations, so that stock can be tracked per location.
- Admin can create, edit and deactivate locations; Staff view only.

### US-06: View stock by location (FR-3)
Persona: Admin, Staff
As a user, I want to see stock levels per product per location and its movement history, so that I know what is where.
- Stock list shows quantity per location.
- Every change appears in an immutable movement history with type, delta, user, time and reference.
- Operations that would make stock negative are rejected.

### US-07: Manage suppliers (FR-4)
Persona: Admin
As an Admin, I want to maintain suppliers' contact details, so that I can order from them.
- Admin can create, edit and deactivate suppliers; Staff view only.

### US-08: Create and approve purchase orders (FR-5)
Persona: Admin
As an Admin, I want to create a PO with line items for a supplier and destination, and approve it, so that purchasing is controlled.
- PO starts as Draft; only Admin can approve or cancel.
- Staff can view POs but not create or approve them.

### US-09: Receive purchase orders (FR-5)
Persona: Admin, Staff
As a user, I want to receive full or partial quantities against an approved PO, so that stock increases when goods arrive.
- Receiving increases stock at the destination and writes movements.
- Status becomes Partially Received or Received accordingly.
- Cannot receive more than ordered or against non-approved POs.

### US-10: Transfer stock between locations (FR-6)
Persona: Admin, Staff
As a user, I want to move stock from one location to another, so that inventory sits where it is needed.
- Source and destination must differ; quantity cannot exceed available stock.
- Transfer is atomic and creates transfer-out and transfer-in movements.
- Transfer history is viewable.

### US-11: Adjust inventory (FR-7)
Persona: Admin, Staff
As a user, I want to increase or decrease stock with a mandatory reason and note, so that counts match reality.
- Reason is required; decreases cannot go below zero.
- Adjustments are recorded as movements and listed in history.

### US-12: Record sales (FR-8)
Persona: Admin, Staff
As a user, I want to record a sale with line items from a location, so that stock decreases and revenue is tracked.
- Insufficient stock rejects the whole sale.
- Successful sale decreases stock atomically; optional customer name is stored.

### US-13: See low-stock alerts (FR-9)
Persona: Admin, Staff
As a user, I want to see products at or below reorder level, so that I can restock in time.
- Alerts list and dashboard widget show affected products; navigation badge shows the count.
- Alerts are computed on demand, with no email.

### US-14: Review sales reports (FR-10)
Persona: Admin, Staff
As a user, I want sales reports by date range with revenue, units and estimated margin, so that I can assess performance.
- Breakdown by product, category and day/month; top sellers; location filter.
- Report can be exported to CSV.

### US-15: View dashboard (FR-11)
Persona: Admin, Staff
As a user, I want a dashboard summary, so that I see the state of the business at a glance.
- Cards: total products, stock value, low-stock count, open POs, recent sales; recent activity list.

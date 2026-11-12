# User Stories

All stories belong to the single persona **Inventory Manager** (see personas.md). Granularity: coarse, one story per functional requirement.

### US-1: Manage products (FR-1)
As an Inventory Manager, I want to create, edit, search and deactivate products so that the catalogue is accurate.
- Given I enter a product with a new SKU, When I save, Then it is created and appears in the list.
- Given a SKU already exists, When I save a product with that SKU, Then I see a clear duplicate error.
- Given many products, When I search or filter by name, SKU or category, Then only matching products are shown.

### US-2: Manage warehouses (FR-2)
As an Inventory Manager, I want to manage warehouses and see the stock each holds so that I know where inventory is.
- Given a unique code, When I save a warehouse, Then it is created.
- Given a warehouse, When I open it, Then I see the products and quantities it holds.

### US-3: View stock levels (FR-3)
As an Inventory Manager, I want to view quantity on hand by product and by warehouse so that I can see current stock.
- Given a product, When I view it, Then I see its quantity per warehouse and total.
- Given any operation, When it would make stock negative, Then it is rejected.

### US-4: Manage suppliers (FR-4)
As an Inventory Manager, I want to manage suppliers and link them to products so that I know who supplies what.
- Given supplier details, When I save, Then the supplier is created.
- Given a product and a supplier, When I link them, Then the link is shown on both.

### US-5: Create and receive purchase orders (FR-5)
As an Inventory Manager, I want to raise purchase orders and receive goods so that stock increases when deliveries arrive.
- Given a supplier, line items and a destination warehouse, When I save, Then a numbered Draft PO is created.
- Given an Ordered PO, When I receive part of the quantity, Then stock increases at the destination and the status becomes Partially Received.
- Given all quantities are received, Then the status becomes Received.
- Given a PO that is Draft or Ordered, When I cancel it, Then it becomes Cancelled; otherwise cancelling is refused.

### US-6: Transfer stock between warehouses (FR-6)
As an Inventory Manager, I want to move stock between warehouses so that inventory sits where it is needed.
- Given sufficient source stock, When I transfer, Then the source decreases and destination increases atomically.
- Given insufficient source stock or identical warehouses, When I transfer, Then it is rejected with an error.

### US-7: Adjust inventory (FR-7)
As an Inventory Manager, I want to adjust stock with a reason so that counts match reality.
- Given a reason and quantity, When I submit an increase or decrease, Then stock updates and the adjustment is recorded.
- Given a decrease larger than stock on hand, Then it is rejected.
- Given no reason, Then the form cannot be submitted.

### US-8: Receive low-stock alerts (FR-8)
As an Inventory Manager, I want to see low-stock items so that I can reorder in time.
- Given quantity at or below the reorder level, Then the product appears on the low-stock list and counts in the dashboard alert.
- Given stock is replenished above the level, Then it leaves the list.

### US-9: Review stock history (FR-9)
As an Inventory Manager, I want an immutable ledger of movements so that every change is traceable.
- Given any receipt, transfer or adjustment, Then ledger entries with quantity change, resulting balance and reference are recorded.
- Given filters for product, warehouse, type or date range, Then only matching entries show.

### US-10: Run reports (FR-10)
As an Inventory Manager, I want reports and CSV export so that I can analyse and share inventory data.
- Given the valuation, low-stock, movement or PO summary report, When I open it, Then correct figures are shown.
- Given a report, When I export, Then a CSV file is downloaded.

### US-11: View dashboard (FR-11)
As an Inventory Manager, I want a dashboard overview so that I see the state of inventory at a glance.
- Given I open the app, Then I see total products, total stock value, low-stock count, open POs and recent movements.
- Given no data yet, Then designed empty states are shown.

## Coverage
FR-1 to FR-11 are each covered by US-1 to US-11 respectively.

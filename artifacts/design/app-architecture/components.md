# Components

Single unit "Inventory System": FastAPI backend (feature modules: router / service / repository) and React frontend.

## Backend

| Component | Responsibility | FRs |
|---|---|---|
| Products | Product CRUD, search/filter, supplier links | FR-1, FR-4 |
| Warehouses | Warehouse CRUD, stock held per warehouse | FR-2 |
| Suppliers | Supplier CRUD, product links | FR-4 |
| Stock | Read-only stock balances by product/warehouse; low-stock queries (computed on read: total qty across warehouses <= reorder level) | FR-3, FR-8 |
| Stock Ledger | Single entry point for every stock movement. Applies balance change and writes the immutable history row in one transaction; rejects negative balances | FR-3, FR-9 |
| Purchase Orders | PO lifecycle (Draft, Ordered, Partially Received, Received, Cancelled), auto-numbering, receiving via Stock Ledger | FR-5 |
| Transfers | Warehouse-to-warehouse transfers via Stock Ledger | FR-6 |
| Adjustments | Manual adjustments with reason via Stock Ledger | FR-7 |
| History | Query/filter the movement ledger | FR-9 |
| Reports | Valuation, low-stock, movement, PO summary; JSON and CSV stream endpoints | FR-10 |
| Dashboard | Summary cards, alert count, recent movements | FR-11, FR-8 |
| Core | Config, DB session, error handling, pagination helpers, CSV helper | NFR |

## Frontend

| Component | Responsibility |
|---|---|
| API Client | Typed module wrapping all REST calls |
| Query Layer | React Query hooks per resource (fetch, cache, invalidation) |
| Layout | App shell, sidebar navigation, shared UI (tables, forms, empty/loading/error states) |
| Pages | Dashboard, Products, Warehouses, Suppliers, Stock, Purchase Orders, Transfers, Adjustments, Low Stock, History, Reports |

## Interfaces
Each backend feature module exposes a REST router under `/api/<feature>`; services are called only by routers and (for stock changes) via the Stock Ledger service. Repositories are used only by their own module's service, except Stock Ledger which owns stock balance and history tables.

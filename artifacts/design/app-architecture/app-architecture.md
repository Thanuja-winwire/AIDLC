# Application Architecture: Inventory System

Consolidates components, methods, services and dependencies. Sources: specs.md, stories.md, app-architecture-plan.md.

## 1. Style and Decisions
- Single unit, monorepo with `backend/` (FastAPI, SQLAlchemy, SQLite dev / PostgreSQL compatible) and `frontend/` (React, typed API client, React Query).
- Backend layered as feature modules, each with router, service, repository.
- All stock changes go through one Stock Ledger service writing balance and history in one transaction.
- Low-stock computed on read: total quantity across warehouses <= reorder level.
- Report CSV exports are produced by backend streaming endpoints.

## 2. Components
Backend: Products, Warehouses, Suppliers, Stock, Stock Ledger, Purchase Orders, Transfers, Adjustments, History, Reports, Dashboard, Core.
Frontend: API Client, Query Layer, Layout/shared UI, Pages (Dashboard, Products, Warehouses, Suppliers, Stock, Purchase Orders, Transfers, Adjustments, Low Stock, History, Reports).

## 3. Layering
```
React Pages -> Query hooks -> Typed API client
                                  | REST /api/*
Routers -> Services -> Repositories -> DB
              |
              +-> StockLedgerService (only writer of balances/history)
```

## 4. Services
Each module owns a service. PurchaseOrder, Transfer and Adjustment services delegate stock mutation to StockLedgerService. Request-scoped session, one commit per request, domain exceptions mapped to HTTP 404/409/422.

## 5. Key Interfaces
- `/api/products`, `/api/warehouses`, `/api/suppliers`
- `/api/stock`, `/api/stock/low`
- `/api/purchase-orders` (+ `/place`, `/receive`, `/cancel`)
- `/api/transfers`, `/api/adjustments`, `/api/history`
- `/api/reports/{valuation|low-stock|movements|po-summary}` and `.csv` variants
- `/api/dashboard`

## 6. Dependencies
Acyclic. Stock Ledger depends only on Core; PO, Transfers and Adjustments depend on the Ledger; Reports and Dashboard read from Stock and movement data.

## 7. Story Coverage
US-1..US-11 map to Products, Warehouses, Stock, Suppliers, Purchase Orders, Transfers, Adjustments, Stock (low-stock), History, Reports, Dashboard respectively (FR-1..FR-11).

## 8. Local Dev Wiring
Backend on port 8000; Vite dev server proxies `/api` to `http://localhost:8000`.

## 9. Design Notes for Next Stages
Functional Design to define: PO state transitions and partial receiving, ledger invariants, report definitions, validation rules.

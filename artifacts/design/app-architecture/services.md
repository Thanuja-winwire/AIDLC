# Services

Each feature module has a service class holding business logic; routers stay thin and repositories handle persistence only.

| Service | Responsibility | Collaborators |
|---|---|---|
| ProductService | Product rules (unique SKU, supplier links) | ProductRepo, SupplierRepo |
| WarehouseService | Warehouse rules (unique code) | WarehouseRepo, StockRepo |
| SupplierService | Supplier rules | SupplierRepo |
| StockService | Read-only balance and low-stock queries | StockRepo, ProductRepo |
| StockLedgerService | The only writer of stock balances and history | StockRepo, MovementRepo |
| PurchaseOrderService | PO state machine, numbering, receiving | POrepo, StockLedgerService |
| TransferService | Validate warehouses differ, perform transfer | TransferRepo, StockLedgerService |
| AdjustmentService | Validate reason, perform adjustment | AdjustmentRepo, StockLedgerService |
| HistoryService | Filtered ledger queries | MovementRepo |
| ReportService | Aggregations and CSV streaming | StockRepo, MovementRepo, PORepo |
| DashboardService | Compose summary | StockService, ReportService, PORepo, MovementRepo |

## Orchestration Patterns
- **Single transaction per request**: a request-scoped DB session; the service commits once at the end, rolls back on any error. Balance update and history insert therefore succeed or fail together.
- **Stock changes always via StockLedgerService**: PO receipt, transfer (out and in) and adjustment never touch balance or history tables directly.
- **Low-stock computed on read**: sum of balances per product vs `reorder_level`; no stored alert records.
- **Errors**: domain exceptions (`NotFound`, `ValidationError`, `InsufficientStock`, `InvalidState`) mapped to HTTP 404/422/409 by a global handler.
- **Concurrency**: balance rows are updated inside the transaction with a conditional check so the quantity cannot go negative.

# Services

| Service | Responsibility | Collaborators |
|---|---|---|
| AuthService | Credential check, JWT creation, user admin | UserRepository |
| ProductService | Product/category rules (unique SKU, soft deactivate) | ProductRepository, CategoryRepository |
| LocationService | Location management | LocationRepository |
| StockService | Read stock levels and movements | StockRepository, MovementRepository |
| **StockLedger** | Sole writer of stock; row locking; movement records | StockRepository, MovementRepository |
| SupplierService | Supplier management | SupplierRepository |
| PurchaseOrderService | PO state machine; receive via ledger | PurchaseOrderRepository, StockLedger, NumberingService |
| TransferService | Validate and execute transfers atomically | StockLedger, NumberingService |
| AdjustmentService | Adjustments with mandatory reason | StockLedger |
| SalesService | Create sales, compute totals, decrement stock | StockLedger, NumberingService |
| AlertService | Low-stock computation | StockRepository, ProductRepository |
| ReportService | Aggregations and CSV | SalesRepository |
| DashboardService | Summary cards, recent activity | Alert, Report, PO repositories |
| NumberingService | Sequence-based document numbers | DB sequences |

## Orchestration pattern
Each request opens one DB transaction (session per request). A service that changes stock calls StockLedger within that transaction, so document creation, stock updates and movement records commit or roll back together. Routers handle HTTP and RBAC only; services hold business rules; repositories hold queries.

Example (sale): router -> SalesService.create_sale -> NumberingService.next_number -> StockLedger.apply_changes (locks, validates, records) -> SalesRepository.save -> commit.

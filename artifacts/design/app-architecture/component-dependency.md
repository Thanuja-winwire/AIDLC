# Component Dependencies

## Dependency Matrix (row depends on column)

| | Ledger | Stock | Products | Suppliers | Warehouses | Core |
|---|---|---|---|---|---|---|
| Products | | | | x | | x |
| Warehouses | | x | | | | x |
| Suppliers | | | | | | x |
| Stock | | | x | | x | x |
| Stock Ledger | | | | | | x |
| Purchase Orders | x | | x | x | x | x |
| Transfers | x | | x | | x | x |
| Adjustments | x | | x | | x | x |
| History | | | | | | x |
| Reports | | x | | | | x |
| Dashboard | | x | | | | x |

No cycles: Stock Ledger depends only on Core; PO, Transfers and Adjustments depend on the Ledger.

## Communication Patterns
- Frontend to backend: REST JSON over HTTP via the typed API client; Vite dev proxy forwards `/api` to the backend (backend default port 8000).
- Backend internal: direct in-process service calls; router -> service -> repository.
- CSV: report endpoints stream `text/csv`; frontend links to them for download.

## Data Flow: PO Receipt
```
UI --POST /api/purchase-orders/{id}/receive--> PurchaseOrderService
  -> validate state and quantities
  -> StockLedgerService.apply_movement (per line)
       -> update stock_balance + insert stock_movement
  -> update PO line received qty and PO status
  -> commit (single transaction)
UI <-- updated PO; React Query invalidates stock, history, dashboard
```

## Data Flow: Transfer
```
UI --POST /api/transfers--> TransferService
  -> StockLedgerService.apply_transfer
       -> debit source (fails if insufficient), credit destination
       -> two movement rows: transfer_out, transfer_in
  -> insert transfer record, commit
```

## Data Flow: Low-stock
```
UI --GET /api/stock/low--> StockService
  -> SUM(balance) per product vs reorder_level (<=) -> list
```

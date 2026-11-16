# Component Dependencies

## Backend dependency matrix (row depends on column)

| | Core | Auth | Plans | Subs | Billing | Gateway | Analytics | Repos |
|---|---|---|---|---|---|---|---|---|
| Auth | X | | | | | | | X |
| Plans | X | X (guard) | | | | | | X |
| Subscriptions | X | X | X | | X | | | X |
| Billing | X | | | | | X | | X |
| Scheduler | X | | | X | | | | |
| Analytics | X | X | | | | | | X |
| Admin | X | X | | X | X | | X | X |

No cycles: Subscriptions -> Billing -> Gateway. Billing never calls Subscriptions.

## Frontend -> Backend
Pages -> query hooks -> API client -> REST/JSON with `Authorization: Bearer <JWT>` -> FastAPI routers. The frontend depends on the backend's OpenAPI contract. The backend is built first.

## Communication patterns
- Synchronous REST over HTTP; JSON; consistent error body.
- In-process calls between backend modules (dependency injection).
- The scheduler calls services in-process.
- Only the repositories talk to PostgreSQL.

## Data flow: subscribe

```
Browser -> POST /subscriptions -> Router -> SubscriptionService
  -> BillingService.create_invoice -> InvoiceRepo -> PostgreSQL
  -> BillingService.charge_invoice -> PaymentGateway.charge
  -> PaymentRepo -> PostgreSQL
  -> SubscriptionRepo (activate on success)
  -> response -> TanStack Query invalidation -> UI refresh
```

## Data flow: automatic renewal

```
Scheduler tick -> SubscriptionService.find_due
  -> for each: SubscriptionService.renew (own transaction)
     -> invoice -> gateway charge -> payment -> extend period or past_due
```

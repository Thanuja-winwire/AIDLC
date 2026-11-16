# Business Rules — Frontend App

The backend remains the authority on all business rules. The frontend mirrors them only to guide the user and avoid pointless calls.

## Authentication and routing
- FR-A1: Protected routes require a token. Without one, redirect to `/login` and remember the target path.
- FR-A2: Admin routes require `user.role === 'admin'`. Others see a 403 page.
- FR-A3 [Q6]: The JWT is kept in `localStorage` (`sm_token`) and sent as `Authorization: Bearer`. A 401 response clears it and redirects to login.
- FR-A4: Logout clears the token and the TanStack Query cache.
- FR-A5: Admin UI is never shown to customers, but this is a convenience only. The server enforces BR-A4.

## Subscription actions
- FR-S1: Subscribe is offered only when the customer has no `active` or `past_due` subscription (BR-S1).
- FR-S2: Change plan is offered only for an `active` subscription and is disabled for the current plan and for inactive plans (BR-U1, BR-U2).
- FR-S3 [Q4]: Every plan change opens a confirmation dialog that first loads a preview from the backend. Confirm stays disabled until the preview succeeds. The frontend does not compute proration itself.
- FR-S4: After any change the displayed charge comes from the backend response, not from the client.
- FR-S5: Renew now is shown only when `canRenew` (BR-R7).
- FR-S6: Cancel defaults to "at period end" (BR-C1). The dialog states that there are no refunds (BR-C5). Undo is shown only for a pending period-end cancellation (BR-C4).
- FR-S7: Cancelled and expired subscriptions show a summary and a "Choose a plan" action.

## Payment method and card entry [Q5]
- FR-P1: The card number is validated (13-19 digits, Luhn) except the designated test numbers (BR-G1, BR-G2).
- FR-P2: The number is auto-formatted in groups for readability and stripped before sending.
- FR-P3: Only brand and last4 are shown after saving (BR-G4). The raw number and CVC are cleared from state on submit or dialog close.
- FR-P4: Test-card hints are shown on every card form.
- FR-P5: A 402 response shows the failure reason in human wording: `card_declined` -> "Your card was declined", `insufficient_funds` -> "Insufficient funds", `no_payment_method` -> "No payment method on file".

## Invoices [Q3]
- FR-I1: Invoice and payment lists are paginated from the server.
- FR-I2: Download PDF requests the file with the auth header and saves a blob. It cannot be a plain link because the endpoint requires the token. Failure shows a toast.
- FR-I3: A customer can only reach their own invoices. A 404 shows a "not found" state (BR-A5).

## Analytics [Q2]
- FR-M1: Default range is the last 30 days with day granularity. Ranges over 90 days default to month granularity.
- FR-M2: Money is shown with the currency symbol and 2 decimals. Churn is shown as a percentage with 1 decimal.
- FR-M3: A chart with no data shows the empty state, not an empty axis.

## Display and formatting
- FR-D1: Dates are displayed in the user's locale. The API sends ISO 8601 UTC.
- FR-D2: Status colours follow the mapping in `frontend-components.md`.
- FR-D3: Currency amounts are never parsed to floats for arithmetic. They are only formatted via `Intl.NumberFormat`.

## Error handling
- FR-E1: The API client turns `{ error: { code, message, details } }` into an `ApiError`.
- FR-E2: 422 details map to form fields. 409 and 402 show inline alerts in the active dialog or form. 5xx shows an ErrorState with Retry. A network failure shows "Can't reach the server".
- FR-E3: Mutations disable their trigger buttons while pending to avoid double submission.

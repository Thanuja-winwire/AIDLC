# Functional Design Plan: Inventory Management System (single unit)

## Scope
Detailed business logic, domain entities, business rules and frontend components for FR-1 to FR-11 (see `specs.md`, `app-architecture.md`).

## Steps
- [x] Analyze unit context and architecture
- [x] Collect answers to the questions below
- [x] Generate `functional-design/business-logic-model.md`
- [x] Generate `functional-design/business-rules.md`
- [x] Generate `functional-design/domain-entities.md`
- [x] Generate `functional-design/frontend-components.md`

## Questions

## Question 1
How should the Purchase Order receiving handle over-receipt (receiving more than ordered)?

A) Reject: received quantity per line cannot exceed the remaining ordered quantity

B) Allow over-receipt up to a tolerance (e.g. 10%)

C) Allow any over-receipt and record it

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Reject: received quantity per line cannot exceed the remaining ordered quantity

## Question 2
What happens to stock and documents when a PO is cancelled after partial receipt?

A) Cancellation allowed only for Draft/Approved POs with nothing received

B) Cancellation allowed after partial receipt; received stock is kept and the remainder is closed

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Cancellation allowed after partial receipt; received stock is kept and the remainder is closed

## Question 3
How should low-stock be evaluated when the product has stock at several locations?

A) Total quantity across all locations vs. the product reorder level only

B) Per location vs. the reorder level, with a toggle in the UI between total and per-location views

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Per location vs. the reorder level, with a toggle in the UI between total and per-location views

## Question 4
Sales pricing: how should the unit price on a sale line be determined?

A) Default to the product sale price; the user may edit it per line

B) Always the product sale price (not editable)

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Default to the product sale price; the user may edit it per line

## Question 5
Product and stock-adjustment rules: may an adjustment be entered as a delta or as a counted quantity?

A) Delta only (increase or decrease by an amount)

B) Either: delta, or "set counted quantity" which computes the delta

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Either: delta, or "set counted quantity" which computes the delta

## Question 6
Can a user be prevented from locking themselves out (e.g. Admin deactivating self or the last Admin)?

A) Yes, block deactivating or demoting yourself and the last active Admin

B) No restriction

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Yes, block deactivating or demoting yourself and the last active Admin

## Question 7
Gross margin in reports uses unit cost. Which cost value is used for a sale?

A) Snapshot of the product's current unit cost at the time of sale, stored on the sale line

B) The product's unit cost at report time

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Snapshot of the product's current unit cost at the time of sale, stored on the sale line

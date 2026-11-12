# Functional Design Plan: Inventory System (single unit)

Scope: FR-1..FR-11 / US-1..US-11. Output: business-logic-model, business-rules, domain-entities, frontend-components.

## Checklist
- [ ] Step 1: Analyze unit context
- [ ] Step 2: Answer questions below
- [ ] Step 3: Generate domain-entities.md
- [ ] Step 4: Generate business-rules.md
- [ ] Step 5: Generate business-logic-model.md
- [ ] Step 6: Generate frontend-components.md

## Question 1
How should purchase order numbers be formatted?

A) Sequential with prefix, e.g. PO-000123

B) Year-based, e.g. PO-2025-0001

C) Random/UUID-based

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Sequential with prefix, e.g. PO-000123

## Question 2
Can a PO be received for more than the ordered quantity (over-receipt)?

A) No, received quantity per line must not exceed ordered quantity

B) Yes, over-receipt is allowed and recorded

C) Other (please describe after [Answer]: tag below)

[Answer]: A) No, received quantity per line must not exceed ordered quantity

## Question 3
Can a Draft PO be edited (lines, supplier, warehouse) before being placed?

A) Yes, fully editable while Draft; locked after Ordered

B) Only lines editable; supplier and warehouse fixed

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Yes, fully editable while Draft; locked after Ordered

## Question 4
How should products and suppliers be removed?

A) Deactivate only (active flag); never hard delete if referenced

B) Hard delete allowed only when no references, otherwise deactivate

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Deactivate only (active flag); never hard delete if referenced

## Question 5
Should inactive products/warehouses be usable in new POs, transfers and adjustments?

A) No, blocked in new transactions but remain in history and reports

B) Yes, still usable

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Yes, still usable

## Question 6
What should the unit cost on stock valuation use?

A) The product's current unit cost

B) Weighted average cost updated on each PO receipt

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Weighted average cost updated on each PO receipt

## Question 7
Which adjustment reasons should be offered?

A) Fixed list: Damage, Loss, Recount, Correction, Other (with required notes)

B) Free-text reason only

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Fixed list: Damage, Loss, Recount, Correction, Other (with required notes)

## Question 8
Which quantity type should products support?

A) Whole numbers only

B) Decimals (up to 3 places) for weight/volume units

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Decimals (up to 3 places) for weight/volume units

## Question 9
Frontend styling approach?

A) Tailwind CSS with a small custom component set

B) MUI component library

C) Ant Design

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Tailwind CSS with a small custom component set

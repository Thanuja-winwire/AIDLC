# Functional Design Plan — frontend (Frontend App)

Scope: component hierarchy, screen flows, form validation, API integration points and styling approach for the React SPA, built on approved specs.md, stories.md, app-architecture.md and the backend functional design.

## Steps
- [x] Step 1: Define route map and component hierarchy
- [x] Step 2: Define state and data-fetching approach per screen
- [x] Step 3: Define user interaction flows (subscribe, change plan with preview, renew, cancel, payment method)
- [x] Step 4: Define form validation rules
- [x] Step 5: Map each screen to backend endpoints
- [x] Step 6: Choose styling approach and designed empty/loading/error states
- [x] Step 7: Write frontend-components.md, business-logic-model.md, business-rules.md, domain-entities.md

## Questions

## Question 1
Which styling approach should the frontend use?

A) Tailwind CSS with small custom components

B) MUI (Material UI) component library

C) Ant Design component library

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Tailwind CSS with small custom components

## Question 2
How should the admin analytics dashboard render charts?

A) Recharts (React chart library)

B) Chart.js via react-chartjs-2

C) Tables and KPI cards only, no charts

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Recharts (React chart library)

## Question 3
How should invoices be delivered to the customer?

A) On-screen invoice detail with a print-friendly view (browser print)

B) On-screen detail plus a server-generated PDF download

C) On-screen detail only

D) Other (please describe after [Answer]: tag below)

[Answer]: B) On-screen detail plus a server-generated PDF download

## Question 4
How should the plan-change preview (upgrade/downgrade proration) be shown?

A) Confirmation dialog that fetches the preview from the backend and shows the charge before confirming

B) Inline preview panel on the My Subscription page, updated when a plan is selected

C) No preview, confirm directly

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Confirmation dialog that fetches the preview from the backend and shows the charge before confirming

## Question 5
How should the payment method (card) be entered?

A) Simple form: card number, expiry, CVC; only brand and last4 are kept; test-card hints shown in the UI

B) Same form, without test-card hints

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Simple form: card number, expiry, CVC; only brand and last4 are kept; test-card hints shown in the UI

## Question 6
Where should the JWT be stored in the browser?

A) localStorage (simple, acceptable for this local-only scope)

B) In-memory only (lost on refresh)

C) Other (please describe after [Answer]: tag below)

[Answer]: A) localStorage (simple, acceptable for this local-only scope)

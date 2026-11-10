# Functional Design Plan — ecommerce-app (single unit)

Scope: detailed business logic, domain entities, business rules, and frontend components for FR-1 to FR-9 (15 stories).

## Steps
- [x] 1. Analyze unit, story map and approved architecture
- [x] 2. Collect answers to the questions below
- [x] 3. Generate `functional-design/business-logic-model.md`
- [x] 4. Generate `functional-design/business-rules.md`
- [x] 5. Generate `functional-design/domain-entities.md`
- [x] 6. Frontend components: covered in section 8 of `business-logic-model.md` (a separate file is not in this phase's allowed outputs)

## Questions

## Question 1
Shipping cost rule for checkout?

A) Flat rate of $5.00 on every order

B) Flat rate, free when subtotal is $50 or more

C) No shipping charge

D) Other (please describe after [Answer]: tag below)

[Answer]: C) No shipping charge

## Question 2
Tax handling on orders?

A) No tax

B) Fixed 8% tax on subtotal

C) Other (please describe after [Answer]: tag below)

[Answer]: B) Fixed 8% tax on subtotal

## Question 3
Mock payment outcomes: which test card numbers drive results?

A) 4242 4242 4242 4242 succeeds, 4000 0000 0000 0002 declines, any other number declines

B) 4242 4242 4242 4242 succeeds, 4000 0000 0000 0002 declines, any other valid 16-digit number succeeds

C) Other (please describe after [Answer]: tag below)

[Answer]: A) 4242 4242 4242 4242 succeeds, 4000 0000 0000 0002 declines, any other number declines

## Question 4
Order cancellation rules?

A) Customer may cancel while status is pending, paid or processing (stock restored); admin may cancel any non-delivered order

B) Only admin may cancel orders

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Customer may cancel while status is pending, paid or processing (stock restored); admin may cancel any non-delivered order

## Question 5
Admin order status transitions?

A) Strict forward-only: paid → processing → shipped → delivered (cancel allowed before shipped)

B) Admin may set any status freely

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Strict forward-only: paid → processing → shipped → delivered (cancel allowed before shipped)

## Question 6
Product deletion when it appears in past orders?

A) Soft delete (is_active flag); hidden from catalog, kept in order history

B) Block deletion if referenced by orders

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Soft delete (is_active flag); hidden from catalog, kept in order history

## Question 7
Admin safety rules for users?

A) Admin cannot deactivate or demote themselves; at least one active admin must remain

B) No restrictions

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Admin cannot deactivate or demote themselves; at least one active admin must remain

## Question 8
Frontend styling approach?

A) Tailwind CSS with lucide-react icons

B) MUI component library

C) Bootstrap plus custom stylesheet

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Tailwind CSS with lucide-react icons

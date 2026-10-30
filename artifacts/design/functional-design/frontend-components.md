# Frontend Components

## Hierarchy
```
main.calculator
  section.display (aria-live="polite")
    div.expression
    div.result
  div.keypad (grid, 4 columns)
    button x18 (C, DEL, %, ÷, 7 8 9 ×, 4 5 6 -, 1 2 3 +, 0 . =)
```

## Layout
The keypad has a 4-column grid with 5 rows: [C, DEL, %, ÷], [7, 8, 9, ×], [4, 5, 6, -], [1, 2, 3, +], [0 (spans 2 columns), ., =]. That gives 18 buttons: 10 digits, ".", C, DEL, %, four operators and "=".

## State and props
There is no UI framework. The view is a function: `render({display, expression, isError})`. DOM state is limited to the text of two elements and an `is-error` class on the display.

## Interaction flow
- A click on a button reads its `data-action` and `data-value` attributes (event delegation on the keypad) and calls the matching engine method, then renders.
- A keydown on the document maps the key per BR-13, calls the engine, and renders. The matching button gets a brief "pressed" visual.
- There are no forms and no API calls.

## Validation
All validation is in the engine (BR-3, BR-4, BR-7, BR-8). The UI only displays the result.

## Accessibility
Real `<button>` elements with aria-labels ("Divide", "Delete", "Clear", "Equals"), an aria-live region for the result, visible focus rings, and contrast of at least 4.5:1.

## Styling approach
Hand-written CSS in `styles.css` with no framework, using CSS custom properties for design tokens.
- **Type scale:** the result is 2.5-3rem with scaling for long values, the expression is 1rem muted, and button labels are 1.25rem.
- **Spacing:** an 8px base unit and a 12px grid gap.
- **Colour system:**
  - a neutral dark surface and lighter button fills
  - an accent colour for the operators and "="
  - a distinct tone for C and DEL
  - a red error tone
- **Depth:** the card has rounded corners and a soft shadow.
- **States:** hover, active (slight scale) and focus-visible ring on every button.
- **Responsive:** the card is `min(100%, 380px)` wide and centred, with 44px or larger buttons using `aspect-ratio` and `clamp()` sizing. It works from 320px upward, and it uses `100dvh` with safe-area padding on mobile.
- **Error state:** the result is shown in the error colour with a subtle tinted display background.

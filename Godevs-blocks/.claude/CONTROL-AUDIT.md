# GoBlocks Inspector Controls — Full Audit & Fix Plan
# Compared against GenerateBlocks Pro · Kadence · Spectra · Stackable

---

## 1. Root Cause: WHY Controls Look Broken

### Issue A — CSS Specificity (CRITICAL)
All `gb-unit-input__*` selectors in `inspector.css` use a single class (specificity `0,1,0`).
The WP block editor loads global CSS like:
```
.block-editor-block-inspector input[type="number"]  → 0,1,1  (wins over 0,1,0)
.components-panel__body select                      → 0,1,1  (wins over 0,1,0)
```
Result: WP's border, padding, height on `<input>` and `<select>` override our custom styles.
The raw input rows get double borders, wrong sizes, and broken flex layout.

**Fix**: Prefix all form-element selectors with `.gb-inspector-tabs__panel` AND add element
type for compound specificity (0,3,0 beats everything WP uses):
```css
.gb-inspector-tabs__panel .gb-unit-input__row input.gb-unit-input__number { ... }
.gb-inspector-tabs__panel .gb-unit-input__row select.gb-unit-input__unit { ... }
```

---

### Issue B — Select `height: 100%` Bug (IMPORTANT)
```css
.gb-unit-input__unit { height: 100%; }   /* ← broken */
```
`height: 100%` on a flex child whose parent has no explicit height resolves to `auto`,
which conflicts with `min-height: 30px` and causes inconsistent rendering across browsers.

**Fix**: Remove `height: 100%`. Use `align-self: stretch` + set `min-height` on the ROW.

---

### Issue C — Unit Select Too Narrow (VISUAL)
`width: 52px` clips "inherit" (7 chars). In the dropdown the option shows as "inher…".
Confuses users who see a truncated keyword.

**Fix**: Widen to `60px` AND abbreviate long keywords in `<option>` labels:
- `inherit` → `inh`

---

### Issue D — Keyword-Only Row Alignment (UX)
When unit is `auto`/`none`/`inherit`, the number `<input>` is hidden. The 60px `<select>` sits
in the leftover space on the RIGHT of an empty row. Looks broken — users see a tiny selector
floating in a wide empty container.

**Fix**: When no number input, the select fills the full row width. Use CSS `:has()`:
```css
.gb-unit-input__row:not(:has(input)) select.gb-unit-input__unit { flex: 1; border-left: none; ... }
```

---

### Issue E — DimensionsControl Min/Max Section (UX)
4 UnitInputs ("Min W", "Max W", "Min H", "Max H") in a 2×2 grid at ~125px per cell.
At narrow sidebar widths, inputs become unusable.

**Compare**: Kadence uses FULL-WIDTH rows per dimension with icon prefix (W/H/etc).
GenerateBlocks stacks them vertically with the label as part of the row.

**Fix**: Add a min-section label row + ensure labels are abbreviated but clear.

---

### Issue F — SpacingControl Linked State Bug (FUNCTIONAL)
```ts
function allSidesEqual(v) {
    if (!top || !right || !bottom || !left) return false;  // ← BUG
    return top === right && top === bottom && top === left;
}
```
If the user sets only padding-top (e.g., just `60px`), `right/bottom/left` are undefined →
`allSidesEqual` returns `false` → Link button shows "unlinked" even though the user
expects the control to behave linked. When they click the link to "link all sides",
nothing obvious happens.

This is OK for now (by design — partial values = unlinked), but the UX is confusing.
A future improvement: show "link" as a button that sets all sides to the same value.

---

## 2. Comparison with Premium Plugins

| Feature                  | GoBlocks (current)     | GenerateBlocks Pro      | Kadence Blocks         | Spectra               |
|--------------------------|------------------------|-------------------------|------------------------|-----------------------|
| Unit input layout        | Number + Select row    | WP UnitControl          | WP UnitControl         | Custom compact        |
| Spacing grid             | 2×2 grid              | Box-model visual        | Stacked with icon tabs | Linked number row     |
| Sizing dimensions        | 2-col W/H + 2×2 min   | Separate rows full-width| Tab: min/max separate  | Compact grid          |
| CSS specificity          | Single class (breaks!) | Scoped to sidebar       | Scoped + WP components | Scoped                |
| Unit select width        | 52px (clips "inherit") | Uses WP UnitControl     | Uses WP UnitControl    | ~55px                 |
| Keyword state            | Empty row (broken UX)  | Entire field becomes KW | Entire field           | Entire field          |
| Panel WP component style | Generic WP             | Heavily themed          | Clean WP components    | Custom themed         |
| Toggle visual            | WP default             | Custom indigo toggle    | Custom purple toggle   | Custom blue toggle    |
| Inspector tab bar        | Dark (premium ✓)       | Light                   | Light                  | Light                 |

**GoBlocks advantages**: Dark tab bar, breakpoint switcher, CSS custom property system.
**GoBlocks gaps**: Specificity bug, cramped dimensions grid, keyword state UX.

---

## 3. Fix Priority

| # | File                        | Issue           | Impact  | Status     |
|---|-----------------------------|-----------------|---------|------------|
| 1 | `assets/css/inspector.css`  | Specificity     | BREAKS  | TO FIX     |
| 2 | `assets/css/inspector.css`  | Select height   | Visual  | TO FIX     |
| 3 | `assets/css/inspector.css`  | Select width    | UX      | TO FIX     |
| 4 | `assets/css/inspector.css`  | Keyword row     | UX      | TO FIX     |
| 5 | `src/.../UnitInput.tsx`     | "inherit" label | UX      | TO FIX     |
| 6 | `assets/css/inspector.css`  | WP overrides §20| Polish  | DONE ✓     |
| 7 | `assets/css/blocks.css`     | Default styles  | Premium | DONE ✓     |

---

## 4. Default Style Assessment (Post-Improvement)

| Block     | Default Style Quality | Notes                                     |
|-----------|----------------------|-------------------------------------------|
| Box       | Good ✓               | Editor placeholder, CSS custom props      |
| Heading   | Excellent ✓          | Fluid clamp() type scale all 6 levels     |
| Text      | Good ✓               | `1.75` line-height, color inheritance     |
| Button    | Excellent ✓          | Gradient, hover lift, focus ring, variants|
| Grid      | Good ✓               | `gap: 1.5rem` default                     |
| Image     | Good ✓               | `object-fit: cover`, `border-radius: inh` |
| Icon      | Good ✓               | `fill: currentColor`                      |
| Shape     | Good ✓               | `width: 100%` SVG                         |
| Accordion | Excellent ✓          | Shadow, hover, open accent, chevron       |
| Tabs      | Excellent ✓          | Active state, vertical mode, no scrollbar |
| Query     | Good ✓               | No-results state, placeholder icon        |
| Pagination| Basic                 | Needs post-Phase-3 styling work           |

---

## 5. Session Fix Log

- [x] UnitInput SelectControl → raw `<select>` (previous session)
- [x] inspector.css §20 WP component overrides added
- [x] blocks.css premium rewrite (fluid type scale, shadow system)
- [ ] inspector.css specificity fix (THIS SESSION)
- [ ] UnitInput keyword label abbreviation (THIS SESSION)

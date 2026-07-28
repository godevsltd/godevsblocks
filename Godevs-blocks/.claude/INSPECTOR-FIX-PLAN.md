# GoBlocks Inspector Controls — Fix & Modernise Plan

**Author:** Senior WP Developer review  
**Date:** 2026-06-17  
**Scope:** Block settings panel bugs, inspector dark header, block editor UX

---

## Root Cause Analysis

### Bug 1 — UnitInput does NOT sync when breakpoint switches (CRITICAL)

**File:** `src/components/controls/UnitInput.tsx`

```tsx
// CURRENT — broken:
const [ localNum, setLocalNum ] = useState( initNum );   // only runs ONCE on mount
const [ localUnit, setLocalUnit ] = useState( initUnit ); // never updates from props
```

`useState(initialValue)` only reads `initialValue` on the first render.  
When the user clicks a different breakpoint, the `value` prop changes to the new  
breakpoint's value, but `localNum` / `localUnit` stay frozen at what they were on mount.

**Symptom:** Type "20px" on Base → switch to MD → input still shows "20" instead of empty.  
Any typing on MD overwrites the wrong breakpoint's data silently.

**Fix:** Add a `useEffect` that syncs local state whenever the controlled `value` prop changes.

---

### Bug 2 — ToggleGroupControl's WP `variant="primary"` overrides custom CSS (VISUAL)

**File:** `src/components/controls/ToggleGroupControl.tsx`

```tsx
// CURRENT — broken active state styling:
variant={ isActive ? 'primary' : 'secondary' }
```

WordPress `Button` with `variant="primary"` injects `.is-primary { background: var(--wp-admin-theme-color, #007cba) }` at high specificity. Our custom `.gb-toggle-group__btn.is-active { background: #fff; color: #2563eb; }` loses the fight and the button renders WP-blue instead of the macOS-style white active chip.

**Fix:** Always use `variant="tertiary"` (no WP colour); our CSS fully controls the appearance.

---

### Bug 3 — SpacingControl `linked` state doesn't reset on breakpoint switch (MINOR)

**File:** `src/components/controls/SpacingControl.tsx`

```tsx
const [ linked, setLinked ] = useState( () => allSidesEqual( values ) );
// Same useState-init problem — never re-checks when values change
```

After switching breakpoints where only one side is set, the lock icon shows the wrong state.

**Fix:** Add a `useEffect` keyed on the four value props.

---

## Design Issues

### D1 — Dark inspector header (user explicitly requested removal)

**File:** `assets/css/inspector.css` §1

```css
.gb-inspector-tabs > .components-tab-panel__tabs {
    background: #1e2433; /* dark navy — REMOVE */
}
```

Replace with a clean white/light header consistent with the WP admin colour scheme.

---

### D2 — LayoutPanel: 7 Display options in one ToggleGroup row

**File:** `src/components/panels/LayoutPanel.tsx`

7 buttons (`Block`, `Flex`, `Grid`, `Inline`, `Inline-Flex`, `Inline-Grid`, `None`) in a  
~280px sidebar makes each button 28–32px wide — unreadable and cramped.

**Fix:** Keep only the 4 most-used options: `Block`, `Flex`, `Grid`, `None`.  
`Inline` and `Inline-Flex` / `Inline-Grid` are edge cases; still accessible via the  
existing CSS classes global input in the Advanced tab.

---

### D3 — Block inspector panels need better visual hierarchy

The existing CSS groups controls correctly but the `PanelBody` header toggle buttons  
look like stock WP. Padding is inconsistent (some panels 12px, some 8px).  
No visual separation between a label and its controls.

**Fix:** Rewrite `inspector.css` with a clean, professional light-mode design.

---

## Implementation Plan

### Phase 1 — Fix Critical Bugs

| # | File | Change |
|---|------|--------|
| 1 | `src/components/controls/UnitInput.tsx` | Add `useEffect` sync on `value` prop |
| 2 | `src/components/controls/ToggleGroupControl.tsx` | `variant="tertiary"` always; remove `isSmall` |
| 3 | `src/components/controls/SpacingControl.tsx` | `useEffect` for `linked` state sync |

### Phase 2 — Inspector CSS Redesign

| # | Change |
|---|--------|
| 1 | Remove dark `#1e2433` header → white with bottom border |
| 2 | Tab items: dark text, blue underline on active |
| 3 | Breakpoint tabs: match WP admin grey palette |
| 4 | Panel body: consistent 10px/12px padding, 10px gap between controls |
| 5 | ToggleGroup: macOS pill style (grey bg, white active chip + shadow) — no WP-blue |
| 6 | UnitInput: grouped border, focus ring |
| 7 | SpacingControl: 2×2 grid, cleaner link button |
| 8 | ColorControl: grouped border row, checkerboard swatch |

### Phase 3 — UX & Panel Improvements

| # | File | Change |
|---|------|--------|
| 1 | `src/components/panels/LayoutPanel.tsx` | Display: 4 options only |
| 2 | `src/components/panels/TypographyPanel.tsx` | Read & improve if needed |

### Phase 4 — Build & ZIP

```
npm run build
node bin/stage.js && node bin/make-zip.js
```

---

## Expected Outcome

After these changes:

- **Controls work correctly** when switching breakpoints — inputs show the correct value  
  for the active breakpoint (or empty + placeholder from inherited value)
- **ToggleGroup active state** shows white chip on grey background (macOS style), not WP-blue
- **Inspector header** is white with blue underline on active tab — professional, consistent with WP admin
- **Spacing control** lock icon reflects the correct linked state per breakpoint
- **Display options** are readable — 4 buttons fit the 280px sidebar cleanly

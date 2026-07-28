# Inspector Controls — Design Audit

_Audited 2026-06-16. Compare against GenerateBlocks 2.x inspector._

---

## 1. Root Problem

Most controls have **zero custom CSS**. `inspector.css` only covers four things:
`gb-inspector-tabs`, `gb-breakpoint-tabs`, `gb-unit-input`, `gb-toggle-group`.

Everything else — `gb-color-control`, `gb-spacing-control`, `gb-flex-control`,
`gb-dimensions-control`, `gb-gradient-control`, `gb-shadow-control`,
`gb-font-control` — falls back to bare browser defaults or WP component styles.
This makes the inspector look like an unfinished prototype.

---

## 2. Per-Control Gaps

### UnitInput (`gb-unit-input`)
- **✅ Has CSS** — hover-reveal reset, row layout, unit selector width
- **Gap:** Number input has no border radius or focus ring matching the design token
  (`--gb-radius-base`). The number + unit row looks like two disconnected inputs.
- **Fix:** Wrap the row in a shared border/radius that acts as one visual unit (pill-style
  group). Apply `--gb-color-primary` focus ring to the row wrapper, not the individual input.

### SpacingControl (`gb-spacing-control`)
- **No CSS whatsoever** — header, label, link button, and 4-column grid all unstyled
- **Fix:** Define spacing between `__header` and `__grid`, grid gap, and a subtle
  section separator between Padding and Margin.

### DimensionsControl (`gb-dimensions-control`)
- **No CSS** — W/H row and min/max 4-column grid are unstyled
- **Fix:** 2-column row for width/height, 4-column grid for min/max. Add a small
  section header above the min/max row: "Min / Max".

### FlexControl (`gb-flex-control`)
- **No CSS** for container or gap row
- **Icon gap:** Direction uses `→ ← ↓ ↑` (Unicode arrows). Justify uses `|← →| |■|`
  — cryptic, looks broken in some fonts. GB uses proper SVG icon buttons.
- **Fix (CSS):** Set `display: flex; flex-direction: column; gap` between control rows.
  Add a 1px divider between FlexControl and the outer LayoutPanel content.
- **Fix (icons):** Replace Unicode arrow labels with WP icon equivalents via the
  `icon` field in `ToggleOption`. Use `arrowRight/Left/Up/Down` from `@wordpress/icons`
  for Direction; custom SVG for justify modes (or text labels with proper sizing).

### ColorControl (`gb-color-control`)
- **No CSS** for palette grid, row layout, preview swatch, or hex input
- **Gap:** No checkerboard pattern to indicate transparent/unset colors
- **Gap:** Preview swatch button has inline `style` (correct — dynamic color) but no
  border, no size, no visual affordance that it's clickable
- **Fix:** 28×28px rounded swatch with `1px solid var(--gb-color-border)` and
  checkerboard `::before` for transparency. Palette grid: `grid-template-columns:
  repeat(auto-fill, 18px)` with 4px gap.

### GradientControl (`gb-gradient-control`)
- **No CSS** — preview strip, stop list, add button all unstyled
- **Gap:** Preview strip height is 0 (no `height` set — invisible)
- **Fix:** `height: 32px; border-radius: var(--gb-radius-base)` on `__preview`.
  Stop list: each stop in a 2-column grid (color swatch | position input).

### ShadowControl (`gb-shadow-control`)
- **No CSS** — layer grid, header, add/remove buttons all unstyled
- **Gap:** `__layer-grid` is 4 UnitInputs with no column layout — they stack vertically
- **Fix:** `display: grid; grid-template-columns: 1fr 1fr; gap:` on `__layer-grid`.
  Wrap each layer in a card-style div with `background: var(--gb-color-surface-raised);
  border-radius: var(--gb-radius-base); padding:`.

### FontControl (`gb-font-control`)
- **No CSS** — header + label + toggle button all unstyled
- **Fix:** Same `__header` flex row pattern as other controls.

### BreakpointTabs (`gb-breakpoint-tabs`)
- **✅ Has CSS** — sticky, border, active state
- **Gap:** Text labels only (Base, XS, SM...). With 7 breakpoints the tab bar is
  cramped at the 280px inspector width. Labels overflow or wrap.
- **Fix:** Reduce font-size to `10px` for breakpoint tabs. Add a subtle `font-variant:
  all-small-caps` or use abbreviated glyphs. Consider hiding `2XL` by default and
  showing it only in settings (configurable breakpoints already exist).

### ToggleGroupControl (`gb-toggle-group`)
- **✅ Has CSS** — active fill, border gap, sizing
- **Gap:** Buttons that hold multi-word text labels (Start, End, Stretch, Baseline in
  FlexControl) overflow the button width. No `white-space: nowrap` or `overflow: hidden`.
- **Fix:** Add `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` to
  `.gb-toggle-group__btn`.

---

## 3. Design Language Gaps vs GenerateBlocks

| Pattern | GB | GoBlocks current | Fix |
|---|---|---|---|
| Control row density | 32px min-height | varies (no CSS) | Standardize all rows to 32px |
| Section separators | 1px border between groups | none | `border-top: 1px solid --gb-color-border` |
| Label weight | 11px, 500 weight, uppercase | 12px, no uppercase | 11px / 500 / `letter-spacing: 0.04em` |
| Icon buttons | SVG icons for direction/justify | Unicode text | Swap to `@wordpress/icons` |
| Color swatch | 24px circle, checkerboard bg | unstyled button | Styled swatch + checkerboard |
| Layer builders | Card per layer, subtle bg | no card styling | Surface-raised card with border |
| Add/Remove | Icon-only + tooltip | "+ Add" / "Remove" text | Keep text (accessible) but style consistently |
| Panel body padding | 12px all sides | WP default (16px) | 12px from `inspector.css` (existing rule) |

---

## 4. Implementation Plan

All CSS lives in `assets/css/inspector.css`. No new files needed.

Sections to add:
- `§6.10` — Spacing control
- `§6.11` — Dimensions control
- `§6.12` — Color control
- `§6.13` — Gradient control
- `§6.14` — Shadow control
- `§6.15` — Font control
- `§6.16` — Flex control
- `§6.17` — UnitInput group border (refine §6.8)
- `§6.18` — ToggleGroup overflow fix (refine §6.9)

Icon swaps (TypeScript, in `FlexControl.tsx`):
- Direction: `arrowRight`, `arrowLeft`, `arrowDown`, `arrowUp`
- Justify: custom inline SVGs or keep text labels (acceptable fallback)

Label refinements (CSS-only, no JS change):
- `.gb-*__label`, `.gb-*__legend` → `font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase`

Total scope: ~250 lines of new CSS + icon swap in `FlexControl.tsx` +
`arrowRight/Left/Up/Down` added to `wp-modules.d.ts`.

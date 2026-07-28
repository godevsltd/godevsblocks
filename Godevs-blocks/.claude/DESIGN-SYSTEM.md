# GoBlocks — Design System Specification

> **Status:** Task 4 complete — design spec approved before CSS authoring.  
> **Scope:** Admin pages, Global Styles editor, Pattern Library, Inspector sidebar, inspector controls.  
> **Constraint:** STYLING-ONLY. No new blocks, block attributes, PHP render, REST endpoints, or CSS-engine changes.

---

## 1. Visual Identity

### Character
**"Precision Studio"** — a professional dark-accent tool identity that signals GoBlocks is
a purpose-built editor environment, not a marketing page. Calm surfaces, high-contrast
interactive elements, intentional depth. Feels like a code editor sidebar next to a
document canvas, not a WP admin form.

### How this differs from competition
| Competitor | Their identity | GoBlocks counter-position |
|---|---|---|
| GenerateBlocks | Thin WP-blue patch over WP defaults | Purposeful surface hierarchy + token application |
| Kadence Blocks | Blue/purple gradient decoration | Neutral surfaces, accent used sparingly and precisely |
| Spectra | Orange accent on WP white | Darker admin shell, not just a colour swap |
| WP Core admin | `#f0f0f1` background, white panels | Raised surfaces, deliberate shadow scale, contrast layers |

### Personality keywords
- Precise (tight spacing, clear hierarchy)
- Dark-accented (not pitch black — WP admin stays in place; GoBlocks adds depth layers)
- Token-faithful (every value references a token; no hard-coded hex in new CSS)
- Legible (text on every surface meets WCAG AA at minimum)

---

## 2. Colour Decisions

All values reference existing Tier 2 semantic tokens from `tokens.css`. No new colour
values are introduced. The only change is *application* — wiring existing tokens to
component selectors.

### Surface hierarchy (light mode)
```
Page background (WP controls):  #f0f0f1     (WP's own --wp-admin-background)
Admin shell surface:             --gb-color-surface             (#ffffff)
Raised card/panel:               --gb-color-surface-raised      (#f9fafb)
Hover/overlay surface:           --gb-color-surface-overlay     (#f3f4f6)
Inspector sidebar:               --gb-color-surface-raised      (#f9fafb) — see §6
```

### Inspector sidebar dark variant
The inspector gains a distinct dark surface treatment using the inverse surface token,
applied only inside `.gb-inspector-tabs` and `.gb-breakpoint-tabs`. This is the primary
visual differentiator vs. GenerateBlocks.

```
Inspector surface:               --gb-color-surface-inverse     (#111827)  [dark bg]
Inspector panel header text:     --gb-color-text-inverse        (#ffffff)
Inspector body (open panel):     --gb-color-surface             (#ffffff)  [white panels inside dark frame]
Inspector border:                rgba(255,255,255,0.08)          [subtle on dark]
```

> **Dark mode note:** In dark mode (`@media (prefers-color-scheme: dark)`), `--gb-color-surface-inverse`
> remaps to `--gb-primitive-neutral-0` (#fff). Because the inspector's dark treatment
> references the token, it will automatically become light in dark mode — maintaining
> contrast without separate dark-mode rules for the inspector.

### Accent use
`--gb-color-primary` (`#2563eb`) is used for:
- Active tab indicators (bottom border or left border stripe)
- Focus rings
- Primary action buttons
- Active device tab state in BreakpointTabs

`--gb-color-primary` is **NOT** used for:
- Background fills on non-interactive elements
- Text colour (only for underline/border use on hover states)
- Borders except focus rings and active indicators

### Border palette
```
Default border:     --gb-color-border        (#e5e7eb)
Strong border:      --gb-color-border-strong (#9ca3af)
Focus ring:         --gb-color-border-focus  (#3b82f6)   2px solid, 2px offset
Active indicator:   --gb-color-primary       (#2563eb)   3px solid
```

---

## 3. Typography Decisions

All from existing tokens. No new scale values.

### Admin UI hierarchy
```
Page heading (h1):   --gb-text-xl    (20px), --gb-weight-semibold (600)
Section heading:     --gb-text-base  (16px), --gb-weight-semibold (600)
Card/panel label:    --gb-text-sm    (14px), --gb-weight-medium   (500)
Body / field text:   --gb-text-sm    (14px), --gb-weight-normal   (400)
Help text / muted:   --gb-text-xs    (12px), --gb-weight-normal   (400), --gb-color-text-muted
Tags / badges:       --gb-text-2xs   (10px), --gb-weight-semibold (600), uppercase
```

### Inspector hierarchy
```
Panel title:         --gb-text-xs    (12px), --gb-weight-semibold (600), uppercase, letter-spacing 0.05em
Control label:       --gb-text-xs    (12px), --gb-weight-medium   (500)
Control value:       --gb-text-sm    (14px), --gb-weight-normal   (400)
Tab labels:          --gb-text-xs    (12px), --gb-weight-medium   (500)
```

---

## 4. Spacing Decisions

Admin pages use a generous outer rhythm; inspector controls use a tight inner rhythm.

### Admin page spacing
```
Page outer padding:          --gb-space-sm  (16px) on mobile; --gb-space-md (24px) on 782px+
Settings container max-w:    800px  (slightly wider than GB's 750px — GoBlocks has more controls)
Card internal padding:       --gb-space-md  (24px)
Card gap (grid):             --gb-space-md  (24px)
Field vertical gap:          --gb-space-5   (20px)
Section gap:                 --gb-space-8   (32px)
```

### Inspector spacing
```
Panel body padding:          --gb-space-3   (12px) all sides
Control row gap:             --gb-space-2   (8px)
Label-to-input gap:          --gb-space-1   (4px)
Tab bar height:              32px
Tab padding:                 0 --gb-space-2 (0 8px)
```

---

## 5. Depth & Motion

### Shadow scale application
```
Admin card at rest:          --gb-shadow-xs   (0 1px 2px, 5% black)
Admin card on hover:         --gb-shadow-sm   (0 1px 3px + 1px 2px, 10% black)
Popover / colour picker:     --gb-shadow-md
Modal overlay:               --gb-shadow-xl
```

### Motion principles
- All interactive transitions: `150ms ease-in-out` (not longer — admin UI should feel fast)
- Properties to transition: `background-color`, `box-shadow`, `border-color`, `opacity`, `color`
- NO transitions on `height`/`width` (causes layout jank in WP panels)
- NO transform animations (WP already uses these for its own panel animations)

---

## 6. Component Specifications

### 6.1 Admin Page Shell (`.gb-admin-page`, `.gb-admin-header`)

**Intent:** Give GoBlocks admin pages a clear identity without clashing with WP's `#f0f0f1`
page background. The header is white with the primary-blue accent on the logo mark.

```
.gb-admin-page
  background:        transparent (inherits WP #f0f0f1)
  padding:           0

.gb-admin-header
  background:        --gb-color-surface  (#fff)
  border-bottom:     1px solid --gb-color-border
  padding:           --gb-space-4 --gb-space-5  (16px 20px)
  display:           flex, align-items center, gap --gb-space-3

.gb-admin-header__logo  (svg or img)
  color / fill:      --gb-color-primary
  width:             24px, height: 24px

.gb-admin-header__title
  font-size:         --gb-text-xl
  font-weight:       --gb-weight-semibold
  color:             --gb-color-text
  margin:            0
```

### 6.2 Admin Navigation Tabs (`.gb-admin-tabs`)

**Intent:** Underline-style navigation that matches WP conventions but uses the GB accent
blue instead of WP's `#007cba`.

```
.gb-admin-tabs
  display:           flex
  border-bottom:     1px solid --gb-color-border
  background:        --gb-color-surface
  gap:               0
  overflow-x:        auto

.gb-admin-tabs__tab  (a or button)
  padding:           --gb-space-3 --gb-space-4  (12px 16px)
  font-size:         --gb-text-sm
  font-weight:       --gb-weight-medium
  color:             --gb-color-text-muted
  text-decoration:   none
  border-bottom:     3px solid transparent
  transition:        color 150ms ease-in-out, border-color 150ms ease-in-out
  white-space:       nowrap

.gb-admin-tabs__tab:hover
  color:             --gb-color-text
  border-bottom-color: --gb-color-border

.gb-admin-tabs__tab.is-active
  color:             --gb-color-primary
  font-weight:       --gb-weight-semibold
  border-bottom-color: --gb-color-primary
```

### 6.3 Admin Card (`.gb-admin-card`)

**Intent:** A white panel with subtle lift from the WP page background, clear inner padding,
and a hover shadow to signal interactivity where applicable.

```
.gb-admin-card
  background:        --gb-color-surface
  border:            1px solid --gb-color-border
  border-radius:     --gb-radius-lg    (8px)
  padding:           --gb-space-md     (24px)
  box-shadow:        --gb-shadow-xs
  transition:        box-shadow 150ms ease-in-out

.gb-admin-card:hover  (only when card is a link/button — add .is-interactive class)
  box-shadow:        --gb-shadow-sm

.gb-admin-card__title
  font-size:         --gb-text-base
  font-weight:       --gb-weight-semibold
  color:             --gb-color-text
  margin:            0 0 --gb-space-2  (0 0 8px)

.gb-admin-card__body
  color:             --gb-color-text-muted
  font-size:         --gb-text-sm
  line-height:       --gb-leading-relaxed
```

### 6.4 Admin Field (`.gb-admin-field`)

```
.gb-admin-field
  display:           flex
  flex-direction:    column
  gap:               --gb-space-1  (4px)

.gb-admin-field__label
  font-size:         --gb-text-sm
  font-weight:       --gb-weight-medium
  color:             --gb-color-text

.gb-admin-field__help
  font-size:         --gb-text-xs
  color:             --gb-color-text-muted
  line-height:       --gb-leading-relaxed
```

### 6.5 Admin Notice (`.gb-admin-notice`)

```
.gb-admin-notice
  border-radius:     --gb-radius-md  (6px)
  padding:           --gb-space-3 --gb-space-4
  font-size:         --gb-text-sm
  border-left:       4px solid

.gb-admin-notice--success
  background:        --gb-color-success-light
  border-left-color: --gb-color-success

.gb-admin-notice--warning
  background:        --gb-color-warning-light
  border-left-color: --gb-color-warning

.gb-admin-notice--error
  background:        --gb-color-danger-light
  border-left-color: --gb-color-danger

.gb-admin-notice--info
  background:        --gb-color-info-light
  border-left-color: --gb-color-info
```

### 6.6 Inspector Tabs (`.gb-inspector-tabs`)

**Intent:** The primary GoBlocks differentiator in the editor sidebar. A dark frame wraps
the tab strip; individual panels open into white bodies.

```
.gb-inspector-tabs
  display:           flex
  flex-direction:    column

.gb-inspector-tabs__tablist   (WP TabPanel renders ul[role=tablist])
  display:           flex
  background:        --gb-color-surface-inverse   (#111827 light / #fff dark)
  border-bottom:     1px solid rgba(255,255,255,0.08)
  padding:           0
  margin:            0
  list-style:        none

.gb-inspector-tabs__tab   (button[role=tab])
  flex:              1
  padding:           --gb-space-2 --gb-space-1  (8px 4px)
  font-size:         --gb-text-xs
  font-weight:       --gb-weight-medium
  color:             rgba(255,255,255,0.55)   [on dark bg]
  background:        transparent
  border:            none
  border-bottom:     3px solid transparent
  cursor:            pointer
  transition:        color 150ms ease-in-out, border-color 150ms ease-in-out

.gb-inspector-tabs__tab:hover
  color:             rgba(255,255,255,0.85)

.gb-inspector-tabs__tab.is-active   (WP adds this class on the active tab)
  color:             --gb-color-text-inverse   (#fff)
  border-bottom-color: --gb-color-primary
  font-weight:       --gb-weight-semibold

.gb-inspector-tabs__panel
  background:        --gb-color-surface
  min-height:        0
```

> **Dark mode override:** In `@media (prefers-color-scheme: dark)` the token
> `--gb-color-surface-inverse` remaps to white — so the inspector tab bar automatically
> lightens. The tab text colours (rgba white fractions) need an explicit dark-mode override
> to switch to rgba-black fractions. Document this in the CSS with a comment.

### 6.7 Breakpoint Device Tabs (`.gb-breakpoint-tabs`)

**Intent:** A compact icon-based tab strip, sticky at the top of the inspector, using
the primary accent on the active device.

```
.gb-breakpoint-tabs
  position:          sticky
  top:               0
  z-index:           --gb-z-10   (10)
  display:           flex
  background:        --gb-color-surface-raised   (#f9fafb)
  border-bottom:     1px solid --gb-color-border
  padding:           0

.gb-breakpoint-tabs__tab
  flex:              1
  display:           flex
  align-items:       center
  justify-content:   center
  padding:           --gb-space-2  (8px)
  min-height:        32px
  background:        transparent
  border:            none
  border-bottom:     3px solid transparent
  color:             --gb-color-text-muted
  cursor:            pointer
  transition:        color 150ms ease-in-out, border-color 150ms ease-in-out

.gb-breakpoint-tabs__tab:hover
  color:             --gb-color-text
  background:        --gb-color-surface-overlay

.gb-breakpoint-tabs__tab--active
  color:             --gb-color-primary
  border-bottom-color: --gb-color-primary
  background:        --gb-color-surface

.gb-breakpoint-tabs__tab svg
  width:             16px
  height:            16px
  display:           block
```

### 6.8 Unit Input (`.gb-unit-input`)

**Intent:** A compact two-column control (number + unit selector) with a clear label and
optional help text. Reset button is a muted icon that appears on hover.

```
.gb-unit-input
  display:           flex
  flex-direction:    column
  gap:               --gb-space-1   (4px)

.gb-unit-input__header
  display:           flex
  align-items:       center
  justify-content:   space-between

.gb-unit-input__label
  font-size:         --gb-text-xs
  font-weight:       --gb-weight-medium
  color:             --gb-color-text-muted

.gb-unit-input__reset
  opacity:           0
  transition:        opacity 150ms ease-in-out

.gb-unit-input:hover .gb-unit-input__reset
  opacity:           1

.gb-unit-input__row
  display:           flex
  gap:               --gb-space-1   (4px)
  align-items:       center

.gb-unit-input__number   (contains WP NumberControl or <input type=number>)
  flex:              1

.gb-unit-input__unit   (contains WP SelectControl for unit)
  width:             56px
  flex-shrink:       0

.gb-unit-input__help
  font-size:         --gb-text-2xs   (10px)
  color:             --gb-color-text-subtle
```

### 6.9 Toggle Group Control (`.gb-toggle-group`)

**Intent:** A segmented button group for mutually exclusive choices (text align, display,
flex direction etc.). The active button uses the primary accent fill.

```
.gb-toggle-group
  display:           flex
  flex-direction:    column
  gap:               --gb-space-1   (4px)
  border:            none
  padding:           0
  margin:            0

.gb-toggle-group__legend
  font-size:         --gb-text-xs
  font-weight:       --gb-weight-medium
  color:             --gb-color-text-muted
  margin-bottom:     --gb-space-1

.gb-toggle-group__options
  display:           flex
  gap:               --gb-space-px  (1px)
  background:        --gb-color-border   (#e5e7eb)   [gap between buttons]
  border-radius:     --gb-radius-base    (4px)
  overflow:          hidden

.gb-toggle-group__btn
  flex:              1
  display:           flex
  align-items:       center
  justify-content:   center
  padding:           --gb-space-1-5 --gb-space-2   (6px 8px)
  font-size:         --gb-text-xs
  font-weight:       --gb-weight-medium
  background:        --gb-color-surface
  color:             --gb-color-text-muted
  border:            none
  cursor:            pointer
  transition:        background 150ms ease-in-out, color 150ms ease-in-out
  min-height:        28px

.gb-toggle-group__btn:hover
  background:        --gb-color-surface-overlay
  color:             --gb-color-text

.gb-toggle-group__btn.is-active
  background:        --gb-color-primary
  color:             --gb-color-text-on-primary
  font-weight:       --gb-weight-semibold

.gb-toggle-group__btn svg
  width:             14px
  height:            14px
```

### 6.10 Pattern Library (`.gb-patterns`)

**Intent:** A responsive card grid where each pattern is a card with an initial-letter
preview tile, metadata, and a copy action.

```
.gb-patterns
  padding:           --gb-space-sm  (16px)

.gb-patterns__header
  margin-bottom:     --gb-space-6   (24px)

.gb-patterns__search
  max-width:         320px
  margin-top:        --gb-space-3   (12px)

.gb-patterns__grid
  display:           grid
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
  gap:               --gb-space-md  (24px)

.gb-patterns__item
  background:        --gb-color-surface
  border:            1px solid --gb-color-border
  border-radius:     --gb-radius-lg   (8px)
  overflow:          hidden
  box-shadow:        --gb-shadow-xs
  transition:        box-shadow 150ms ease-in-out
  display:           flex
  flex-direction:    column

.gb-patterns__item:hover
  box-shadow:        --gb-shadow-sm

.gb-patterns__preview
  background:        --gb-color-primary-light   (blue-50, #eff6ff)
  height:            120px
  display:           flex
  align-items:       center
  justify-content:   center

.gb-patterns__preview-letter
  font-size:         --gb-text-4xl   (36px)
  font-weight:       --gb-weight-bold
  color:             --gb-color-primary
  line-height:       1

.gb-patterns__meta
  padding:           --gb-space-4   (16px)
  display:           flex
  flex-direction:    column
  gap:               --gb-space-2   (8px)
  flex:              1

.gb-patterns__title
  font-size:         --gb-text-sm
  font-weight:       --gb-weight-semibold
  color:             --gb-color-text

.gb-patterns__description
  font-size:         --gb-text-xs
  color:             --gb-color-text-muted
  line-height:       --gb-leading-relaxed
  margin:            0

.gb-patterns__footer
  display:           flex
  align-items:       center
  justify-content:   space-between
  flex-wrap:         wrap
  gap:               --gb-space-2
  margin-top:        auto

.gb-patterns__categories
  display:           flex
  flex-wrap:         wrap
  gap:               --gb-space-1   (4px)

.gb-patterns__tag
  display:           inline-flex
  align-items:       center
  padding:           2px --gb-space-1-5  (2px 6px)
  background:        --gb-color-surface-overlay
  border:            1px solid --gb-color-border
  border-radius:     --gb-radius-full
  font-size:         --gb-text-2xs   (10px)
  font-weight:       --gb-weight-semibold
  color:             --gb-color-text-muted
  text-transform:    uppercase
  letter-spacing:    --gb-tracking-wide

.gb-patterns__loading
  display:           flex
  align-items:       center
  gap:               --gb-space-3
  padding:           --gb-space-8   (32px) 0
  color:             --gb-color-text-muted

.gb-patterns__empty
  color:             --gb-color-text-muted
  text-align:        center
  padding:           --gb-space-8   (32px) 0
```

### 6.11 Global Styles Editor (`.gb-global-styles__tabs`)

**Intent:** Same tab-navigation treatment as admin tabs, but scoped to the Global Styles
React app. The Save button uses the primary colour.

```
.gb-global-styles
  display:           flex
  flex-direction:    column
  min-height:        400px

.gb-global-styles__header
  display:           flex
  align-items:       center
  justify-content:   space-between
  padding:           --gb-space-4 --gb-space-5   (16px 20px)
  border-bottom:     1px solid --gb-color-border
  background:        --gb-color-surface

.gb-global-styles__title
  font-size:         --gb-text-xl
  font-weight:       --gb-weight-semibold
  color:             --gb-color-text
  margin:            0

/* WP TabPanel renders .components-tab-panel__tabs and .components-tab-panel__tab-content */
/* Scope overrides under .gb-global-styles__tabs to avoid leaking into WP UI */
.gb-global-styles__tabs .components-tab-panel__tabs
  border-bottom:     1px solid --gb-color-border
  background:        --gb-color-surface

.gb-global-styles__tabs .components-tab-panel__tabs-item
  font-size:         --gb-text-sm
  font-weight:       --gb-weight-medium
  color:             --gb-color-text-muted
  border-bottom:     3px solid transparent
  transition:        color 150ms ease-in-out, border-color 150ms ease-in-out

.gb-global-styles__tabs .components-tab-panel__tabs-item:hover
  color:             --gb-color-text

.gb-global-styles__tabs .components-tab-panel__tabs-item.is-active
  color:             --gb-color-primary
  border-bottom-color: --gb-color-primary
  font-weight:       --gb-weight-semibold

.gb-global-styles__tabs .components-tab-panel__tab-content
  padding:           --gb-space-md   (24px)
```

---

## 7. Dark Mode Strategy

The token system's `@media (prefers-color-scheme: dark)` block remaps all semantic
surface, text, and border tokens. The CSS implementation can therefore be dark-mode-ready
with zero additional selectors for most components — the tokens do the work.

**One exception:** The inspector sidebar's dark treatment uses rgba-white fractions for
text on a dark background. In dark mode that background inverts to white, so those
rgba-white colours become invisible. Each inspector component CSS file must include:

```css
@media (prefers-color-scheme: dark) {
    .gb-inspector-tabs__tab { color: rgba(0,0,0,0.55); }
    .gb-inspector-tabs__tab:hover { color: rgba(0,0,0,0.85); }
    .gb-inspector-tabs__tab.is-active { color: var(--gb-color-text); }
}
```

The same pattern applies to any element that uses rgba-based colours on an
`--gb-color-surface-inverse` background.

---

## 8. CSS File Map

The implementation will touch (or create) exactly these files:

| File | What it styles |
|---|---|
| `assets/css/admin.css` | §6.1 Admin shell, §6.2 Nav tabs, §6.3 Cards, §6.4 Fields, §6.5 Notices |
| `assets/css/patterns.css` (new) | §6.10 Pattern Library |
| `assets/css/global-styles.css` (new) | §6.11 Global Styles editor |
| `src/components/controls/UnitInput.module.css` OR `assets/css/editor.css` | §6.8 Unit Input |
| `src/components/controls/ToggleGroupControl.module.css` OR `assets/css/editor.css` | §6.9 Toggle Group |
| `assets/css/inspector.css` (new) | §6.6 Inspector Tabs, §6.7 Breakpoint Tabs |

> **Preference:** Add all editor component styles to a single `assets/css/editor.css`
> that is enqueued with the block editor. This avoids per-component CSS modules which
> cannot use token custom properties without a PostCSS pipeline change.

---

## 9. What NOT to style

Per the STYLING-ONLY scope constraint:

- Block front-end output CSS (generated by CssEngine) — untouched
- Block `block.json` `editorStyle`/`style` registrations — untouched
- `save.tsx` — always returns null, no changes
- PHP render callbacks — untouched
- REST endpoints — untouched
- Any class beginning with `.components-` except scoped overrides inside a GoBlocks container
- `.wp-block-*` selectors — untouched
- ID selectors — never used
- `!important` — never used

---

## 10. Implementation Checklist (Tasks 5–6)

When CSS authoring begins (after this spec is approved):

- [ ] **Task 5a** — Rewrite `assets/css/admin.css` to implement §6.1–6.5
- [ ] **Task 5b** — Create `assets/css/patterns.css`, implement §6.10; enqueue in PHP
- [ ] **Task 5c** — Create `assets/css/global-styles.css`, implement §6.11; enqueue in PHP
- [ ] **Task 5d** — Implement settings page React UI (currently a placeholder stub)
- [ ] **Task 6a** — Create `assets/css/inspector.css`, implement §6.6–6.7; enqueue with editor
- [ ] **Task 6b** — Add `assets/css/editor.css` entries for §6.8–6.9
- [ ] **Task 7** — Run `npx tsc --noEmit`, `npx playwright test` (22/22), `composer run phpcs`, `composer run phpstan`
- [ ] **Task 8** — Update `PROGRESS.md`; mark DESIGN-SYSTEM.md as canonical

---

*Last updated: 2026-06-16*

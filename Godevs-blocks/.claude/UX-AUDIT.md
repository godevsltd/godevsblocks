# Inspector UX Audit: GoBlocks vs GenerateBlocks

_Step 2 output — 2026-06-16. Interaction patterns only; visual/color differences are in DESIGN-SYSTEM.md._

---

## Audit Method

Every GoBlocks inspector panel and control was read against the equivalent
GenerateBlocks component. Gaps are ranked by user impact: how many extra clicks
or how much cognitive load does the gap add per common editing action?

---

## Gap 1 — Breakpoint Selector: repeated per-panel vs. one sticky global (CRITICAL)

**GoBlocks behaviour:** `<BreakpointTabs />` is rendered _inside every PanelBody_
(Layout, Spacing, Sizing, Typography, Background, Border, Effects). A user editing
padding on mobile must click the breakpoint tab once inside Spacing, but if they
then open Typography they must click again inside that panel.

**GB behaviour:** `ResponsiveTabs` uses a DOM-injection trick —
`BlockInspectorControls.prepend(buttonWrapper)` — to place one sticky device
bar (Desktop / Tablet / Mobile icons) above ALL panel sections. Switching device
once switches every panel simultaneously.

**Impact:** ~3–5 extra clicks per block when styling across panels at a non-base
breakpoint. Highest-friction gap in the inspector.

**Fix path:** Move `BreakpointTabs` out of individual panels and render it once
inside the `InspectorControls` wrapper before the first `PanelBody`. Use CSS
`position: sticky; top: 0` to keep it visible while scrolling.

---

## Gap 2 — Spacing/Dimension link toggle: always 4 inputs visible vs. collapsing to 1 (HIGH)

**GoBlocks behaviour (`SpacingControl`):** `linked` state exists and routes all
onChange calls to all four sides, but all four `UnitInput` fields remain rendered
regardless of link state. The visual cue (text symbols `⊟` / `⊞`) is cryptic.

**GB behaviour (`Dimensions`):** When `sync` is true, the component renders
**only one** `UnitControl` — the other three return `null`. The link button uses
the `@wordpress/icons` `link` / `linkOff` SVG icons. It also auto-detects sync
state on mount: if all four current values are equal, it starts in linked mode.

**Impact:** Linked mode in GoBlocks looks identical to unlinked mode — users cannot
tell visually that edits are propagating to all four sides. Auto-detection of sync
state removes a manual step for most use cases (equal padding all-round is the
default design pattern).

**Fix path (two parts):**
1. When `linked === true`, render a single `UnitInput` spanning the full width
   instead of four inputs, label it with the group name ("Padding").
2. Replace `⊟` / `⊞` text characters with `@wordpress/icons` `link` / `linkOff`
   icons. Use `variant="primary"` on the button when linked (blue fill = clear
   visual feedback that all four are locked together).
3. Auto-init `linked` to `true` if all four incoming `values` props are identical.

---

## Gap 3 — UnitInput reset button: always visible vs. hidden until needed (MEDIUM)

**GoBlocks behaviour (`UnitInput`):** Reset button renders in `gb-unit-input__header`
when `resetable && hasValue`. The button is always visible when a value exists,
adding visual clutter across all inputs that have set values.

**GB behaviour:** GB hides secondary actions until the control is hovered or
focused — controls don't compete for attention.

**Impact:** Medium — when many inputs have values, the inspector fills with
small "Reset" text buttons. Not a blocking problem but adds visual noise.

**Fix path:** Already partially done in `assets/css/inspector.css` (§6.8 hover-reveal
rule via CSS opacity). Verify the CSS selector `.gb-unit-input__reset` matches the
class in the rendered DOM and that `opacity: 0` is applied at rest. No JS change needed.

---

## Gap 4 — Typography alignment icons: placeholder text vs. real SVG icons (MEDIUM)

**GoBlocks behaviour (`TypographyPanel`):** Text alignment toggle uses string
labels `⬤←`, `|⬤|`, `→⬤`, `═══`. These render as plain text in the
`ToggleGroupControl` buttons. Meaning is not immediately obvious (especially
`⬤←` for left-align).

**GB behaviour:** Uses standard WP `alignLeft`, `alignCenter`, `alignRight`,
`alignJustify` icons from `@wordpress/icons` — universally understood, accessible
with proper SVG aria labels.

**Impact:** Medium — users can figure it out but it looks unpolished and can
confuse non-technical editors on first use.

**Fix path:** In `TypographyPanel.tsx`, replace the four ALIGN_OPTIONS label
strings with `Icon` component calls:
```tsx
import { Icon, alignLeft, alignCenter, alignRight, alignJustify } from '@wordpress/icons';

const ALIGN_OPTIONS = [
    { label: <Icon icon={ alignLeft } />,    value: 'left',    ariaLabel: __('Left','goblocks') },
    { label: <Icon icon={ alignCenter } />,  value: 'center',  ariaLabel: __('Center','goblocks') },
    { label: <Icon icon={ alignRight } />,   value: 'right',   ariaLabel: __('Right','goblocks') },
    { label: <Icon icon={ alignJustify } />, value: 'justify', ariaLabel: __('Justify','goblocks') },
];
```
`ToggleGroupControl` must accept ReactNode labels — verify or adjust the control's
type signature.

---

## Gap 5 — BorderPanel activeSide dead code / linked-but-showing-all-sides (MEDIUM)

**GoBlocks behaviour (`BorderPanel`):** `linkedBorder` state exists, but:
- `const activeSide: Side = linkedBorder ? 'Top' : 'Top';` is hardcoded to `'Top'`
  regardless of link state — this variable is computed but likely not used correctly.
- All four border sides (Top, Right, Bottom, Left) are always rendered, even when
  `linkedBorder === true` (same issue as Gap 2 for spacing).

**Impact:** Same as Gap 2 for border: linked mode is invisible to the user.
Also, the `activeSide` dead code is a latent bug — if it was intended to drive
which side is visible/active when unlinked, it's not functional.

**Fix path:**
1. Apply the same linked-collapse pattern as Gap 2 fix: when `linkedBorder === true`,
   render one Width + Style + Color set with all-sides label.
2. Remove or fix the `activeSide` variable — either implement per-side tab switching
   or delete it.

---

## Gap 6 — No inline "inheriting from" breakpoint indicator (LOW)

**GoBlocks behaviour:** When a `UnitInput` at a non-base breakpoint has no set
value, it shows `inheritedValue` as a greyed placeholder (correct). But there is
no label telling the user _which_ breakpoint the inherited value comes from.

**GB behaviour:** GB shows the inheriting breakpoint name next to the placeholder
(e.g., "from Tablet") so users know exactly where to go to change the base value.

**Impact:** Low — the placeholder does communicate that a value is inherited, but
hunting which panel / breakpoint sourced it adds friction when debugging cascades.

**Fix path:** Pass a `inheritedFrom?: string` prop through `useResponsiveStyles`
(it knows which breakpoint the cascaded value came from) down to `UnitInput`, and
render it as a small label beside the placeholder when set. This requires a minor
`useResponsiveStyles` hook change to expose the source breakpoint key.

---

## Gap 7 — EffectsPanel transform/transition: free-text inputs vs. targeted controls (LOW)

**GoBlocks behaviour (`EffectsPanel`):** Transform and Transition render as plain
`TextControl` with a hint placeholder (`translateY(-2px) rotate(3deg)`). This
requires CSS knowledge to use.

**GB behaviour:** GB breaks transforms into discrete inputs (translate X/Y, rotate,
scale) with unit selectors, then assembles the `transform` shorthand internally.

**Impact:** Low for power users; high for non-technical editors. Out of scope for
this pass (requires new multi-field sub-controls), but document for Phase 4.

**Fix path (deferred):** Create a `TransformControl` composed of four `UnitInput`
rows (Translate X, Translate Y, Rotate, Scale) that assembles the CSS shorthand
on change. Flag when planning Phase 4 editor UX work.

---

## Summary Table

| # | Gap | Impact | Fix Complexity |
|---|---|---|---|
| 1 | Breakpoint selector: repeated per-panel | Critical | Medium — move `<BreakpointTabs />` to top-level |
| 2 | Spacing/dimension link collapse | High | Low — conditional render + icon swap |
| 3 | UnitInput reset always visible | Medium | None — CSS fix already in inspector.css; verify selector |
| 4 | Typography align icons: text vs SVG | Medium | Low — import WP icons, swap labels |
| 5 | BorderPanel linked collapse + dead activeSide | Medium | Low — same pattern as Gap 2 |
| 6 | No "inherited from breakpoint X" label | Low | Medium — hook change + prop threading |
| 7 | Effects transform: free-text vs discrete | Low | High — new control; defer to Phase 4 |

**Recommendation for Step 4 scope:** Fix gaps 1, 2, 4, and 5 in a single pass —
they are high-impact and low-complexity. Gap 3 is already handled by CSS.
Gaps 6 and 7 defer to Phase 4.

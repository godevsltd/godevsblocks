# GoBlocks — Full Plugin Audit & Implementation Plan
**Date:** 2026-06-17  
**Scope:** Complete codebase audit, gap analysis vs GenerateBlocks, production code implementation

---

## 1. Current Architecture (What Exists)

### Blocks (16 total)
| Block | CSS Panels | Dynamic | Status |
|---|---|---|---|
| Box | Layout + Sizing + Spacing + Typography + Background + Border + Effects | ✓ | Complete |
| Grid | GridPanel + Sizing + Spacing + Background + Border + Effects | ✓ | Complete |
| Heading | Typography + Sizing + Spacing + Background + Border + Effects | ✓ | Missing LayoutPanel |
| Text | Typography + Sizing + Spacing + Background + Border + Effects | ✓ | Need to verify |
| Button | Typography + Sizing + Spacing + Background + Border + Effects | ✓ | Complete |
| Image | Sizing + Spacing + Background + Border + Effects | ✓ | Complete |
| Icon | Effects | ✓ | Limited panels |
| Shape | Custom | ✓ | Complete |
| Accordion | Effects | ✓ | Missing structural CSS |
| Accordion Item | Effects | ✓ | Missing structural CSS |
| Tabs | Effects | ✓ | Missing structural CSS |
| Tab Panel | Effects | ✓ | Missing structural CSS |
| Query | Special | ✓ | Complete |
| Query Loop | None | ✓ | By design |
| Pagination | Spacing + Typography | ✓ | Complete |
| Query No Results | None | ✓ | By design |

### CSS Engine Pipeline (src/utils/css/)
- StyleNormalizer → RuleBuilder → PseudoBuilder → MediaQueryWrapper → CssSerializer → Minifier
- **Supports:** 80 CSS properties, 6 breakpoints, 5 pseudo-states (hover/focus/active/::before/::after)
- **Data model:** `styles.{category}.{property} = { base: 'value', hover: 'value', md: 'value' }`

### Inspector Panels (7 shared)
1. **LayoutPanel** — display, flex controls, overflow, position, z-index
2. **SizingPanel** — width, height, min/max, aspect-ratio
3. **SpacingPanel** — padding, margin, gap
4. **TypographyPanel** — font, size, weight, line-height, tracking, align, transform, decoration, style, color
5. **BackgroundPanel** — bg color, gradient, bg-size, bg-repeat, overlay
6. **BorderPanel** — border per-side + border-radius per-corner
7. **EffectsPanel** — opacity, box-shadow, transform (raw text), transition (raw text), filter (raw text), cursor

### Dynamic Control Flow
1. User changes a control → `useResponsiveStyles.setStyle(category, property, value)` 
2. → `deepMerge(attributes.styles, patch)` → `setAttributes({ styles })`
3. → Block re-renders → `useCssEngine` fires (100ms debounce)
4. → `buildBlockCss(styles, blockSlug, uniqueId)` → CSS string
5. → `<style data-gb-id>` injected into editor iframe (findBlockOwnerDoc fixed)
6. → `setAttributes({ generatedCss: css })` persisted to WP block attributes
7. On save → PHP collects `generatedCss` → CSS cache file → frontend

---

## 2. Bugs Found

### Bug 1 — CRITICAL: Gradient CSS never generated (RuleBuilder.ts)
**File:** `src/utils/css/RuleBuilder.ts` line 46–63

```typescript
const SKIP_PROPERTIES = new Set(['overlayColor', 'overlayOpacity', 'gradient']);
```

`gradient` is in SKIP_PROPERTIES → the inner loop `continue`s for it → no CSS ever generated for `GradientControl`.  
The `PROPERTY_ALIAS` entry `gradient → 'background-image'` is dead code.  
**Result:** GradientControl in BackgroundPanel silently fails — the gradient value is stored in attributes but never becomes CSS.

**Fix:** Remove `gradient` from SKIP_PROPERTIES. The existing PROPERTY_ALIAS will then correctly map `gradient → background-image`.

### Bug 2 — MEDIUM: StyleNormalizer rejects valid CSS single quotes
**File:** `src/utils/css/StyleNormalizer.ts` line 52

```typescript
const REJECT_PATTERN = /[<>"']/;
```

Single quotes `'` are rejected by `isValidCssValue()`.  
This blocks:
- Background image URLs in `url('...')` format
- Font family names like `'Open Sans'`
- Any CSS string value that uses single quotes

**Fix:** Remove `'` from REJECT_PATTERN. Keep `<>"` for real injection prevention.

### Bug 3 — MINOR: Animation CSS classes defined but keyframes not shipped
**File:** `src/blocks/box/components/Inspector.tsx` line 58–65

Box block exposes `gb-anim-fade-in`, `gb-anim-slide-up`, `gb-anim-slide-left`, `gb-anim-slide-right`, `gb-anim-zoom-in` as animationClass options but no CSS keyframes exist in any shipped CSS file. The classes are dead.

**Fix:** Add keyframe animations to `assets/css/blocks.css`.

---

## 3. Gap Analysis vs GenerateBlocks

### What GenerateBlocks has that GoBlocks is missing:

| Feature | GenerateBlocks | GoBlocks | Priority |
|---|---|---|---|
| Hover state controls in panels | ✓ (every panel has Normal/Hover toggle) | ✗ (no hover UI, engine supports it) | **P0** |
| Text shadow control | ✓ | ✗ | P1 |
| Background image picker (media library) | ✓ | ✗ | P1 |
| Background position control | ✓ | ✗ | P1 |
| LayoutPanel on Heading block | ✓ | ✗ | P1 |
| Transform builder (structured) | ✓ | ✗ (raw text only) | P2 |
| Transition builder (structured) | ✓ | ✗ (raw text only) | P2 |
| Typography text-shadow | ✓ | ✗ | P2 |
| Grid column span for items inside grid | ✓ (via Box "Column Span") | ✗ | P2 |
| Responsive visibility (hide at breakpoints) | ✓ | ✗ | P3 |
| Background attachment (parallax) | ✓ | ✗ | P3 |
| Tabs/Accordion structural CSS | ✓ | ✗ (no base CSS) | P0 |

### What GoBlocks has that matches/exceeds GenerateBlocks:
- ✓ PSR-4 PHP architecture with proper abstract BlockBase
- ✓ All 80 CSS properties across 6 breakpoints (GB has fewer)
- ✓ Cleaner CSS pipeline (single TypeScript engine)
- ✓ Better query system (full WP_Query attribute support)
- ✓ Dynamic content tag system (GB Pro only)
- ✓ Pattern library with 8 production patterns
- ✓ SVG icon library (250+ Tabler icons)
- ✓ Shape divider block
- ✓ Accordion + Tabs with accessibility support

---

## 4. Implementation Plan (This Session)

### Phase 1 — Critical Bug Fixes
- [x] Fix gradient SKIP_PROPERTIES bug (RuleBuilder.ts)
- [x] Fix REJECT_PATTERN single-quote bug (StyleNormalizer.ts)
- [x] Add animation keyframes CSS (blocks.css)

### Phase 2 — Hover State Controls
- [x] Add `getStyleState()` / `setStyleState()` to `useResponsiveStyles` hook
- [x] Add hover controls to BackgroundPanel (bg color hover)
- [x] Add hover controls to EffectsPanel (opacity, shadow, transform on hover)
- [x] Add hover color to TypographyPanel

### Phase 3 — Missing Controls
- [x] Add `textShadow` to TypographyStyles + TypographyPanel
- [x] Add background image picker to BackgroundPanel (MediaUpload)
- [x] Add background-position control to BackgroundPanel
- [x] Add LayoutPanel to Heading Inspector

### Phase 4 — Build & ZIP
- [x] `npm run build`
- [x] `node bin/make-zip.js`

---

## 5. Hover State Architecture

The CSS engine already supports pseudo-states via `ResponsiveValue`:
```typescript
// styles.background.backgroundColor can be:
{ base: '#fff', hover: '#f5f5ff' }
// → generates:
// .gb-box-abc { background-color: #fff; }
// .gb-box-abc:hover { background-color: #f5f5ff; }
```

We add `getStyleState(category, property, pseudo)` and `setStyleState()` to `useResponsiveStyles` so panels can read/write pseudo-state values directly without going through the breakpoint system.

Panel implementation pattern:
```tsx
// In BackgroundPanel:
const hoverBg = getStyleState('background', 'backgroundColor', 'hover');
<ColorControl
  label={__('Hover background', 'goblocks')}
  value={hoverBg}
  onChange={(v) => setStyleState('background', 'backgroundColor', 'hover', v)}
/>
```

---

## 6. Files Changed

| File | Change |
|---|---|
| `src/utils/css/RuleBuilder.ts` | Remove `gradient` from SKIP_PROPERTIES |
| `src/utils/css/StyleNormalizer.ts` | Remove `'` from REJECT_PATTERN |
| `src/types/styles.ts` | Add `textShadow` to TypographyStyles |
| `src/hooks/useResponsiveStyles.ts` | Add `getStyleState` / `setStyleState` |
| `src/components/panels/TypographyPanel.tsx` | Add textShadow + hover color |
| `src/components/panels/BackgroundPanel.tsx` | Add hover bg + image picker + bg-position |
| `src/components/panels/EffectsPanel.tsx` | Add hover state section |
| `src/blocks/heading/components/Inspector.tsx` | Add LayoutPanel |
| `assets/css/blocks.css` | Add animation keyframes + structural CSS |

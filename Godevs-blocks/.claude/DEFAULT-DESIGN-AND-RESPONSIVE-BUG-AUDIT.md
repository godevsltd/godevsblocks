# GoBlocks — Default Design & Responsive Bug Audit

> **Status**: Task 3 — STOP. Present to user before any code is written.
> Written: 2026-06-17

---

## Part A — Breakpoint Panel Bug Audit (Task 2)

### What the user reports
- Values don't change when switching breakpoints
- Values write to wrong breakpoint
- Inherited-vs-overridden state is not shown

### Root cause analysis

#### BUG 1 — Stale-closure clobber on multi-write (CRITICAL)

**File**: `src/hooks/useResponsiveStyles.ts` → `setStyle`
```typescript
// Each call captures `styles` from the closure at creation time.
// When called 4× synchronously (linked mode), all 4 calls use the SAME
// stale `styles`. deepMerge(staleStyles, patch) for each call produces an
// independent result — only the LAST setAttributes survives in the Redux store.
const setStyle = useCallback(
    (category, property, value) => {
        const patch = { [category]: { [property]: { [activeBreakpoint]: value } } };
        setAttributes({ styles: deepMerge(styles, patch) }); // ← `styles` is stale
    },
    [styles, setAttributes, activeBreakpoint]
);
```

**Where it fires:**

1. `SpacingControl.tsx` (linked padding) — `handleChange` calls `onChange` 4 times:
   ```typescript
   onChange('top', value);    // → setStyle → deepMerge(staleStyles, paddingTop patch)
   onChange('right', value);  // → setStyle → deepMerge(staleStyles, paddingRight patch)  ← stale
   onChange('bottom', value); // → setStyle → deepMerge(staleStyles, paddingBottom patch) ← stale
   onChange('left', value);   // → setStyle → deepMerge(staleStyles, paddingLeft patch)   ← stale
   ```
   **Visible result**: User types `20px` into the linked padding input. After React settles,
   only `paddingLeft` (or whichever Redux reducer sees last) persists in the attribute.
   The other three sides are dropped.

2. `BorderPanel.tsx` (linked border) — `setBorder(side, prop)` is called per-side for Width,
   Style, Color via the same pattern. When `linkedBorder = true`, 3 separate `setStyle` calls
   using stale `styles` → only last survives.

**Fix required:**
Add `setStyleBatch(category, updates: Record<string, string>)` to `useResponsiveStyles`
that builds ONE patch for all properties and makes a single `setAttributes` call.

```typescript
// Proposed new method:
const setStyleBatch = useCallback(
    (category: StyleCategory, updates: Record<string, string>) => {
        const categoryPatch = Object.fromEntries(
            Object.entries(updates).map(([prop, val]) => [
                prop, { [activeBreakpoint]: val }
            ])
        );
        const patch: BlockStyles = { [category]: categoryPatch };
        setAttributes({ styles: deepMerge(styles, patch) });
    },
    [styles, setAttributes, activeBreakpoint]
);
```

Then update:
- `SpacingControl.tsx`: add `onChangeAll?: (value: string) => void` prop; call it instead of 4 `onChange()` calls when linked.
- `SpacingPanel.tsx`: implement `onChangeAll` using `setStyleBatch`.
- `BorderPanel.tsx`: replace 3 linked `setStyle` calls with one `setStyleBatch`.

**Files affected**: `src/hooks/useResponsiveStyles.ts`, `src/components/controls/SpacingControl.tsx`, `src/components/panels/SpacingPanel.tsx`, `src/components/panels/BorderPanel.tsx`

---

#### BUG 2 — BorderPanel.linkedBorder never resets on breakpoint switch (MODERATE)

**File**: `src/components/panels/BorderPanel.tsx`

```typescript
// These are initialised once and never synced to breakpoint changes:
const [ linkedBorder, setLinkedBorder ] = useState( true );
const [ linkedRadius, setLinkedRadius ] = useState( true );
```

`SpacingControl` has a `useEffect` that calls `allSidesEqual(values)` whenever
`values.top/right/bottom/left` change. `BorderPanel` has no equivalent.

**Visible result**: User sets uniform border at `base` (`linkedBorder = true`). Switches to
`md`. `linkedBorder` is still `true`. When they try to set only `borderTopWidth` at `md`,
all 4 borders get set instead.

**Fix required:** Add a `useEffect` that checks whether all sides currently have the same
border value at the active breakpoint; if not, set `linkedBorder = false`.

**Files affected**: `src/components/panels/BorderPanel.tsx`

---

#### BUG 3 — No visual indicator for breakpoint-overridden properties (MODERATE UX)

**File**: `src/components/controls/UnitInput.tsx`

The `inheritedValue` placeholder mechanism works correctly — when no value is set at the
current breakpoint, the inherited value appears greyed-out in the input. However:

- There is no positive indicator (dot, badge, coloured border) when a value IS explicitly
  set at the current breakpoint.
- Users cannot tell which properties have breakpoint overrides set.
- `SelectControl`, `ToggleGroupControl`, `ColorControl` have no inherited-value mechanism at all.

**Fix required:**
- `UnitInput`: when `hasValue = true` (value is set at active breakpoint), add a small
  coloured dot next to the label using the `--gb-color-active` token.
- `ColorControl`: add an `inheritedValue` color swatch shown when no active-breakpoint value.
- `ToggleGroupControl` / `SelectControl`: outside scope of this task (low priority).

**Files affected**: `src/components/controls/UnitInput.tsx`, `assets/css/inspector.css`

---

#### Read path: ✅ CORRECT (no bugs)

The following are all correct and do not need changes:

| Code path | Status |
|---|---|
| `useBreakpoint.ts` → `useActiveBreakpoint()` | ✅ Zustand selector, reactive on `setActive()` |
| `breakpointStore.ts` → `setActive()` | ✅ Zustand mutation, triggers re-renders |
| `BreakpointTabs.tsx` → `setActive()` | ✅ Correctly calls store |
| `useResponsiveStyles.getStyle()` | ✅ Reads at `activeBreakpoint`; recreated on BP change |
| `useResponsiveStyles.getInheritedValue()` | ✅ Walks chain `[base, xs, ..., active]` reversed |
| `useResponsiveStyles.setStyle()` | ✅ Writes to `[activeBreakpoint]` key — **correct for single writes** |
| `deepMerge()` | ✅ Correctly merges at all levels; preserves sibling breakpoints |
| `UnitInput.useEffect([value])` | ✅ Clears local state when `value` prop changes |
| `SpacingControl.useEffect(values.*)` | ✅ Resets `linked` when breakpoint values change |
| `RuleBuilder.ts` → `byBreakpoint` | ✅ Routes xs/sm/.../2xl to `@media` wrappers |
| `InspectorTabs` → `BreakpointTabs` position | ✅ Above all panels; switching works globally |

---

### Summary: Files to change for Task 4

| File | Change needed |
|---|---|
| `src/hooks/useResponsiveStyles.ts` | Add `setStyleBatch()` method + type |
| `src/components/controls/SpacingControl.tsx` | Add `onChangeAll` prop; use in linked mode |
| `src/components/panels/SpacingPanel.tsx` | Implement `onChangeAll` using `setStyleBatch` |
| `src/components/panels/BorderPanel.tsx` | Use `setStyleBatch` for linked writes; add BP-switch `useEffect` |
| `src/components/controls/UnitInput.tsx` | Add override indicator dot when `hasValue` |
| `assets/css/inspector.css` | Style for override indicator dot |

---

---

## Part B — Default Block Design Audit (Task 1)

### GenerateBlocks vs. GoBlocks design philosophy gap

GenerateBlocks deliberately ships **empty defaults** on all blocks — it is a layout framework
that defers styling to the theme/developer. GoBlocks aims to be a **design system** that
looks good immediately. The competitive advantage is: insert a block, it looks professional
with zero configuration.

Current GoBlocks block.json: all blocks have `"styles": { "type": "object", "default": {} }`
→ no inspector values pre-set → blocks look unstyled in the editor.

`blocks.css` exists and provides a CSS-class baseline (button gradient, heading margin: 0,
etc.), but this is invisible in the inspector and can feel like "magic" that users don't
understand. Attribute defaults give users visible, editable starting values.

---

### Per-block default value table

#### 1. Box (`goblocks/box`)

| Category | Property | Proposed default | Rationale |
|---|---|---|---|
| `sizing` | `maxWidth` | `1240px` | A "section" container should constrain width |
| `spacing` | `paddingTop` | `60px` | Comfortable section breathing room |
| `spacing` | `paddingRight` | `24px` | Horizontal gutters |
| `spacing` | `paddingBottom` | `60px` | Match top |
| `spacing` | `paddingLeft` | `24px` | Match right |

> Box is used as the top-level section container. With no padding/max-width it looks like
> a raw div. A 1240px constraint + 60px vertical padding is "hero section ready" from
> insertion without any configuration.

---

#### 2. Grid (`goblocks/grid`)

| Category | Property | Proposed default | Rationale |
|---|---|---|---|
| `layout` | `display` | `grid` | Grid layout is the point of the block |
| `layout` | `gridTemplateColumns` | `repeat(3,1fr)` | 3-column grid is the most common starting point |
| `spacing` | `columnGap` | `24px` | Standard 1.5rem gutter |
| `spacing` | `rowGap` | `24px` | Match column gap |

> Without these, the grid block is an unstyled `<div>` wrapping children. A 3-col layout
> with 24px gap looks professional immediately.

---

#### 3. Heading (`goblocks/heading`)

| Category | Property | Proposed default | Rationale |
|---|---|---|---|
| `typography` | `lineHeight` | `1.2` | Tight for headings |
| `typography` | `letterSpacing` | `-0.02em` | Modern optical tightening |

> Note: Don't default `fontWeight` — theme h-tags typically already have bold weight.
> Don't default `fontSize` — it should inherit from theme for accessibility / design token
> alignment. Only add what makes headings look sharper without overriding theme.

---

#### 4. Text (`goblocks/text`)

| Category | Property | Proposed default | Rationale |
|---|---|---|---|
| `typography` | `lineHeight` | `1.75` | Readability standard for body copy |

> One property. Anything more overrides the theme body font and creates specificity
> confusion.

---

#### 5. Button (`goblocks/button`)

| Category | Property | Proposed default | Rationale |
|---|---|---|---|
| `spacing` | `paddingTop` | `0.625rem` | Matches blocks.css |
| `spacing` | `paddingRight` | `1.5rem` | Matches blocks.css |
| `spacing` | `paddingBottom` | `0.625rem` | Matches blocks.css |
| `spacing` | `paddingLeft` | `1.5rem` | Matches blocks.css |
| `background` | `backgroundColor` | `#4f46e5` | Indigo — will be overridden by gradient in blocks.css |
| `typography` | `color` | `#ffffff` | White text on indigo |
| `typography` | `fontWeight` | `600` | SemiBold CTA text |
| `border` | `borderTopLeftRadius` | `8px` | Matches blocks.css |
| `border` | `borderTopRightRadius` | `8px` | Matches blocks.css |
| `border` | `borderBottomRightRadius` | `8px` | Matches blocks.css |
| `border` | `borderBottomLeftRadius` | `8px` | Matches blocks.css |

> The button is the highest-impact block for first-impression quality. Pre-populate to match
> the blocks.css gradient-button appearance so the inspector reflects what users see.

---

#### 6. Image (`goblocks/image`)

| Category | Property | Proposed default | Rationale |
|---|---|---|---|
| `sizing` | `maxWidth` | `100%` | Responsive by default |

> `blocks.css` already adds `max-width: 100%; height: auto;` to `.gb-image img`. No
> attribute default needed beyond confirming responsive sizing is visible in inspector.

---

#### 7. Icon (`goblocks/icon`)

| Category | Property | Proposed default | Rationale |
|---|---|---|---|
| `sizing` | `width` | `48px` | Sensible icon size |
| `sizing` | `height` | `48px` | Square icon |

---

#### 8. Shape (`goblocks/shape`)

No attribute defaults proposed. Shape is decorative and fully custom per use.

---

#### 9. Accordion (`goblocks/accordion`)

No attribute defaults proposed. `blocks.css` provides full structural styles (border,
padding, chevron). The block looks correct immediately via CSS.

---

#### 10. Tabs (`goblocks/tabs`)

No attribute defaults proposed. `blocks.css` provides full structural styles. Works
correctly out of the box.

---

#### 11. Query (`goblocks/query`)

No attribute defaults proposed. This is a data-layer block — layout depends on
inner blocks.

---

### blocks.css gaps to fix (alongside attribute defaults)

| Block | Gap | Fix |
|---|---|---|
| `.gb-box` | No visual defaults beyond box-sizing | No change needed — padding comes from attribute defaults (generated CSS) |
| `.gb-grid` | No layout properties | Add `display: grid` to `.gb-grid` as a base — but attribute default overrides safely |
| `.gb-icon` | No default size | Add `width: 48px; height: 48px;` as base |
| `.gb-shape` | No base style | No change needed |

---

### How attribute defaults are implemented (implementation note for Task 5)

Each block's `block.json` `"styles"` attribute default must be set as a proper
`ResponsiveValue` object:
```json
"styles": {
    "type": "object",
    "default": {
        "spacing": {
            "paddingTop":    { "base": "60px" },
            "paddingRight":  { "base": "24px" },
            "paddingBottom": { "base": "60px" },
            "paddingLeft":   { "base": "24px" }
        },
        "sizing": {
            "maxWidth": { "base": "1240px" }
        }
    }
}
```

**Important**: Only set a default for a property if:
1. It is visible and meaningful in the inspector (not just CSS-class-level)
2. The user would most likely want it pre-set (not confused by it being there)
3. The value matches what `blocks.css` already applies (no visual flash/mismatch)

The `generatedCss` attribute will auto-populate from these defaults on first render
(via `useCssEngine` hook).

---

## Summary: Implementation Plan

### Task 4 — Fix Responsive Panel Bug

**Scope**: 6 files, bug fixes only (no new features)

| # | Action | File |
|---|---|---|
| 4a | Add `setStyleBatch()` + type to hook | `useResponsiveStyles.ts` |
| 4b | Add `onChangeAll?: (v: string) => void` to SpacingControl | `SpacingControl.tsx` |
| 4c | Implement `onChangeAll` via `setStyleBatch` | `SpacingPanel.tsx` |
| 4d | Replace multi-`setStyle` pattern with `setStyleBatch` | `BorderPanel.tsx` |
| 4e | Add `useEffect` to reset `linkedBorder` on BP switch | `BorderPanel.tsx` |
| 4f | Add override-indicator dot when `hasValue` | `UnitInput.tsx` |
| 4g | Style the dot | `inspector.css` |

### Task 5 — Default Block Design

**Scope**: 7 block.json files + 1 blocks.css addition

| Block | Change |
|---|---|
| `box/block.json` | Add spacing/sizing defaults |
| `grid/block.json` | Add layout/spacing defaults |
| `heading/block.json` | Add typography defaults |
| `text/block.json` | Add lineHeight default |
| `button/block.json` | Add spacing/color/radius defaults |
| `image/block.json` | Add maxWidth default |
| `icon/block.json` | Add sizing defaults |
| `blocks.css` | Add `.gb-icon { width: 48px; height: 48px; }`, `.gb-grid { display: grid; }` |

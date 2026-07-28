# GoBlocks — Universal Control Framework

## Component Hierarchy

```
InspectorControls (WP core)
└── GbInspectorLayout
    ├── <StylesTab>
    │   ├── <LayoutPanel>        display, flex, grid, position, z-index
    │   ├── <SizingPanel>        width, height, min/max
    │   ├── <SpacingPanel>       padding, margin, gap
    │   ├── <TypographyPanel>    font, size, weight, align, transform
    │   ├── <BackgroundPanel>    color, gradient, image, overlay
    │   ├── <BorderPanel>        width, style, color, radius
    │   └── <EffectsPanel>       shadow, opacity, transform, transition
    ├── <AdvancedTab>
    │   ├── <HtmlAttributesControl>
    │   ├── <CssClassControl>    globalClasses array
    │   └── <CustomCssControl>   raw CSS appended to generatedCss
    └── <DynamicContentTab>      block-specific — added by blocks that support it
```

Every panel is wrapped in a `<BreakpointBar>` that shows the device selector and
sets `activeBreakpoint` in Zustand. All child controls read/write only the active
breakpoint key via `useResponsiveStyles()`.

## Prop Contract for ALL Controls

```typescript
interface ControlProps<T = string> {
  // Required
  value:      ResponsiveValue | T;   // current value for active breakpoint
  onChange:   (value: T) => void;    // called with the new value (NOT the full ResponsiveValue)

  // Display
  label:      string;
  help?:      string;

  // Behaviour
  breakpoint:    Breakpoint;          // active device from BreakpointStore
  inheritedValue?: string;           // value from a smaller breakpoint (shown as placeholder)
  resetable?:  boolean;              // default true — shows reset button
  disabled?:   boolean;

  // Token suggestions
  tokenOptions?: Array<{ label: string; value: string; preview?: string }>;
}
```

## Control Directory (src/components/controls/)

### BreakpointTabs
Shows device icons (xs/sm/md/lg/xl/2xl).
Sets `breakpointStore.active` on click.
Wraps any group of controls that are responsive.
No `onChange` — it manages Zustand store directly.

### UnitInput
Single value + unit selector.
Units: `px | rem | em | % | vw | vh | svh | dvh | auto | none | inherit`
Default unit configurable per property (px for spacing, rem for type).
Shows token picker popover on focus.

### SpacingControl
Four-side dimension inputs (top/right/bottom/left).
Link/unlink all sides toggle.
Uses UnitInput internally for each cell.

### ColorControl
Components: ColorPicker (spectrum) + HexInput + RgbInput + EyeDropper + TokenPicker.
Token groups: Plugin palette (--gb-color-*) | Theme palette | Recent colors.
Passes CSS color string or `var(--gb-color-*)` as value.

### TypographyControl
Aggregates: FontFamilyControl + FontSizeControl + FontWeightControl +
LineHeightControl + LetterSpacingControl + TextAlignControl +
TextTransformControl + TextDecorationControl.

### BorderControl
Unified or per-side mode toggle.
Width (UnitInput) + Style (select) + Color (ColorControl) per side.
Radius: unified or per-corner (4 UnitInputs).

### ShadowControl
List of shadow layers (add/remove/reorder).
Per layer: x, y, blur, spread (UnitInput), color (ColorControl), inset (toggle).

### GradientControl
Visual gradient builder: type (linear/radial/conic) + angle + color stops.
Returns CSS gradient string.

### FlexControl
Direction (4-way toggle) + Wrap + Justify + Align + Gap.
Only visible when display = flex | inline-flex.

### GridControl
Columns (preset + custom template) + Rows + Gap + AutoFlow.
Only visible when display = grid | inline-grid.

### ToggleGroupControl
Segmented button group for enum values (display, text-align, etc.).
Icons or text labels.

### RangeControl
Slider + number input. Min/max/step configurable per use.
Unit selector optional.

## Panel: LayoutPanel

```
Display:  [Block] [Inline] [Inline-Block] [Flex] [Grid] [None]
  ↓ if Flex: <FlexControl>
  ↓ if Grid: <GridControl>

Position: [Static] [Relative] [Absolute] [Fixed] [Sticky]
  ↓ if not Static: Top / Right / Bottom / Left (UnitInput × 4)

Z-Index:  UnitInput (no unit, integer) OR token picker
Overflow: [Visible] [Hidden] [Auto] [Scroll]
```

## Panel: SpacingPanel

```
<BreakpointBar>
Padding:  <SpacingControl property="padding" />
Margin:   <SpacingControl property="margin" />
Gap:      <SpacingControl property="gap" twoAxis />
```

## Panel: TypographyPanel

```
<BreakpointBar>
Font Family:     <FontFamilyControl />       (system + Google Fonts search)
Font Size:       <UnitInput /> + token picker (2xs → 9xl)
Font Weight:     <ToggleGroupControl />       (100–900 increments)
Line Height:     <UnitInput />               (unitless or px/em)
Letter Spacing:  <UnitInput />               (em)
Text Align:      <ToggleGroupControl />       (left/center/right/justify)
Text Transform:  <ToggleGroupControl />       (none/uppercase/lowercase/capitalize)
Text Decoration: <ToggleGroupControl />       (none/underline/line-through)
Color:           <ColorControl />
```

## Breakpoint Inheritance Display

When a control's active-breakpoint value is undefined:
- Input shows inherited value as placeholder text (greyed)
- A small device icon badge indicates where the value comes from
- Reset button is disabled (nothing to reset)

When value IS explicitly set at active breakpoint:
- Input shows the value normally
- Reset button clears that breakpoint key

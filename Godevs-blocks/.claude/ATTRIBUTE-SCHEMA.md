# GoBlocks — Block Attribute Schema Reference

## Core Principle

All style-related values live inside one `styles` object attribute.
Each property value is a **ResponsiveValue** object — not a flat scalar.

## ResponsiveValue Interface

```typescript
interface ResponsiveValue {
  base:    string    // required — mobile-first default
  sm?:     string    // 640px+
  md?:     string    // 768px+
  lg?:     string    // 1024px+
  xl?:     string    // 1280px+
  '2xl'?:  string    // 1536px+
  hover?:  string    // :hover state
  focus?:  string    // :focus state
  active?: string    // :active state
  before?: string    // ::before pseudo-element
  after?:  string    // ::after pseudo-element
}
```

**Resolution order (cascade):** `active breakpoint → lg → md → sm → base`
If a breakpoint key is absent, the value is inherited from a smaller breakpoint.
The CSS engine only emits `@media` rules for keys that are explicitly set.

## Universal block.json Attribute Declaration

```json
{
  "attributes": {
    "uniqueId":       { "type": "string",  "default": "" },
    "tagName":        { "type": "string",  "default": "div" },
    "styles":         { "type": "object",  "default": {} },
    "globalClasses":  { "type": "array",   "items": { "type": "string" }, "default": [] },
    "htmlAttributes": { "type": "object",  "default": {} },
    "dynamicContent": { "type": "object",  "default": {} },
    "generatedCss":   { "type": "string",  "default": "" },
    "blockVersion":   { "type": "integer", "default": 1 }
  }
}
```

`generatedCss` is written by the CSS engine on each attribute change and collected by PHP on save. PHP never re-generates CSS from `styles` — only from `generatedCss`.

## Style Categories

### 1. Spacing

```javascript
styles: {
  spacing: {
    paddingTop:    { base: "20px", md: "12px", sm: "8px" },
    paddingRight:  { base: "16px", md: "10px" },
    paddingBottom: { base: "20px", md: "12px", sm: "8px" },
    paddingLeft:   { base: "16px", md: "10px" },
    marginTop:     { base: "0px" },
    marginRight:   { base: "auto" },
    marginBottom:  { base: "32px", md: "24px" },
    marginLeft:    { base: "auto" },
    gap:           { base: "24px", md: "16px", sm: "12px" },
    columnGap:     { base: "24px" },
    rowGap:        { base: "24px" },
  }
}
```

### 2. Typography

```javascript
styles: {
  typography: {
    fontFamily:     { base: "var(--gb-font-sans)" },
    fontSize:       { base: "1rem", md: "0.875rem" },
    fontWeight:     { base: "400" },
    lineHeight:     { base: "1.5" },
    letterSpacing:  { base: "0em" },
    textTransform:  { base: "none" },
    textDecoration: { base: "none" },
    textAlign:      { base: "left", md: "center" },
    color:          { base: "var(--gb-color-text)", hover: "var(--gb-color-primary)" },
    fontStyle:      { base: "normal" },
  }
}
```

### 3. Layout

```javascript
styles: {
  layout: {
    display:         { base: "flex", md: "block" },
    flexDirection:   { base: "row", md: "column" },
    flexWrap:        { base: "wrap" },
    alignItems:      { base: "center" },
    justifyContent:  { base: "flex-start" },
    alignContent:    { base: "normal" },
    flexGrow:        { base: "0" },
    flexShrink:      { base: "1" },
    flexBasis:       { base: "auto" },
    gridTemplateColumns: { base: "repeat(3, 1fr)", md: "repeat(2, 1fr)", sm: "1fr" },
    gridTemplateRows:    { base: "auto" },
    gridColumn:      { base: "span 1" },
    gridRow:         { base: "span 1" },
    overflow:        { base: "visible" },
  }
}
```

### 4. Sizing

```javascript
styles: {
  sizing: {
    width:     { base: "100%" },
    minWidth:  { base: "0px" },
    maxWidth:  { base: "var(--gb-container-site)" },
    height:    { base: "auto" },
    minHeight: { base: "0px" },
    maxHeight: { base: "none" },
    aspectRatio: { base: "auto" },
  }
}
```

### 5. Border

```javascript
styles: {
  border: {
    borderTopWidth:      { base: "0px" },
    borderTopStyle:      { base: "solid" },
    borderTopColor:      { base: "transparent" },
    borderRightWidth:    { base: "0px" },
    borderRightStyle:    { base: "solid" },
    borderRightColor:    { base: "transparent" },
    borderBottomWidth:   { base: "0px" },
    borderBottomStyle:   { base: "solid" },
    borderBottomColor:   { base: "transparent" },
    borderLeftWidth:     { base: "0px" },
    borderLeftStyle:     { base: "solid" },
    borderLeftColor:     { base: "transparent" },
    borderTopLeftRadius:     { base: "0px" },
    borderTopRightRadius:    { base: "0px" },
    borderBottomRightRadius: { base: "0px" },
    borderBottomLeftRadius:  { base: "0px" },
    outline:             { focus: "2px solid var(--gb-color-border-focus)" },
    outlineOffset:       { focus: "2px" },
  }
}
```

### 6. Background

```javascript
styles: {
  background: {
    backgroundColor:    { base: "transparent", hover: "var(--gb-color-primary-light)" },
    backgroundImage:    { base: "none" },
    backgroundSize:     { base: "cover" },
    backgroundPosition: { base: "center center" },
    backgroundRepeat:   { base: "no-repeat" },
    backgroundAttachment: { base: "scroll" },
    gradient:           { base: "" },   // CSS gradient string
    overlayColor:       { base: "" },   // applied as ::before background-color
    overlayOpacity:     { base: "0" },
  }
}
```

### 7. Effects

```javascript
styles: {
  effects: {
    opacity:        { base: "1", hover: "0.85" },
    boxShadow:      { base: "none", hover: "var(--gb-shadow-md)" },
    transform:      { base: "none", hover: "translateY(-2px)" },
    transition:     { base: "all 0.2s ease" },
    filter:         { base: "none" },
    backdropFilter: { base: "none" },
    cursor:         { base: "auto" },
  }
}
```

### 8. Position

```javascript
styles: {
  position: {
    position: { base: "relative" },
    top:      { base: "auto" },
    right:    { base: "auto" },
    bottom:   { base: "auto" },
    left:     { base: "auto" },
    zIndex:   { base: "auto" },
  }
}
```

## Rules for Writing Attribute Values

1. **Always use strings** — numbers must include units: `"20px"` not `20`
2. **Token references** — `"var(--gb-space-md)"` is valid and preferred over hardcoded values
3. **Never write `base` as inherited** — if the base equals what the browser default provides, omit it
4. **Omit undefined breakpoints** — never write `{ base: "20px", sm: undefined }`, just `{ base: "20px" }`
5. **Hover states** go inside the same property, not a separate category
6. **CSS shorthand is forbidden** — always longhand (`paddingTop` not `padding`)

## TypeScript Types (src/types/styles.ts)

```typescript
// All category keys and their allowed property names are typed.
// ResponsiveValue enforces string values.
// BlockStyles is the full styles object type.
// Import from '@/types/styles' in any control or hook.
```

## setAttributes Pattern

```typescript
// Always deep-merge, never shallow-replace
function setStyle(
  category: keyof BlockStyles,
  property: string,
  breakpoint: Breakpoint,
  value: string
): void {
  setAttributes({
    styles: deepMerge(attributes.styles, {
      [category]: {
        [property]: {
          [breakpoint]: value
        }
      }
    })
  });
}
```

# Responsive Controls

GoBlocks implements a **mobile-first, six-breakpoint** responsive system. Any visual property that can be set in the block Inspector can also be overridden per breakpoint — no custom CSS required.

---

## Breakpoints

| Label | Key | Default min-width | Typical device |
|---|---|---|---|
| *(base)* | — | 0 | All screens (mobile default) |
| XS | `xs` | 480px | Large phones |
| SM | `sm` | 640px | Small tablets / landscape phones |
| MD | `md` | 768px | Tablets |
| LG | `lg` | 1024px | Small laptops |
| XL | `xl` | 1280px | Desktops |
| 2XL | `2xl` | 1536px | Large/ultra-wide screens |

Breakpoint pixel values can be customized in **GoBlocks → Settings → Breakpoints**.

---

## How Mobile-First Works

The **base value** (no breakpoint selected) applies to all screen widths. Each breakpoint value overrides the base at that screen width and up, using a standard `@media (min-width: …)` rule.

**Example — padding on a Group block:**

| Breakpoint | Value | What it means |
|---|---|---|
| base | 16px | 16px padding on all screens |
| MD | 32px | 32px at 768px wide and above |
| LG | 64px | 64px at 1024px wide and above |

This generates:

```css
.gb-block-abc123 {
  padding: 16px;
}
@media (min-width: 768px) {
  .gb-block-abc123 {
    padding: 32px;
  }
}
@media (min-width: 1024px) {
  .gb-block-abc123 {
    padding: 64px;
  }
}
```

---

## Using Responsive Controls in the Editor

Every block's Inspector contains a **breakpoint toolbar** above responsive-capable fields. The toolbar displays the six breakpoint labels (XS, SM, MD, LG, XL, 2XL). The currently selected breakpoint determines which value you are editing.

**Step by step:**

1. Select a block.
2. In the Inspector (right sidebar), find a field like **Padding**, **Font Size**, or **Columns**.
3. Above the field, click a breakpoint label — for example, **MD**.
4. Set the value you want for that breakpoint. The editor preview updates at the simulated viewport width.
5. Switch to **LG** and set a different value if needed.
6. Leave breakpoints blank if they should inherit from the lower breakpoint.

> **Tip:** Click the device icon in the editor top bar to switch the canvas preview to a specific viewport width, matching the breakpoint you are editing.

---

## Inheritance / Sync Mode

When **Sync Responsive** is enabled in Settings (default: `true`):

- Setting a value at **MD** automatically applies to **LG**, **XL**, and **2XL** unless those breakpoints have explicit values.
- This is the most common mode — you usually only need to set two or three breakpoints.

When Sync Responsive is disabled:

- Each breakpoint is fully independent.
- Unset breakpoints fall back to the base value only.
- Use this if you need fine-grained control at every breakpoint.

---

## Which Properties Are Responsive

All of the following properties support per-breakpoint values in the Group, Column, and Container blocks. Other blocks support a subset.

| Property | Block(s) |
|---|---|
| Padding (top, right, bottom, left) | Group, Column, Container |
| Margin (top, right, bottom, left) | Group, Column, Container |
| Width / max-width / min-width | Group, Column, Container |
| Height / min-height / max-height | Group, Spacer |
| Font size | Heading, Text, Button |
| Line height | Heading, Text |
| Letter spacing | Heading, Text |
| Gap (flex/grid) | Group |
| Columns (grid) | Group |
| Flex direction | Group |
| Flex wrap | Group |
| Justify content | Group |
| Align items | Group |
| Column span | Column |
| Border width | Group, Column |
| Border radius | Group, Column, Button |
| Display (show/hide) | All blocks |

---

## Hiding a Block at a Specific Breakpoint

Every GoBlocks block has a **Visibility** toggle in the Inspector's **Advanced** tab. Per-breakpoint visibility works the same way as any other responsive property.

**Example — hide a decorative block on mobile:**

1. Select the block.
2. Open **Advanced → Visibility**.
3. Set the base value to **Hidden**.
4. Set the **MD** value to **Visible**.

The block is hidden on screens narrower than 768px and visible at 768px and above.

This outputs:

```css
.gb-block-xyz {
  display: none;
}
@media (min-width: 768px) {
  .gb-block-xyz {
    display: block; /* or flex/grid, depending on block layout mode */
  }
}
```

---

## Responsive Values in Generated CSS

GoBlocks generates a single CSS file per page and writes it to `wp-content/uploads/goblocks/`. Each block's responsive rules are concatenated into that file. Media queries are sorted in ascending min-width order (mobile-first) so there are no specificity conflicts.

See [Performance](performance.md) for details on CSS file generation and caching.

---

## Custom Breakpoints

To change the default breakpoint values:

1. Go to **GoBlocks → Settings → Breakpoints**.
2. Enter new pixel values for any breakpoint.
3. Click **Save**.

After saving, all cached CSS files are invalidated. The first page load after a breakpoint change rebuilds the CSS for that page using the new values.

> **Caution:** Changing breakpoints on a live site with existing content will cause a brief CSS regeneration delay on every page on first load. Plan this change during low-traffic hours.

---

## CSS Custom Properties and Breakpoints

Design token values can also be scoped to a breakpoint by wrapping them in a media query. This is done automatically when you change a Global Styles token at a specific breakpoint. For example:

```css
:root {
  --gb-font-size-heading-1: 2.5rem;
}
@media (min-width: 768px) {
  :root {
    --gb-font-size-heading-1: 3.5rem;
  }
}
```

Block-level font-size overrides compound with the token — the token sets the default, the block override sets a multiplier or absolute value on top.
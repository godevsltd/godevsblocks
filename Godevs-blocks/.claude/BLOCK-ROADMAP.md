# GoBlocks — Block Development Roadmap

## v1.0.0 — Core Blocks (P0)

### 1. Box (`goblocks/box`)
**Description:** Universal layout container. Replaces Container + Grid in a single block.
**Tag names:** div, section, article, aside, header, footer, nav, main, figure, ul, ol, li, dl, dt, dd, span, a, form
**Features:**
- Full flex layout (direction, wrap, align, justify, gap)
- Full CSS grid layout (template columns/rows, gap, auto-flow)
- Background: color, gradient, image (with attachment/position/size), overlay (::before)
- Shape dividers (::before / ::after SVG injection)
- Sticky/fixed positioning
- Responsive controls on ALL properties
- Link wrapping mode (a tag with href)
- Dynamic background image from featured image
- Entrance animations via CSS classes (no JS)

**PHP class:** `GoBlocks\Blocks\Box`
**Complexity:** 9/10
**Priority:** P0 — implement first
**Dependencies:** CssEngine, BreakpointStore, DynamicContent

---

### 2. Text (`goblocks/text`)
**Description:** Rich text for body copy. Combines p, span, figcaption, li.
**Tag names:** p, span, div, figcaption, li, dt, dd
**Features:** Full typography controls, inline icons (before/after), dynamic content tags, link support, drop cap, text columns
**PHP class:** `GoBlocks\Blocks\Text`
**Complexity:** 5/10 | **Priority:** P0
**Dependencies:** CssEngine, DynamicContent

---

### 3. Heading (`goblocks/heading`)
**Description:** Semantic headings h1–h6. Separate from Text for SEO/accessibility clarity.
**Tag names:** h1, h2, h3, h4, h5, h6
**Features:** All typography controls, inline icon, link wrapping, anchor auto-generation, custom anchor override
**PHP class:** `GoBlocks\Blocks\Heading`
**Complexity:** 4/10 | **Priority:** P0
**Dependencies:** CssEngine, DynamicContent

---

### 4. Button (`goblocks/button`)
**Description:** Single CTA button or link element.
**Tag names:** a, button
**Features:** Icon (before/after), full hover/focus state styling, link target/rel, aria-label, download attr, noopener auto-enforcement for external links
**PHP class:** `GoBlocks\Blocks\Button`
**Complexity:** 4/10 | **Priority:** P0
**Dependencies:** CssEngine, IconPicker

---

### 5. Image (`goblocks/image`)
**Description:** Image block with srcset, lazy loading, dynamic source.
**Tag names:** img (PHP wraps in figure/a as needed)
**Features:** Media library, URL input, dynamic featured image, size selector, object-fit/position, link wrapping, caption, lightbox mode
**PHP class:** `GoBlocks\Blocks\Image`
**Complexity:** 6/10 | **Priority:** P0
**Dependencies:** CssEngine, DynamicContent

---

### 6. Grid (`goblocks/grid`)
**Description:** CSS grid layout system for column-based layouts.
**Tag names:** div
**Features:** Visual column builder (1–12 columns), responsive column counts, grid gap, auto-fill/fit, masonry via CSS, equal-height children
**PHP class:** `GoBlocks\Blocks\Grid`
**Complexity:** 7/10 | **Priority:** P0
**Dependencies:** CssEngine, BreakpointStore

---

### 7. Query (`goblocks/query`)
**Description:** Query builder block. Wrapper for QueryLoop + Pagination.
**Features:** Full visual query builder (all QueryAttributes), pagination type selector, inherit archive toggle, result count display
**PHP class:** `GoBlocks\Blocks\Query`
**Complexity:** 8/10 | **Priority:** P0
**Dependencies:** QueryBuilder, QuerySanitizer, REST QueryController

---

### 8. Query Loop (`goblocks/query-loop`)
**Description:** Iterates query results. Template = inner blocks.
**Features:** Loop index context, alternating even/odd styles, max columns, lazy load non-visible images
**PHP class:** `GoBlocks\Blocks\QueryLoop`
**Complexity:** 7/10 | **Priority:** P0
**Dependencies:** Query block context

---

### 9. Pagination (`goblocks/pagination`)
**Description:** Pagination UI for Query block. Context-aware.
**Features:** Standard (zero JS) | load-more (REST) | infinite (IntersectionObserver), accessible prev/next, ellipsis, custom labels
**PHP class:** `GoBlocks\Blocks\Pagination`
**Complexity:** 6/10 | **Priority:** P0
**Dependencies:** Query block context, QueryController

---

## v1.1.0 — Enhanced Blocks (P1)

### 10. Icon (`goblocks/icon`)
**Description:** Standalone SVG icon block.
**Features:** Bundled library (250+ Tabler icons), custom SVG paste, size/color/background, link wrapping, aria-hidden default, aria-label option
**PHP class:** `GoBlocks\Blocks\Icon`
**Complexity:** 5/10 | **Priority:** P1
**Dependencies:** SvgSanitizer, CssEngine

---

### 11. Shape Divider (`goblocks/shape`)
**Description:** SVG shape dividers between sections.
**Features:** 20 preset shapes, color, height, flip X/Y, invert, responsive height
**PHP class:** `GoBlocks\Blocks\Shape`
**Complexity:** 4/10 | **Priority:** P1
**Dependencies:** SvgSanitizer

---

### 12. Tabs (`goblocks/tabs`)
**Description:** Accessible tabbed content panels.
**Features:** Tab labels from inner blocks, icons, vertical/horizontal, URL hash sync, mobile scroll
**View script:** Vanilla JS (no React on frontend), ~2 KB
**Accessibility:** role=tablist/tab/tabpanel, aria-selected, Arrow/Home/End keyboard nav
**Complexity:** 7/10 | **Priority:** P1

---

### 13. Accordion (`goblocks/accordion`)
**Description:** Collapsible content panels. FAQ Schema support.
**Features:** Single/multiple open, icon options, CSS animation, FAQ schema output, anchor-open
**View script:** Vanilla JS toggle, ~1 KB
**Accessibility:** `<details>/<summary>` or aria-expanded pattern
**Complexity:** 6/10 | **Priority:** P1

---

## v1.2.0 — Advanced Blocks (P2)

### 14. Slider (`goblocks/slider`)
**Complexity:** 8/10 | **Priority:** P2
**Dependencies:** Swiper.js (loaded conditionally via viewScript in block.json)
**Note:** Adds ~40 KB — only enqueued when block is present on page

### 15. Modal (`goblocks/modal`)
**Complexity:** 9/10 | **Priority:** P2
**Dependencies:** Vanilla JS focus trap, ~3 KB
**Triggers:** button click | element click | page load delay | exit intent | scroll %

### 16. Timeline (`goblocks/timeline`)
**Complexity:** 6/10 | **Priority:** P2

### 17. Pricing Table (`goblocks/pricing`)
**Complexity:** 7/10 | **Priority:** P2
**Dependencies:** Schema.org Offer markup, monthly/annual toggle (vanilla JS)

---

## Block Development Checklist (per block)

- [ ] `src/blocks/{name}/block.json` (apiVersion: 3, textdomain: goblocks)
- [ ] `src/blocks/{name}/index.ts` (registerBlockType)
- [ ] `src/blocks/{name}/edit.tsx` (React edit component)
- [ ] `src/blocks/{name}/save.tsx` (returns null — dynamic)
- [ ] `src/blocks/{name}/transforms.ts` (optional)
- [ ] `src/blocks/{name}/deprecated.ts` (should be empty — dynamic blocks rarely need this)
- [ ] `src/blocks/{name}/components/Inspector.tsx` (InspectorControls composition)
- [ ] `includes/Blocks/{ClassName}.php` (extends BlockBase, implements render())
- [ ] Add `blocks/{name}/index` entry to webpack.config.js entries
- [ ] Add block to `src/blocks.ts` imports
- [ ] Register in `includes/Blocks/BlockBase.php` bootstrap or separate registration call
- [ ] Write PHPUnit test for render() output
- [ ] Write Playwright E2E test: insert → configure → check frontend

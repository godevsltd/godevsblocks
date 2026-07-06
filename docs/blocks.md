# Blocks Reference

GoBlocks registers **36 blocks** under the `goblocks` namespace. All blocks are available in the **GoBlocks** category in the block inserter and in the Site Editor.

---

## Table of Contents

- [Layout Blocks](#layout-blocks)
- [Content Blocks](#content-blocks)
- [Interactive Blocks](#interactive-blocks)
- [Media Blocks](#media-blocks)
- [Query & Archive Blocks](#query--archive-blocks)
- [Showcase Blocks](#showcase-blocks)

---

## Layout Blocks

### Group (`goblocks/group`)

The primary layout container. Wraps child blocks in a `<div>`, `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>`, or `<main>` element (your choice). Supports both **Flexbox** and **CSS Grid** layout modes.

**Key features:**
- Configurable semantic HTML tag
- Flex: direction, wrap, alignment, justify-content, gap
- Grid: columns, rows, auto-flow, gap
- Background: solid color, gradient, image with overlay
- Border, border-radius, box shadow
- Full responsive control on all spacing properties
- Link mode: wraps the entire block in an `<a>` tag
- Animation: fade-in, slide-up, etc. via data attribute

**Typical uses:** Hero sections, feature cards, any generic container.

---

### Column (`goblocks/column`)

A single column intended for use inside a **Group** block in flex or grid mode. Controls its own width, padding, and alignment independently of sibling columns.

**Key features:**
- Column span in grid context
- Flex grow / shrink / basis
- Independent background, border, padding

**Typical uses:** Multi-column card layouts, split content sections.

---

### Container (`goblocks/container`)

A max-width centering wrapper. Renders a `<div>` with `max-width` set to the **Container Width** from Settings (default: 1200px) and `margin: 0 auto`. Use this inside a full-width Group to center page content.

**Key features:**
- Respects the global container width setting
- Can be overridden per-block for narrow or wide containers
- Optional padding override

**Typical uses:** Centering page content within a full-bleed background section.

---

## Content Blocks

### Text (`goblocks/text`)

A rich-text paragraph block. Equivalent to WordPress's core Paragraph block, but with full design token integration, dynamic content support, and typography tokens from the Global Styles panel.

**Key features:**
- Dynamic content tags in content (see [Dynamic Content](dynamic-content.md))
- Full typography control (family, size, weight, line height, color)
- Inline link styling

---

### Heading (`goblocks/heading`)

Semantic heading block supporting `h1` through `h6`. All standard Typography controls plus gradient text support and dynamic content tags.

**Key features:**
- Heading level selector (h1–h6)
- Gradient text via `background-clip: text`
- Dynamic content in the heading text
- Per-breakpoint font-size overrides

---

### Button (`goblocks/button`)

A CTA button or anchor link. Renders as `<a>` (for links) or `<button>` (for non-navigational actions). Full styling control with hover state support via CSS custom properties.

**Key features:**
- Href, target, rel attributes
- Primary / secondary / outline style variants
- Full color, border, padding, border-radius customization
- Icon support (left or right of label)
- ARIA label for accessibility

---

### Image (`goblocks/image`)

A responsive image block with dynamic content support for the `src` and `alt` attributes, making it possible to show the post's featured image inside a Query Loop.

**Key features:**
- Dynamic `src` from `{featured_image}` tag
- Dynamic `alt` text
- Optional link wrapping
- Object fit / object position
- Responsive width and aspect ratio

---

### Icon (`goblocks/icon`)

An inline SVG icon block with a built-in visual picker of 112 icons across 13 categories.

**Icon categories:** UI, Arrows, Communication, People, Files, Media, Commerce, Location, Sharing, Social, Time, Misc, and more.

**Key features:**
- Visual icon picker in the editor
- Stroke / fill / both color controls
- Configurable size (responsive)
- Optional link wrapping

---

### Shape Divider (`goblocks/shape`)

Decorative SVG shapes for section transitions. Positioned at the top or bottom edge of a container.

**Key features:**
- Multiple shape presets (wave, triangle, slant, curve, zigzag, etc.)
- Flip horizontally / vertically
- Color matches the background of the adjacent section
- Responsive height

---

### Separator (`goblocks/separator`)

A styled horizontal rule (`<hr>`). More configurable than WordPress's core Separator.

**Key features:**
- Width (full, fixed px/%)
- Height / thickness
- Color
- Style (solid, dashed, dotted, double)

---

### Spacer (`goblocks/spacer`)

A fixed-height vertical spacer. Unlike core's Spacer, GoBlocks Spacer supports per-breakpoint height, so it can collapse on mobile or expand on desktop.

**Key features:**
- Responsive height per breakpoint
- Min-height / max-height constraints

---

## Interactive Blocks

### Tabs (`goblocks/tabs`)

An ARIA-compliant tabbed interface. Keyboard navigation follows the [ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): Arrow keys move between tabs, Home/End jump to first/last, Enter/Space activates.

**Key features:**
- Any number of tabs
- Tab orientation: horizontal or vertical
- Tab alignment: left, center, right
- Custom active tab color tokens
- Deep-linkable via URL hash

**Accessibility:** `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby` — all generated automatically.

---

### Tab Panel (`goblocks/tab-panel`)

A single panel within a Tabs block. Contains any child blocks.

> Insert Tab Panel blocks directly inside the Tabs block via the block inserter.

---

### Accordion (`goblocks/accordion`)

A disclosure widget built on native `<details>/<summary>` HTML elements — no JavaScript required for the expand/collapse behavior.

**Key features:**
- Native `<details>/<summary>` — works without JS
- Optional FAQ schema markup (`schema.org/FAQPage`, `Question`, `Answer`)
- Animation on open/close via CSS transition
- Allow one open at a time (exclusive) mode

**SEO:** Enable **FAQ Schema** in the block Inspector to output structured data that Google can show as rich results in search.

---

### Accordion Item (`goblocks/accordion-item`)

A single question/answer pair within an Accordion block. The summary (question) is rendered as `<summary>`, the content (answer) can contain any child blocks.

---

### Modal (`goblocks/modal`)

A dialog overlay triggered by a button click. Renders content inside a `<dialog>` element with proper focus management.

**Key features:**
- Trigger button fully customizable
- Any blocks inside the modal content area
- Backdrop click closes modal
- Keyboard: Escape closes modal, Tab is trapped inside while open
- Accessible: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

---

### Flip Card (`goblocks/flip-card`)

A card with a front face and a back face that flips on hover or click.

**Key features:**
- Flip direction: horizontal or vertical
- Trigger: hover or click
- Independent front/back backgrounds and content
- ARIA toggle for keyboard users

---

## Media Blocks

### Video (`goblocks/video`)

A video embed block supporting YouTube, Vimeo, and self-hosted MP4/WebM files. Includes a lazy-load facade (poster image) that defers the video embed until user interaction, improving Core Web Vitals.

**Key features:**
- YouTube and Vimeo embed support (auto-extracts ID from URL)
- Self-hosted video via `<video>` element
- Lazy facade: shows a poster image, loads iframe on click
- Aspect ratio control
- Autoplay, loop, mute options for self-hosted

---

### Lottie Animation (`goblocks/lottie`)

Renders a Lottie JSON animation file hosted on your server or via URL.

**Key features:**
- URL or media library JSON source
- Autoplay, loop, speed controls
- Play on viewport entry (intersection observer)
- Responsive width

---

### Slider (`goblocks/slider`)

A touch-enabled slide carousel.

**Key features:**
- Autoplay with configurable interval
- Navigation arrows and dot indicators (optional)
- Responsive slides-per-view
- Loop mode
- Keyboard navigation between slides

---

### Slide (`goblocks/slide`)

A single slide within a Slider block. Contains any child blocks.

> Insert Slide blocks directly inside the Slider block.

---

## Query & Archive Blocks

### Query (`goblocks/query`)

A visual post query builder that replaces WordPress's core Query Loop block with a richer filtering interface. Configure the query entirely from the block Inspector — no code required.

**Filter options:**
- Post type
- Taxonomy / term
- Author
- Date range
- Post status
- Number of posts per page
- Orderby and order
- Exclude current post

**Key features:**
- Live preview in the editor
- Fully customizable via the `goblocks_query_args` filter (see [Hooks & Filters](developer/hooks-filters.md))

---

### Query Loop (`goblocks/query-loop`)

The loop template rendered inside the Query block. Contains any child blocks — typically a mix of Image, Heading, Text, and Button blocks using dynamic content tags to pull in post data.

**Dynamic content example inside a Query Loop:**

```
{post_title} — displays the title of each post
{post_date|format:M j, Y} — displays the date formatted
{post_excerpt} — displays the excerpt
{featured_image|size:medium} — displays the featured image
```

---

### No Results (`goblocks/query-no-results`)

Fallback content shown when the Query block returns zero posts. Contains any child blocks.

**Typical use:** A friendly "No posts found" message with a search form or back link.

---

### Pagination (`goblocks/pagination`)

Pagination for the Query block. Three modes available:

| Mode | Description |
|---|---|
| **Standard** | Previous / Next page links |
| **Numbered** | Page number links (1, 2, 3 …) |
| **Load More** | Ajax button that appends posts without a full reload |
| **Infinite Scroll** | Posts load automatically as the user scrolls |

---

### Navigation (`goblocks/navigation`)

A full site navigation menu block with mobile hamburger toggle, mega menu support, and submenu chevron indicators.

**Key features:**
- Renders from a WordPress nav menu
- Responsive: hamburger toggle on mobile
- Submenu support with aria-expanded toggle
- Sticky / fixed positioning option
- Logo + menu + CTA button layout

---

## Showcase Blocks

### Counter (`goblocks/counter`)

An animated number counter that counts up when it enters the viewport.

**Key features:**
- Start and end values
- Duration (milliseconds)
- Prefix and suffix (e.g., `$` / `+` / `%`)
- Easing: linear or ease-out
- Trigger: viewport entry via IntersectionObserver

---

### Progress Bar (`goblocks/progress-bar`)

An animated horizontal progress bar.

**Key features:**
- Configurable percentage value
- Label (inside or above the bar)
- Color (solid or gradient)
- Animate on viewport entry
- ARIA: `role="progressbar"`, `aria-valuenow`, `aria-valuemax`

---

### Alert (`goblocks/alert`)

A contextual notification banner.

**Variants:** Info, Success, Warning, Error — each maps to semantic color tokens.

**Key features:**
- Icon (optional, auto-matched to variant)
- Dismissible (close button) mode
- Bordered or filled style
- Contains any child blocks as the alert body

---

### Star Rating (`goblocks/star-rating`)

A visual star rating display (read-only — for display purposes, not user input).

**Key features:**
- Rating value from 0.0 to 5.0 (supports half stars)
- Star size and color
- Show numeric rating label
- Schema.org `AggregateRating` structured data support

---

### Countdown (`goblocks/countdown`)

A live countdown timer to a target date and time.

**Key features:**
- Target date/time picker with timezone support
- Display: days, hours, minutes, seconds (any combination)
- Expired action: hide block, show message, or redirect URL
- Label for each unit (localizable)

---

### Pricing Card (`goblocks/pricing`)

A structured pricing tier card.

**Key features:**
- Plan name, price, billing period
- Feature list with checkmark icons
- Highlighted / featured tier style
- CTA button built in
- "Most popular" badge

---

### Social Share (`goblocks/social-share`)

Generates social sharing links for the current page.

**Supported platforms:** Twitter/X, Facebook, LinkedIn, Pinterest, WhatsApp, Telegram, Email, Copy Link.

**Key features:**
- Icon-only, icon + label, or label-only style
- Configurable color (brand color or custom)
- Circle or rounded-square icon shape
- URL is dynamically resolved from the current post permalink

---

### Table of Contents (`goblocks/table-of-contents`)

Auto-generates a linked table of contents from the headings on the current page.

**Key features:**
- Heading level range (e.g., h2–h4 only)
- Smooth scroll to anchor
- Sticky position mode
- Collapsible on mobile
- Numbered or bulleted list style

---

### Timeline (`goblocks/timeline`)

A vertical timeline layout.

**Key features:**
- Alternating left/right or single-column layout
- Connector line styling (color, style, width)
- Contains Timeline Item child blocks

---

### Timeline Item (`goblocks/timeline-item`)

A single event in a Timeline block.

**Key features:**
- Date / label
- Icon or marker dot
- Content: any child blocks
- Animation on viewport entry

---

## Block Reference Quick Table

| Block | Namespace name | Static JS? |
|---|---|---|
| Accordion | `goblocks/accordion` | No (native `<details>`) |
| Accordion Item | `goblocks/accordion-item` | No |
| Alert | `goblocks/alert` | No |
| Button | `goblocks/button` | No |
| Column | `goblocks/column` | No |
| Container | `goblocks/container` | No |
| Countdown | `goblocks/countdown` | Yes (~1 KB) |
| Counter | `goblocks/counter` | Yes (~1 KB) |
| Flip Card | `goblocks/flip-card` | Yes (~500 B) |
| Group | `goblocks/group` | No |
| Heading | `goblocks/heading` | No |
| Icon | `goblocks/icon` | No |
| Image | `goblocks/image` | No |
| Lottie Animation | `goblocks/lottie` | Yes (Lottie player) |
| Modal | `goblocks/modal` | Yes (~1 KB) |
| Navigation | `goblocks/navigation` | Yes (~2 KB) |
| No Results | `goblocks/query-no-results` | No |
| Pagination | `goblocks/pagination` | Yes (load-more mode) |
| Pricing Card | `goblocks/pricing` | No |
| Progress Bar | `goblocks/progress-bar` | Yes (~500 B) |
| Query | `goblocks/query` | No |
| Query Loop | `goblocks/query-loop` | No |
| Separator | `goblocks/separator` | No |
| Shape Divider | `goblocks/shape` | No |
| Slide | `goblocks/slide` | No |
| Slider | `goblocks/slider` | Yes (~3 KB) |
| Social Share | `goblocks/social-share` | No |
| Spacer | `goblocks/spacer` | No |
| Star Rating | `goblocks/star-rating` | No |
| Tab Panel | `goblocks/tab-panel` | No |
| Table of Contents | `goblocks/table-of-contents` | Yes (~1 KB) |
| Tabs | `goblocks/tabs` | Yes (~1 KB) |
| Text | `goblocks/text` | No |
| Timeline | `goblocks/timeline` | No |
| Timeline Item | `goblocks/timeline-item` | No |
| Video | `goblocks/video` | Yes (lazy facade) |

> **Static JS?** — "Yes" means the block loads a small vanilla JS IIFE on the frontend. Scripts are enqueued conditionally — only when the block is present on the page.
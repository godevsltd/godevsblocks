# GoBlocks — Plugin Improvement Report
> Generated: July 2026 | Based on competitive analysis vs GenerateBlocks, Kadence Blocks, Spectra, Stackable, Greenshift

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State — GoBlocks Inventory](#2-current-state--goblocks-inventory)
3. [Competitive Landscape](#3-competitive-landscape)
4. [Block Design Analysis — Issues & Improvements](#4-block-design-analysis--issues--improvements)
5. [Pattern Library Analysis](#5-pattern-library-analysis)
6. [Feature Gaps vs Market Leaders](#6-feature-gaps-vs-market-leaders)
7. [Inspector/Editor UX Issues](#7-inspectoreditor-ux-issues)
8. [Design Quality — Visual & Responsive](#8-design-quality--visual--responsive)
9. [Performance Opportunities](#9-performance-opportunities)
10. [Priority Roadmap](#10-priority-roadmap)

---

## 1. Executive Summary

GoBlocks is a technically excellent plugin with **36 blocks**, **15 patterns**, a TypeScript-based CSS engine, 6 responsive breakpoints, and proper accessibility. Its architecture is among the cleanest in the Gutenberg ecosystem — zero inline styles, pre-compiled CSS, RTL support, and a PSR-4 PHP codebase.

**However**, in the current competitive landscape GoBlocks has critical feature and design gaps that prevent it from competing head-to-head with established plugins:

| Dimension | GoBlocks | Market Average | Gap |
|---|---|---|---|
| Total Blocks | 36 | 40–75 | Medium |
| Patterns | 15 | 75–800+ | **Critical** |
| Scroll Animations | ❌ None | ✅ Standard | **Critical** |
| Video Backgrounds | ❌ None | ✅ Standard | **Critical** |
| Custom Fonts | ❌ None | ✅ Standard | High |
| Conditional Visibility | ❌ None | ✅ Common | High |
| Form Blocks | ❌ None | ✅ Most plugins | High |
| WP.org Active Installs | New | 100k–1M+ | N/A |
| Icon Picker UI | ❌ Manual only | ✅ Visual search | Medium |
| Gallery / Masonry | ❌ None | ✅ Standard | Medium |

**Top 3 priorities** to compete effectively:
1. Add scroll-triggered entrance animations to all layout/content blocks
2. Expand the pattern library from 15 to 60+ high-quality designs
3. Add video background support to Group/Container blocks

---

## 2. Current State — GoBlocks Inventory

### 2.1 Blocks (36 total)

| Category | Blocks | Count |
|---|---|---|
| **Layout** | Group, Column, Container, Spacer, Separator | 5 |
| **Content** | Text, Heading, Image, Video, Table of Contents | 5 |
| **Interactive** | Tabs, Tab Panel, Accordion, Accordion Item, Modal | 5 |
| **Navigation** | Navigation | 1 |
| **Query** | Query, Query Loop, Query No Results, Pagination | 4 |
| **Media** | Lottie, Slider, Slide, Shape | 4 |
| **Social** | Social Share, Icon, Button | 3 |
| **Data Display** | Counter, Progress Bar, Countdown, Star Rating | 4 |
| **Conversion** | Pricing, Flip Card, Alert | 3 |
| **Timeline** | Timeline, Timeline Item | 2 |

**Notable missing blocks:** Gallery/Masonry, Before-After Comparison, Table, Map Embed, Image Comparison, Number Box, Divider (styled), Search, Login Form, Testimonial Card, Review Block, Off-Canvas Menu.

### 2.2 Patterns (15 total)

| Category | Count | Quality |
|---|---|---|
| Hero | 1 | Good |
| Cards | 1 | Good |
| CTA | 1 | Good |
| FAQ | 1 | Good |
| Blog | 1 | Basic |
| Features / How-It-Works | 1 | Good |
| Testimonials | 2 | Good |
| Pricing | 1 | Good |
| Stats | 1 | Basic |
| Newsletter | 1 | Basic |
| Team | 1 | Basic |
| Portfolio | 1 | Basic |
| Logos | 1 | Basic |

**Verdict:** 15 patterns is far below market standard. Kadence ships 800+, Spectra 75+, Stackable 40+.

### 2.3 Architecture Strengths

- ✅ Zero inline styles (all CSS compiled to `generatedCss` attribute)
- ✅ Pre-compiled CSS stored per block (no runtime PHP generation)
- ✅ 6 responsive breakpoints (xs → 2xl) with per-property control
- ✅ TypeScript strict mode throughout
- ✅ Full RTL support via CSS flip
- ✅ WCAG 2.1 accessibility (ARIA, keyboard nav)
- ✅ Dynamic content system (15 tags: post title, meta, author, etc.)
- ✅ CSS custom properties (--gb-* token system)
- ✅ Schema.org markup (Accordion FAQ, Star Rating reviews)
- ✅ Multisite compatible

---

## 3. Competitive Landscape

### 3.1 Market Snapshot (2025–2026)

| Plugin | Active Installs | Free Blocks | Patterns | Rating |
|---|---|---|---|---|
| **Spectra** | 1,000,000+ | 30+ | 75+ | 4.7/5 |
| **Kadence Blocks** | 600,000+ | 16+ | 800+ | 4.8/5 |
| **GenerateBlocks** | 200,000+ | 9 | Limited | 4.9/5 |
| **Stackable** | 100,000+ | 40+ | 40+ | 4.9/5 |
| **Greenshift** | 70,000+ | 50+ | Templates | 4.8/5 |
| **GoBlocks** | New | 36 | 15 | — |

### 3.2 Feature Comparison Matrix

| Feature | GoBlocks | GenerateBlocks | Kadence | Spectra | Stackable | Greenshift |
|---|---|---|---|---|---|---|
| **Layout Blocks** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Responsive Controls** | ✅ 6 BP | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CSS Variables / Tokens** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Entrance Animations** | ❌ | ❌ | ✅ | ✅ | ✅ Pro | ✅ GSAP |
| **Video Background** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Parallax Effects** | ❌ | ❌ | ❌ | ❌ | ✅ Pro | ✅ |
| **Custom Fonts / Google Fonts** | ❌ | ❌ | ✅ 900+ | ✅ | ❌ | ❌ |
| **Form Blocks** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Conditional Visibility** | ❌ | ❌ | ✅ Pro | ✅ | ✅ Pro | ✅ |
| **Dynamic Content** | ✅ 15 tags | ✅ | ✅ Pro | ✅ Pro | ✅ Pro | ✅ |
| **WooCommerce Blocks** | ❌ | ❌ | ✅ Pro | ❌ | ❌ | ✅ |
| **Query Builder** | ✅ | ✅ | ✅ Pro | ✅ Pro | ✅ Pro | ✅ |
| **Icon Library (visual)** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Gallery / Masonry** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Schema.org Markup** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Lottie Animations** | ✅ | ❌ | ✅ Pro | ❌ | ❌ | ✅ |
| **Countdown Timer** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Progress Bars** | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Pattern Library** | ✅ 15 | ✅ Limited | ✅ 800+ | ✅ 75+ | ✅ 40+ | ✅ |
| **Dark Mode Patterns** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **AI Site Builder** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **RTL Support** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **FSE / Site Editor** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 3.3 Key Observations

**GenerateBlocks** (closest architecture peer): Only 9 blocks but enormous depth per block. Known for clean code and developer experience. GoBlocks has MORE blocks but needs to match GenerateBlocks in styling depth and documentation quality.

**Kadence Blocks** (market leader for features): Wins on pattern library (800+), Google Fonts, form blocks, and conditional visibility. These are the four biggest gaps GoBlocks needs to close to compete.

**Spectra** (#1 by installs): Wins on breadth and accessibility for beginners. GoBlocks's TypeScript/CSS token architecture is cleaner, but Spectra's pattern template library is vastly larger.

**Greenshift** (performance + animation leader): GSAP-based scroll animations, parallax, scroll-reveal — all free. This is GoBlocks's biggest competitive gap for engagement-focused sites.

**Stackable** (breadth leader): 75 blocks in free tier. GoBlocks needs 10–15 more common blocks to reach competitive parity.

---

## 4. Block Design Analysis — Issues & Improvements

### 4.1 Group Block

**Current state:** Universal layout container — the most important block. Supports Flex, Grid, multiple HTML tags, animations, all styling panels.

**Issues:**
- ❌ No video background option (competitors all offer this on section/group blocks)
- ❌ No parallax background image effect  
- ❌ Preset layout buttons exist but are not discoverable — hidden below other controls
- ❌ No min-height preset shortcuts (e.g., "Full viewport height" toggle)
- ❌ No sticky block option (sticky header/sidebar)
- ❌ Grid column control requires manual CSS (e.g., `repeat(3, 1fr)`) — should have visual column picker

**Recommended Improvements:**
1. Add **Video Background** section: URL input (YouTube/Vimeo/self-hosted) + poster image + opacity overlay
2. Add **Parallax toggle** on background image: uses `background-attachment: fixed` with scroll effect
3. Add **Quick Height Presets**: 25vh, 50vh, 75vh, 100vh, auto
4. Add **Sticky positioning** toggle (position: sticky, top: 0, z-index control)
5. Add **Visual column picker** for grid: 1–6 column buttons instead of CSS string input
6. Move layout presets to **top of inspector** as prominent quick-start buttons

### 4.2 Heading Block

**Current state:** Semantic h1–h6 with full typography, gradient text, link wrapping, dynamic content.

**Issues:**
- ❌ No highlight/mark support (highlight a word in a different color)
- ❌ No animated text effects (typing effect, scramble, word swap)
- ❌ No text stroke/outline option
- ❌ Gradient text UI requires the gradient to be set as a CSS string (not visual)
- ❌ No character spacing visual preview

**Recommended Improvements:**
1. Add **inline text highlight** via `<mark>` element with custom color
2. Add **text stroke** (CSS `-webkit-text-stroke`) option in Typography panel
3. Visual **gradient text builder** (reuse GradientControl for text gradient)
4. Add **typing animation** toggle (simple CSS-only letter-by-letter reveal)

### 4.3 Text Block

**Current state:** Rich text paragraph with typography panel, dynamic content, drop cap.

**Issues:**
- ❌ Text highlight (mark color) not available — Heading has gradient, Text has none
- ❌ Drop cap styling is limited (only toggle, no size/color control)
- ❌ Pull quote / blockquote styling not available (no dedicated block)
- ❌ Column layout for text (CSS multi-column) not supported

**Recommended Improvements:**
1. Add **inline text highlight** color via custom format (toolbar button)
2. Add **drop cap** color, font, and size control
3. Add **CSS columns** option (column-count: 2 or 3)
4. Add **Blockquote** as text type variant (with vertical border, left padding)

### 4.4 Image Block

**Current state:** Responsive image with lightbox, caption, link, focal point, object-fit.

**Issues:**
- ❌ No before-after comparison slider (very popular feature)
- ❌ No image caption typography control (inherits theme styles)
- ❌ No hover zoom effect toggle
- ❌ No CSS filter controls (grayscale, sepia, blur, brightness — common for portfolio)
- ❌ Focal point picker exists but no visual drag handle in editor
- ❌ No overlay color on image hover

**Recommended Improvements:**
1. Add **Image Comparison** mode (drag-to-reveal before/after using two images)
2. Add **CSS filter presets**: grayscale, sepia, blur, warm, cool (toggle in editor)
3. Add **hover effect** dropdown: zoom, overlay color, greyscale-to-color reveal
4. Add proper **focal point drag UI** in editor preview (not just coordinates)

### 4.5 Button Block

**Current state:** CTA button/anchor with icon support (before/after), full styling, hover/focus states.

**Issues:**
- ❌ No button group (multiple buttons side by side with gap)
- ❌ No loading state styling
- ❌ No outline/ghost variant quick preset
- ❌ Icon position control limited
- ❌ No rounded-full / pill shortcut

**Recommended Improvements:**
1. Add **Button Group** wrapper block to align multiple buttons with configurable gap
2. Add **Style presets** panel: Filled / Outline / Ghost / Pill / Link (quick one-click styles)
3. Add **Icon only** mode with proper aria-label for icon-only buttons
4. Add **Full width** toggle (width: 100%)

### 4.6 Icon Block

**Current state:** 250+ Tabler icons, custom SVG paste, animations, shapes, link wrapping.

**Issues:**
- ❌ **No visual icon picker/browser** — user must know the exact slug to type it. This is a critical UX failure. Kadence and Spectra have searchable visual pickers.
- ❌ Icon library limited to Tabler only — no Font Awesome, Lucide, Heroicons options
- ❌ Icon background shape (circle/square) has limited styling
- ❌ No icon set switching (all icons are same style — outline only)

**Recommended Improvements:**
1. **Build a visual icon search modal** — grid of icons, searchable by name, click to select. This is the most impactful single fix for the Icon block.
2. Add **icon style selector**: outline, filled, duotone (Tabler supports all three)
3. Add **Heroicons / Lucide** as alternative icon sets (toggle between libraries)
4. Add **icon badge overlay** positioning option (top-right, bottom-right for notification dots)

### 4.7 Accordion Block

**Current state:** Native `<details>/<summary>`, FAQ schema, single/multiple open modes.

**Issues:**
- ❌ No animated open/close transition (native `<details>` doesn't animate height)
- ❌ No custom icon for expand/collapse indicator (only default triangle)
- ❌ No border-between-items style (items are separate blocks with no connecting border)
- ❌ FAQ schema output needs testing — some crawlers require `@type: Question` at specific depth

**Recommended Improvements:**
1. Add **animated height transition** via CSS max-height trick or View Transition API
2. Add **custom expand icon** picker (plus/minus, chevron, arrow) with color
3. Add **"connected" style toggle** — renders all items in a single bordered card
4. Add **search filter** toggle for FAQ accordion (filter questions by keyword)

### 4.8 Tabs Block

**Current state:** ARIA tablist, horizontal/vertical, pill/bar styles, keyboard nav.

**Issues:**
- ❌ No **mobile accordion mode** — on mobile, tabs should collapse to accordion for usability
- ❌ Tab labels not editable inline — must open inspector to change tab label
- ❌ No scroll-to-tab via URL hash (#tab-slug) for deep linking
- ❌ No icon in tab button (common pattern: icon + label)
- ❌ No drag-to-reorder tab panels in editor

**Recommended Improvements:**
1. Add **mobile collapse mode**: tabs become accordion below a breakpoint
2. Add **URL hash sync** for tab panels (click tab → URL updates → shareable links)
3. Add **icon slot** in Tab Panel for tab button icon (uses Icon block or slug)
4. Make **tab label editable inline** (RichText in the tab button)

### 4.9 Slider Block

**Current state:** Autoplay, loop, fade/zoom/cards effects, arrows, dots, progress bar, counter.

**Issues:**
- ❌ Navigation arrows have fixed position options — no custom positioning to exact coordinates
- ❌ No **thumbnail navigation** (small thumbnails below main slide)
- ❌ No **autoplay pause on focus** (WCAG 2.1 requirement SC 2.2.2)
- ❌ No **gap between slides** when showing multiple slides
- ❌ Slide min-height control is manual CSS, not a visual height slider
- ❌ No **touch swipe sensitivity** control

**Recommended Improvements:**
1. Add **autoplay pause on keyboard focus** (WCAG compliance)
2. Add **slides-per-view** preset selector (1, 2, 3, auto)
3. Add **gap control** between slides when showing multiple
4. Add **height presets**: auto content, fixed px, viewport %
5. Add **thumbnail nav mode** for image galleries

### 4.10 Modal Block

**Current state:** Trigger text/button, animations, auto-open with delay, cookie persistence.

**Issues:**
- ❌ No **trigger via external button** (can only trigger via its own internal trigger text)
- ❌ No **full-screen mode** option
- ❌ No **slide-in from side** (drawer/sidebar style)
- ❌ Cookie storage doesn't differentiate between domains/paths
- ❌ No **confirmation modal** variant (Yes/No with callback)

**Recommended Improvements:**
1. Add **drawer mode**: slide from left/right/bottom instead of center popup
2. Add **trigger via data attribute** so any button with `data-gb-modal="modal-id"` opens it
3. Add **full-screen mode** toggle
4. Add **size presets**: small, medium, large, full-screen
5. Add **second button** for confirmation dialogs (confirm/cancel with custom labels)

### 4.11 Query Block

**Current state:** Post type, taxonomy, author, date, meta filters, offset, perPage, 3 pagination modes.

**Issues:**
- ❌ No **AJAX filtering** — filters require page reload; Kadence Pro has live filtering
- ❌ No **search block integration** for live query filtering by keyword
- ❌ No **order by meta value** (e.g., order posts by a custom price field)
- ❌ No **post grid presets** in editor (user must build card layout from scratch)
- ❌ Pagination load-more button styling is limited to basic color/text
- ❌ No **skeleton loading** state for load-more/infinite scroll

**Recommended Improvements:**
1. Add **AJAX filter blocks**: Taxonomy Filter, Search Filter, Order By selector — filter query live without page reload
2. Add **post card preset templates** inside Query Loop (choose layout: card / list / minimal)
3. Add **skeleton loading** CSS animation while posts load
4. Add **featured post** flag support (query returns latest post as featured + rest as grid)

### 4.12 Pricing Block

**Current state:** Plan name, price, period, features list, CTA, featured state, alternate price toggle.

**Issues:**
- ❌ No **billing toggle** (monthly/annual switcher affecting all pricing cards simultaneously)
- ❌ Feature list only supports plain text — no icons per feature, no "not included" strikethrough
- ❌ No **hover animation** (cards don't lift/elevate on hover)
- ❌ No **comparison table** variant (all plans side by side with feature matrix)

**Recommended Improvements:**
1. Add **shared billing toggle** that syncs price display across all Pricing blocks on the page
2. Add **feature list icons**: checkmark (green), cross (red), dash (neutral) per line
3. Add **card hover elevation** preset (box-shadow increase + translate-y: -4px)
4. Add **comparison table** layout variant

### 4.13 Counter / Progress Bar / Countdown / Star Rating

**Current state:** Scroll-triggered animations, good attribute controls.

**Issues:**
- ❌ Counter has no **"+" suffix pre-fill preset** (common: "50K+", "$99", "99%")
- ❌ Progress bar **stripe animation** fires only once (no loop/repeat option)
- ❌ Star rating has no **interactive** mode (user can't click to vote — display only)
- ❌ Countdown **expired state** redirect doesn't support redirect delay or message duration
- ❌ No **counter group** container to auto-align 3–4 counters in a row

**Recommended Improvements:**
1. Add **Counter formatting presets**: plain, currency ($1,200), percentage (99%), compact (1.2M)
2. Add **interactive star rating** option (collects user input, stores in user meta or cookie)
3. Add **countdown "evergreen" mode**: restarts from X days after visitor arrives (persistent per-user)
4. Add **Counter Row wrapper** preset pattern or block

### 4.14 Alert Block

**Current state:** info/success/warning/danger/error types, dismissible, cookie persistence, filled/outlined/gradient styles.

**Issues:**
- ❌ No **inline/compact** variant (small banner, not full-width card)
- ❌ No **sticky alert** option (sticks to top of viewport as a notification bar)
- ❌ No **countdown in alert** (e.g., "Sale ends in: [timer]" banner)
- ❌ Gradient style not editable (hardcoded CSS gradients per type, not custom)

**Recommended Improvements:**
1. Add **Top Bar mode**: fixed/sticky top-of-page notification banner
2. Add **Banner size**: full-width compact (thin single-line), standard, large card
3. Allow **custom gradient per alert** using the GradientControl

### 4.15 Navigation Block

**Current state:** WordPress menu, horizontal/vertical, mobile hamburger, sticky.

**Issues:**
- ❌ No **mega menu** support
- ❌ No **dropdown hover** vs **click** mode toggle
- ❌ No **social icons** in navigation (common in footer navs)
- ❌ Hamburger icon is fixed — no custom icon choice
- ❌ No **off-canvas drawer** mode (full-height sidebar navigation)
- ❌ Mobile menu animation is limited (appear/disappear only, no slide-in)

**Recommended Improvements:**
1. Add **dropdown mode toggle**: hover vs click
2. Add **mobile menu animation**: slide from top, slide from side, fade
3. Add **off-canvas drawer** toggle for mobile
4. Add **custom hamburger icon** using icon block slug

---

## 5. Pattern Library Analysis

### 5.1 Current Patterns Assessment

| Pattern | Design Quality | Responsiveness | Uses GoBlocks Blocks | Rating |
|---|---|---|---|---|
| Hero Centered | ⭐⭐⭐⭐⭐ | ✅ Good | ✅ Yes | Excellent |
| Feature Cards 3-col | ⭐⭐⭐⭐ | ✅ Good | ✅ Yes | Good |
| CTA Split Panel | ⭐⭐⭐⭐⭐ | ✅ Good | ✅ Yes | Excellent |
| Testimonial Single | ⭐⭐⭐⭐ | ✅ Good | ✅ Yes | Good |
| Testimonials Grid | ⭐⭐⭐ | ⚠️ Basic | ✅ Yes | Average |
| Pricing 3-Tier | ⭐⭐⭐⭐ | ✅ Good | ✅ Yes | Good |
| FAQ Accordion | ⭐⭐⭐⭐ | ✅ Good | ✅ Yes | Good |
| Blog Posts Grid | ⭐⭐⭐ | ⚠️ Basic | ⚠️ Partial | Average |
| Stats 4-col | ⭐⭐⭐ | ⚠️ Basic | ✅ Yes | Average |
| Newsletter Banner | ⭐⭐ | ⚠️ Basic | ⚠️ Partial | Below Avg |
| Team Grid | ⭐⭐ | ⚠️ Basic | ⚠️ Partial | Below Avg |
| Portfolio Grid | ⭐⭐ | ⚠️ Basic | ⚠️ Partial | Below Avg |
| Logo Cloud | ⭐⭐ | ❌ Weak | ⚠️ Partial | Poor |
| How It Works | ⭐⭐⭐ | ✅ Good | ✅ Yes | Average |
| Contact | ⭐⭐ | ⚠️ Basic | ⚠️ Partial | Below Avg |

### 5.2 Pattern Gaps — Critical Missing Categories

GoBlocks needs at minimum **60 patterns** to compete. The following are highest-priority additions:

**Heroes (need 5 more)**
- Hero with full-screen video background
- Hero with floating feature cards (glassmorphism)
- Hero with animated counter stats
- Hero with before-after image slider
- Minimal hero (text-only, large typography)

**Features / Sections (need 8 more)**
- Feature list with left icon column + right text
- Feature bento grid (large + small cards)
- Features comparison (two-column table)
- Benefits section with animated icons on scroll
- Problem/solution split (before vs after)
- Process steps with numbered circles
- Interactive feature tabs (click to switch features)
- Feature spotlight with screenshot

**Testimonials (need 4 more)**
- Testimonials slider/carousel
- Testimonials masonry (varied card heights)
- Video testimonial cards
- Testimonials with star ratings + company logos

**Pricing (need 3 more)**
- Monthly/annual toggle pricing table
- Pricing comparison table (feature matrix)
- Simple single-tier pricing block

**Blog / Content (need 5 more)**
- Blog masonry grid
- Blog list style (horizontal cards)
- Blog with sidebar layout
- Author bio card
- Recent posts widget

**Footers (need 6 more)** — GoBlocks has ZERO footer patterns
- Simple footer (logo + links + copyright)
- Footer with 4 columns (links, social, newsletter)
- Dark footer
- Minimal footer (centered)
- Footer with newsletter form
- Agency footer with contact info

**Headers (need 4 more)** — GoBlocks has ZERO header patterns
- Centered logo header
- Navigation with CTA button
- Transparent hero header
- Dark sticky header

**E-commerce / Conversion (need 5 more)**
- Product showcase card
- Product features 3-col
- Cart/order summary card
- Trust badges row (SSL, guarantee, payment icons)
- Sale announcement banner

**About / Company (need 4 more)**
- About us split (image left, text right)
- Team with hover social links
- Company values cards
- Awards / recognition badges

**Full-Page Templates (need 5 more)**
- Landing page — product launch
- Landing page — agency home
- Landing page — SaaS app
- Blog post page layout
- Contact page with map

### 5.3 Pattern Design Issues

1. **Hardcoded hex colors** — Most patterns use hardcoded `#4f46e5` (indigo) rather than CSS custom properties from theme.json. Users can't change the accent color globally.
2. **No dark mode variants** — Zero dark patterns. Competitors ship light + dark versions of every category.
3. **Static designs** — No use of entrance animations, counter blocks, or countdown timers in patterns.
4. **Limited block usage** — Several patterns use core WordPress `<!-- wp:html -->` tags instead of native GoBlocks blocks.
5. **No full-page templates** — Only section-level patterns. Users can't get a complete page in one click.

---

## 6. Feature Gaps vs Market Leaders

### Priority 1 — Critical (must have to compete)

#### 6.1 Scroll-Triggered Entrance Animations
**Gap vs:** Kadence, Spectra, Stackable, Greenshift  
**Implementation:** Add animation panel to all blocks with:
- Trigger: On scroll enter viewport
- Effect: fade-in, slide-up, slide-left, slide-right, zoom-in, flip-in
- Delay: 0–1000ms
- Duration: 300ms–2000ms
- Easing: ease, ease-out, bounce
- Threshold: 10%–50% in view before triggering
- Implementation: CSS + Intersection Observer API (no heavy library needed)

```javascript
// ~2KB implementation using IntersectionObserver
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) el.target.classList.add('gb-animated');
  });
}, { threshold: 0.1 });
```

#### 6.2 Video Background for Group/Container
**Gap vs:** Kadence, Spectra, Greenshift  
**Implementation:** Add Video Background section to BackgroundPanel:
- Video URL (YouTube/Vimeo/self-hosted mp4)
- Autoplay (always true for backgrounds), muted (always true), loop (always true)
- Fallback poster image (shown on mobile where video autoplay blocked)
- Overlay color + opacity on top of video (for text contrast)
- Note: Must not autoplay audio — use `muted` attribute for WCAG compliance

#### 6.3 Expand Pattern Library to 60+
**Gap vs:** All competitors  
See Section 5.2 for full list. Start with: 5 more heroes, 8 more feature sections, 6 footers, 4 headers.

#### 6.4 Visual Icon Search Picker
**Gap vs:** Kadence, Spectra, Stackable  
**Implementation:** Replace the text slug input in the Icon block with a modal icon browser:
- Grid view of all 250+ Tabler icons
- Search by name (client-side filter, no API call)
- Click to select, preview in block immediately
- Allow icon style toggle: outline, filled, duotone

### Priority 2 — High Impact

#### 6.5 Google Fonts / Custom Font Integration
**Gap vs:** Kadence (900+ Google Fonts), Spectra (local font loading)  
**Implementation:**
- Add Google Fonts picker in Typography panel (font family control shows Google Fonts API results)
- Download font files locally on selection (to avoid Google privacy issues — GDPR compliance)
- Or: integrate with WordPress 6.5+ `wp_register_webfont()` API
- Store selected fonts in plugin settings, enqueue only when used

#### 6.6 Conditional Block Visibility
**Gap vs:** Kadence Pro, Spectra Pro, Stackable Pro  
**Implementation:** Add "Display Conditions" panel to every block:
- Hide/Show if: user is logged in, user has role (subscriber/editor/admin), post category matches, current page matches, device type (desktop/mobile), date range, time of day

#### 6.7 Gallery / Masonry Block
**Gap vs:** All competitors  
**Implementation:** New `goblocks/gallery` block:
- Media library multi-select
- Layout modes: grid, masonry, justified, slideshow
- Lightbox (reuse existing lightbox from Image block)
- Column count (responsive)
- Gap control
- Caption overlay

#### 6.8 Before-After Image Comparison
**Gap vs:** Kadence, Spectra, Stackable  
**Implementation:** New `goblocks/image-comparison` block:
- Two image pickers (before/after)
- Drag handle with custom icon
- Vertical or horizontal orientation
- Label overlays ("Before"/"After" with custom text + styling)

### Priority 3 — Competitive Parity

#### 6.9 Table Block
**Gap vs:** All major competitors  
A basic HTML table with styling controls (stripe rows, hover highlight, border styles, responsive scroll).

#### 6.10 Map Embed Block
Simple Google Maps / OpenStreetMap embed. Attributes: address or lat/lng, zoom, map type, height, custom marker.

#### 6.11 Search Block
A site search input that submits to WordPress search results page. Styling, placeholder, icon toggle.

#### 6.12 Form Blocks (Long Term)
Multi-step contact form with:
- Input, Textarea, Select, Checkbox, Radio, File Upload fields
- Email notification (wp_mail)
- AJAX submit with honeypot spam protection
- Save submissions to database
- Integration hooks for Mailchimp, ConvertKit, etc.

#### 6.13 Global Block Styles / Saved Presets
Allow users to save a block's styling as a named preset. Other instances of the same block can load that preset. (Similar to GenerateBlocks's Global Styles system.)

---

## 7. Inspector/Editor UX Issues

### 7.1 Panel Organization

**Issue:** All blocks dump all style controls into one "Styles" tab. With 8+ panels (Sizing, Spacing, Typography, Background, Border, Effects, Layout, Position), the inspector becomes overwhelming.

**Fix:** Group related panels into sub-tabs or use collapsible panel groups:
- **Layout** tab: Sizing, Spacing, Layout/Flex/Grid, Position
- **Style** tab: Typography, Background, Border, Effects
- **Advanced** tab: HTML attributes, CSS classes, animations, visibility

### 7.2 Responsive Preview Sync

**Issue:** Changing breakpoint in the responsive toolbar updates the active breakpoint for style editing, but the editor preview doesn't resize to match the breakpoint. Users have to resize the browser window manually.

**Fix:** Wire breakpoint selector to editor canvas width via `wp.data.dispatch('core/edit-post')` to resize the preview canvas.

### 7.3 Color Control UX

**Issue:** The ColorControl component requires manually typing hex values. No color palette swatches from theme.json appear inline.

**Fix:** Add theme.json color palette swatches as clickable dots above the hex input, similar to the core WordPress color picker.

### 7.4 Spacing Panel — Linked Controls

**Issue:** When margin/padding "link all sides" is toggled, individual side inputs still show. Entering a value in "top" doesn't auto-fill the others.

**Fix:** When "link" is active, a single unified input should replace all four. Changing it updates all four values simultaneously.

### 7.5 Gradient Control — State Persistence

**Issue (FIXED in this session):** GradientControl now parses stored gradients on mount. However, switching breakpoints while gradient is open may reset the internal state.

**Fix:** Consider persisting GradientControl state to `useRef` or use the stored value as ground truth for all reads.

### 7.6 Missing Keyboard Shortcuts in Editor

**Issue:** No keyboard shortcuts for common inspector actions (e.g., no shortcut to reset a value to default, toggle a panel, or copy styles between blocks).

**Fix:**
- `Alt+R` or Reset button on every control to clear the value
- "Copy Styles" / "Paste Styles" block toolbar buttons (stores styles in clipboard)
- "Clear All Styles" button at top of inspector

### 7.7 No Global Defaults

**Issue:** Every new block starts with zero styles. Users must re-apply their preferred defaults every time.

**Fix:** Add a "Set as Default" button per block type in inspector. Stores defaults in plugin settings and pre-fills new blocks with those values.

---

## 8. Design Quality — Visual & Responsive

### 8.1 Pattern Visual Quality

The 5 high-quality patterns (Hero, CTA Split, FAQ, Pricing, Testimonial Single) are excellent — modern, gradient-rich, visually compelling. The 10 simpler patterns (Stats, Newsletter, Team, Portfolio, Logos) look basic and wouldn't pass visual quality review by WP.org or be showcased in a plugin demo.

**Pattern design standards to enforce:**
- Every pattern must use GoBlocks custom blocks (not core blocks)
- Every pattern must look impressive on a modern marketing site
- Every pattern must include hover effects on interactive elements
- Every pattern must be mobile-tested down to 375px
- Every pattern must use CSS custom properties for colors (not hardcoded hex)

### 8.2 Mobile Responsiveness Issues

**Group block with complex grid:** When `grid-template-columns: repeat(3, 1fr)` is set at base and the user doesn't set a mobile override, the grid stays 3-column on mobile. GoBlocks should auto-suggest a 1-column override at `sm` breakpoint when a grid is detected.

**Slider on mobile:** Swiper.js integration works, but navigation arrows overlap content on small screens. The arrows need a responsive hide option (hide arrows below sm breakpoint, rely on swipe).

**Navigation block on mobile:** The mobile menu exists but the animation is a simple CSS show/hide. On modern sites, users expect a smooth slide-down or push-sidebar animation.

**Typography scaling:** Most patterns set fixed px font sizes. For responsive typography, patterns should use `clamp()` values (e.g., `clamp(1.25rem, 3vw, 2rem)`) for headings.

### 8.3 Dark Mode Support

GoBlocks has zero dark mode patterns or blocks. As of 2025, dark mode support is expected on any production block plugin.

**What's needed:**
- CSS custom property approach for colors (enables dark mode with CSS `@media (prefers-color-scheme: dark)`)
- Dark variants of key patterns: Hero, CTA, Testimonials, Pricing, Features
- Dark mode toggle block (for sites offering user-controlled dark mode)

### 8.4 Accessibility — Design Gaps

| Issue | Impact | Fix |
|---|---|---|
| Low contrast text on gradient patterns | WCAG AA failure | Ensure all text on colored backgrounds has 4.5:1 contrast ratio |
| Icon block decorative icons not hidden from screen readers | WCAG 1.1.1 | `aria-hidden="true"` on decorative icons (done?) — verify |
| Slider autoplay has no pause button | WCAG 2.2.2 | Add visible pause control to Slider block |
| Accordion native `<details>` doesn't animate | Minor UX | CSS height animation via JS workaround |
| Focus styles not visible on all block buttons | WCAG 2.4.11 | Ensure `:focus-visible` outline on all interactive blocks |
| Countdown timer doesn't announce to screen readers | WCAG 4.1.3 | Add `aria-live="polite"` region for countdown updates |

---

## 9. Performance Opportunities

### 9.1 Current Performance (Strengths)

- ✅ No jQuery dependency
- ✅ Pre-compiled CSS (no PHP generation at runtime)
- ✅ Code-split JS (each block's JS loads only when present)
- ✅ Per-page CSS file cached in uploads directory
- ✅ Minified CSS output (no whitespace)

### 9.2 Performance Issues to Fix

**Issue 1: Lottie.js loads on all pages**  
Currently: The Lottie player JS (~150KB) enqueues even on pages without a Lottie block.  
Fix: Conditionally enqueue Lottie JS only when `goblocks/lottie` block is present in page content.

**Issue 2: Swiper.js loads on all pages**  
Currently: Swiper.js (~40KB) enqueues even on pages without a Slider block.  
Fix: Conditional enqueue — only load when `goblocks/slider` is present.

**Issue 3: No lazy initialization for view scripts**  
Currently: All interactive block scripts initialize immediately on DOMContentLoaded.  
Fix: Use Intersection Observer for Counter, Progress Bar, Star Rating, and Timeline — initialize only when entering viewport.

**Issue 4: Unused CSS custom properties**  
The `tokens.css` file enqueues all CSS variable declarations globally. If a block isn't used, its variables still load.  
Fix: Move block-specific tokens into each block's `blocks.css` entry and load conditionally.

**Issue 5: Large pattern PHP files**  
Pattern files use long PHP heredoc strings for block content. These are parsed on every pattern library load.  
Fix: Cache parsed pattern content in a transient keyed by pattern slug.

### 9.3 Core Web Vitals Impact

| Block | CLS Risk | LCP Impact | FID Risk | Fix |
|---|---|---|---|---|
| Image block | Medium (no explicit width/height) | High | Low | Always output `width` + `height` attributes |
| Slider block | High (height changes after Swiper init) | Medium | Medium | Reserve container height via CSS before Swiper loads |
| Lottie block | Medium | Low | Medium | Set explicit width/height on container |
| Video block | Low | High (poster image) | Low | Preconnect to YouTube/Vimeo origins |
| Counter block | None | None | Low | Defer IntersectionObserver registration |

---

## 10. Priority Roadmap

### Phase 1 — Quick Wins (1–4 weeks)
*These have high user impact and relatively low implementation complexity.*

| # | Task | Impact | Effort |
|---|---|---|---|
| 1.1 | Add scroll entrance animations to all blocks | 🔴 Critical | Medium |
| 1.2 | Build visual Icon picker modal | 🔴 Critical | Medium |
| 1.3 | Add 20 new patterns (5 heroes, 6 footers, 4 headers, 5 features) | 🔴 Critical | Medium |
| 1.4 | Dark mode variants for 5 key patterns | 🟠 High | Low |
| 1.5 | Fix Slider autoplay WCAG pause button | 🟠 High | Low |
| 1.6 | Add typography clamp() to patterns | 🟡 Medium | Low |
| 1.7 | Add Group quick column picker (1–6 columns) | 🟡 Medium | Low |
| 1.8 | Conditional enqueue Swiper.js + Lottie.js | 🟡 Medium | Low |
| 1.9 | Add Button Group block | 🟡 Medium | Low |
| 1.10 | Image block: CSS filter presets | 🟡 Medium | Low |

### Phase 2 — Core Feature Additions (1–3 months)
*Medium complexity features that close gaps vs market leaders.*

| # | Task | Impact | Effort |
|---|---|---|---|
| 2.1 | Video background for Group/Container | 🔴 Critical | Medium |
| 2.2 | Gallery / Masonry block | 🔴 Critical | High |
| 2.3 | Before-After Image Comparison block | 🟠 High | Medium |
| 2.4 | Google Fonts picker in Typography panel | 🟠 High | High |
| 2.5 | Add 30 more patterns (to reach 60+ total) | 🟠 High | Medium |
| 2.6 | Conditional block visibility panel | 🟠 High | High |
| 2.7 | Table block (basic HTML table + styling) | 🟡 Medium | Medium |
| 2.8 | Tabs → accordion on mobile mode | 🟡 Medium | Medium |
| 2.9 | Accordion animated open/close transition | 🟡 Medium | Medium |
| 2.10 | Map Embed block | 🟡 Medium | Low |
| 2.11 | Add full-page templates (5 full-page patterns) | 🟠 High | High |
| 2.12 | Pricing monthly/annual billing toggle | 🟡 Medium | Medium |
| 2.13 | URL hash deep-linking for Tabs | 🟡 Medium | Low |
| 2.14 | Modal drawer mode (slide from side) | 🟡 Medium | Medium |
| 2.15 | Copy/Paste block styles toolbar button | 🟡 Medium | Medium |

### Phase 3 — Pro-Level Features (3–6 months)
*Advanced features that justify a Pro/Premium tier.*

| # | Task | Impact | Effort |
|---|---|---|---|
| 3.1 | Form builder blocks (input, textarea, select, submit) | 🔴 Critical | Very High |
| 3.2 | AJAX query filtering (taxonomy, search, sort) | 🟠 High | High |
| 3.3 | Global block style presets (save + apply) | 🟠 High | High |
| 3.4 | WooCommerce product blocks | 🟠 High | Very High |
| 3.5 | Parallax scroll effects on backgrounds | 🟡 Medium | High |
| 3.6 | GSAP / scroll-linked animations | 🟡 Medium | Very High |
| 3.7 | AI layout suggestions | 🟡 Medium | Very High |
| 3.8 | Pattern library sync (cloud-based updates) | 🟡 Medium | High |
| 3.9 | Mega menu support in Navigation block | 🟡 Medium | High |
| 3.10 | Interactive star rating (user voting) | 🟢 Low | Medium |
| 3.11 | Countdown evergreen mode (per-visitor timer) | 🟡 Medium | Medium |
| 3.12 | Dark mode toggle block | 🟡 Medium | Medium |

---

## Summary — Top 10 Improvements for Maximum Impact

1. **🔴 Add entrance scroll animations** to all layout/content blocks — closes the biggest market gap
2. **🔴 Expand patterns from 15 → 60+** including full-page templates, headers, and footers
3. **🔴 Video background** on Group/Container — expected feature on all modern block plugins
4. **🔴 Visual icon search picker** — current text-slug-only UX is broken for non-technical users
5. **🟠 Dark mode pattern variants** for all major pattern categories
6. **🟠 Gallery / Masonry block** — one of the most-requested Gutenberg blocks, missing completely
7. **🟠 Google Fonts integration** — 900+ fonts is table-stakes for premium plugins
8. **🟠 Before-After Image Comparison block** — highly requested, strong engagement block
9. **🟠 Conditional block visibility** — show/hide by role, login status, device, date
10. **🟡 Fix mobile responsive typography** in patterns (use clamp() instead of fixed px sizes)

---

*Report generated from: GoBlocks plugin audit (36 blocks, 15 patterns, full TypeScript codebase review) combined with competitive analysis of GenerateBlocks (200K installs), Kadence Blocks (600K installs), Spectra (1M installs), Stackable (100K installs), and Greenshift (70K installs).*
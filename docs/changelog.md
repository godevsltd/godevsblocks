# Changelog

All notable changes to GoBlocks are documented here. GoBlocks follows [Semantic Versioning](https://semver.org/).

---

## 1.0.0 — 2026-07-06

Initial public release on WordPress.org.

### Blocks (36)

**Layout**
- Group block with Flexbox and CSS Grid layout modes, semantic HTML tag selector, background image support, animation, and link mode
- Column block with independent flex/grid properties
- Container block — max-width centering wrapper reading global container width setting

**Content**
- Text block with dynamic content tag support
- Heading block (h1–h6) with gradient text and dynamic content support
- Button block — link or action, icon support, full style control
- Image block with dynamic featured-image support and responsive srcset
- Icon block — 112 SVG icons across 13 categories, visual picker
- Shape Divider block — SVG section transition shapes
- Separator block — styled `<hr>` with width, thickness, and style control
- Spacer block — per-breakpoint height

**Interactive**
- Tabs block — ARIA tablist pattern, keyboard navigation, URL hash deep-link
- Tab Panel block
- Accordion block — native `<details>/<summary>`, FAQ schema markup, exclusive mode
- Accordion Item block
- Modal block — `<dialog>` element, focus trap, backdrop close
- Flip Card block — horizontal or vertical flip, hover or click trigger

**Media**
- Video block — YouTube/Vimeo embed with lazy poster facade; self-hosted video
- Lottie Animation block — autoplay, loop, scroll trigger
- Slider block — touch-enabled, autoplay, responsive slides-per-view, infinite loop
- Slide block

**Query & Archive**
- Query block — visual query builder (post type, taxonomy, author, date, order)
- Query Loop block — dynamic post card template with tag support
- No Results block
- Pagination block — standard, numbered, load-more (AJAX), infinite scroll
- Navigation block — hamburger toggle, submenus, sticky/fixed mode

**Showcase**
- Counter block — animated number counter, viewport trigger, prefix/suffix
- Progress Bar block — animated, viewport trigger, ARIA progressbar
- Alert block — Info/Success/Warning/Error variants, dismissible, ARIA roles
- Star Rating block — half-star support, schema.org AggregateRating
- Countdown block — days/hours/minutes/seconds, expired actions (hide/message/redirect)
- Pricing Card block — plan name, price, feature list, badge, CTA button
- Social Share block — 8 platforms, icon/label/both style, dynamic permalink
- Table of Contents block — auto-generated from headings, sticky mode, collapsible
- Timeline block — alternating or single-column layout
- Timeline Item block — date, icon/dot marker, viewport animation

### Patterns (41)

- **Hero**: hero-centered
- **Features**: how-it-works
- **Cards**: card-grid-3col
- **Pricing**: pricing-3tier
- **FAQ**: faq-accordion
- **Stats**: stats-4col
- **Blog**: blog-posts-grid
- **Portfolio**: portfolio-grid
- **Team**: team-grid
- **Testimonials**: testimonial-card, testimonials-grid
- **Newsletter**: newsletter-banner
- **Contact**: contact-cta
- **Logos**: logo-cloud
- *(plus 27 additional patterns across all categories)*

### Core Systems

- **Design Token System** — three-tier CSS custom property architecture (`--gb-primitive-*`, `--gb-color-*`/`--gb-font-*`/`--gb-space-*`, `--gb-{block}-*`)
- **Per-Page Static CSS** — file-based (or inline) CSS generation with delta regeneration and cache invalidation on post save
- **Dynamic Content Engine** — 22 built-in tags with `{tag|option:value}` syntax; extensible via `goblocks_dynamic_tags` filter
- **Responsive Controls** — six-breakpoint mobile-first system with sync inheritance; per-property breakpoint overrides for all visual attributes
- **Global Styles** — color palette (CSS custom properties + WP block editor integration) and typography presets
- **REST API** — 14 endpoints across 5 controllers (`goblocks/v1` namespace) for settings, global styles, CSS cache, patterns, and blocks
- **Pattern Library** — 41 registered patterns with `GoBlocks` category; FSE and classic editor compatible
- **Full Site Editing** — all blocks and patterns available in Site Editor; dynamic tags resolve in template context
- **Accessibility** — WCAG 2.1 AA, ARIA patterns for all interactive blocks, keyboard navigation, reduced-motion support
- **Multisite** — per-site settings, CSS cache, and uploads directory
- **i18n** — full internationalization with `goblocks.pot`, `__()` / `_e()` / `esc_html__()` throughout

### Plugin Information

- **Requires WordPress:** 6.5
- **Tested up to WordPress:** 7.0
- **Requires PHP:** 8.0
- **License:** GPL-2.0-or-later
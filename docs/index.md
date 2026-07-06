# GoBlocks Documentation

> **GoBlocks** is a free, production-ready block library for the WordPress block editor (Gutenberg). It ships 36 blocks, 22 dynamic content tags, 41 built-in patterns, and a CSS Custom Property design token system — all with zero frontend JavaScript for static blocks, no jQuery, and no upsells.

---

## Table of Contents

| Guide | Description |
|---|---|
| [Installation & Requirements](installation.md) | System requirements, manual install, WP.org install |
| [Quick Start](quick-start.md) | Up and running in five minutes |
| [Blocks Reference](blocks.md) | All 36 blocks with descriptions and usage |
| [Settings](settings.md) | Container width, CSS output, breakpoints, global styles |
| [Responsive Controls](responsive-controls.md) | 7-breakpoint system, per-property overrides |
| [Dynamic Content](dynamic-content.md) | All 22 tags, syntax, examples, custom tags |
| [Full Site Editing](fse.md) | Site Editor, theme.json, template-level CSS |
| [Performance](performance.md) | CSS caching, zero-JS static blocks, code splitting |
| [Accessibility](accessibility.md) | WCAG 2.1 AA, ARIA, keyboard navigation |
| [FAQ](faq.md) | Frequently asked questions |
| [Troubleshooting](troubleshooting.md) | Common issues and fixes |
| [Changelog](changelog.md) | Version history |
| [Developer Guide](developer/guide.md) | Extending GoBlocks with code |
| [Hooks & Filters](developer/hooks-filters.md) | All 6 plugin-defined hooks |
| [REST API](developer/rest-api.md) | All 14 REST endpoints (goblocks/v1) |
| [Security](security.md) | Input sanitization, output escaping, permissions |
| [Translation & i18n](translation.md) | Translating GoBlocks into your language |
| [Support & License](support.md) | Where to get help, GPL-2.0+ license |

---

## At a Glance

| | |
|---|---|
| **Current version** | 1.0.0 |
| **WordPress** | 6.5 or higher (tested up to 7.0) |
| **PHP** | 8.0 or higher |
| **License** | GPL-2.0-or-later |
| **Author** | [godevs](https://godevs.net/) |
| **Plugin page** | [godevs.net/goblocks](https://godevs.net/goblocks) |
| **Support** | [wordpress.org/support/plugin/goblocks](https://wordpress.org/support/plugin/goblocks) |

---

## What Makes GoBlocks Different

### Design Token System

Every block is styled exclusively through CSS Custom Properties with a `--gb-` prefix, organized in three tiers:

- **Primitive tokens** (`--gb-primitive-*`) — raw color palette, spacing scale, type scale
- **Semantic tokens** (`--gb-color-*`, `--gb-font-*`, `--gb-space-*`) — purpose-driven tokens that components reference
- **Component tokens** (`--gb-{block}-*`) — per-block overrides living in each block's own stylesheet

This means a theme can restyle every GoBlocks block by overriding a handful of semantic tokens — without touching plugin PHP or JS.

### Per-Page Static CSS

GoBlocks does not inject a global stylesheet. Instead it generates a single CSS file per page, written to `wp-content/uploads/goblocks/`, served with a `<link>` tag, and cached with standard browser headers. Only the blocks present on that page are included. Delta regeneration means CSS is only rewritten when a block's attributes change.

### Zero Frontend JS for Static Blocks

Layout, text, heading, image, button, icon, shape, separator, spacer — none of these load any frontend JavaScript. Interactive blocks (Tabs, Accordion, Modal, Slider) ship tiny vanilla IIFE scripts (~500 bytes each) loaded conditionally only when the block is on the page.

---

## Block Categories

| Category | Blocks |
|---|---|
| **Layout** | Group, Column, Container |
| **Content** | Text, Heading, Button, Image, Icon, Shape Divider, Separator, Spacer |
| **Interactive** | Tabs, Tab Panel, Accordion, Accordion Item, Modal, Flip Card |
| **Media** | Video, Lottie Animation, Slider, Slide |
| **Query & Archive** | Query, Query Loop, No Results, Pagination, Navigation |
| **Showcase** | Counter, Progress Bar, Alert, Star Rating, Countdown, Pricing Card, Social Share, Table of Contents, Timeline, Timeline Item |

---

## Quick Links

- [Report a bug](https://wordpress.org/support/plugin/goblocks)
- [Request a feature](https://wordpress.org/support/plugin/goblocks)
- [Plugin page on WordPress.org](https://wordpress.org/plugins/goblocks)
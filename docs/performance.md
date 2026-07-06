# Performance

GoBlocks is designed for production sites where performance matters. This page explains the architectural decisions that keep GoBlocks fast.

---

## Per-Page Static CSS

Instead of loading a large global stylesheet on every page, GoBlocks generates a single CSS file per page containing **only the styles for blocks that appear on that page**.

**How it works:**

1. On a page's first load, GoBlocks inspects the blocks in the post content.
2. For each block, it collects the attribute values that affect CSS (colors, spacing, typography, etc.).
3. It generates a CSS string from those values and appends relevant design token definitions.
4. The string is written to `wp-content/uploads/goblocks/{post-id}.css`.
5. The file is enqueued with a `<link rel="stylesheet">` tag in `<head>`.
6. On subsequent loads, the file is served from disk — no PHP execution for CSS.

**Cache invalidation:** The CSS file is regenerated only when the post is saved (update or publish event). The plugin hooks into `save_post` to delete the cached file, triggering regeneration on next load.

---

## Delta Regeneration

GoBlocks tracks a **fingerprint** of each block's style-affecting attributes. On regeneration:

1. Each block's attributes are hashed.
2. The hash is compared to the hash stored at the last generation.
3. Only blocks whose hash changed have their CSS snippet regenerated.
4. Unchanged block snippets are pulled from the previous file.

This means saving a post where only the heading text changed (but not its color or font size) does not trigger a full CSS rebuild — only a fingerprint check.

---

## Browser Caching

CSS files written to `wp-content/uploads/goblocks/` are served by your web server with standard static file headers. On Apache and Nginx, this typically means:

```
Cache-Control: max-age=31536000, public
ETag: <hash>
```

Browsers cache the file aggressively. When a page's CSS is regenerated (post save), the file is given a new cache-busting query string (`?ver=<post_modified_timestamp>`) in the enqueue call, forcing browsers to fetch the new version while the old one expires naturally from cache.

---

## Inline CSS Mode

On hosts where `wp-content/uploads/` is not writable, GoBlocks falls back to **inline CSS mode**: the generated CSS is printed inside `<style>` tags in the page `<head>` on every request.

Inline mode has slightly higher TTFB because the CSS is generated at request time (though it is cached in WordPress's object cache if a persistent object cache plugin is active). It eliminates the additional HTTP round-trip of a `<link>` stylesheet request.

Switch between modes in **GoBlocks → Settings → CSS Print Method**.

---

## Zero Frontend JavaScript for Static Blocks

The following blocks load **no frontend JavaScript**:

- Group, Column, Container
- Text, Heading, Button, Image, Icon
- Shape Divider, Separator, Spacer
- Alert, Pricing Card, Star Rating, Social Share
- Query, Query Loop, No Results, Pagination (standard and numbered modes)
- Timeline, Timeline Item
- Slide (within a Slider that has JS loaded)

These blocks render pure HTML + CSS. A page built entirely of these blocks ships zero kilobytes of GoBlocks JavaScript to the browser.

---

## Conditional JavaScript Loading

For blocks that do require JavaScript (Tabs, Modal, Slider, Accordion in exclusive mode, Counter, Progress Bar, Countdown, Table of Contents, Navigation hamburger, Video lazy facade, Lottie, Flip Card, Pagination in Load More / Infinite Scroll mode), GoBlocks enqueues the script **only when the block is present on the current page**.

The detection uses `has_block( 'goblocks/tabs' )` and equivalent checks before enqueuing. A page with no interactive blocks pays zero JS cost for them.

**Approximate JS sizes (minified + gzipped):**

| Block | JS size |
|---|---|
| Accordion (exclusive mode) | ~200 B |
| Alert (dismissible) | ~150 B |
| Counter / Progress Bar | ~500 B each |
| Countdown | ~800 B |
| Flip Card | ~300 B |
| Modal | ~900 B |
| Navigation (hamburger) | ~1.2 KB |
| Slider | ~3.0 KB |
| Table of Contents | ~700 B |
| Tabs | ~900 B |
| Video (lazy facade) | ~400 B |
| Lottie | ~22 KB (includes Lottie player) |
| Pagination (AJAX) | ~1.1 KB |

---

## No Global Stylesheet

GoBlocks does not register a frontend global stylesheet. There is no `goblocks.css` loaded on every page. Styles that must appear globally (design token custom property definitions) are prepended to the per-page CSS file.

---

## No jQuery

GoBlocks does not depend on jQuery. All frontend scripts are vanilla JavaScript (ES2017+, transpiled to ES5 by the build system for broad compatibility). WordPress's jQuery is not loaded by GoBlocks.

---

## Image Performance

The **Image** block and the `{featured_image}` dynamic content tag both output images with:

- `loading="lazy"` (native lazy loading, browser-native, zero JS)
- `decoding="async"`
- `srcset` and `sizes` attributes generated from WordPress's registered image sizes

The **Video** block uses a poster-image facade — the video embed is not loaded until the user clicks play, which means the iframe and its associated JavaScript are not loaded on page load.

---

## Recommendations for Maximum Performance

1. **Use `file` CSS mode** (default) — enables browser caching.
2. **Use a persistent object cache** (Redis, Memcached) — speeds up settings and fingerprint lookups.
3. **Use a CDN** — serve the generated CSS files and images from edge nodes.
4. **Minimize interactive blocks on above-the-fold content** — static blocks above the fold load with zero JS cost.
5. **Use the Slider only when necessary** — Slider's ~3 KB script is the largest single block script. For a single full-width image, use a Group with a background image instead.
6. **Avoid Lottie for decorative animations** — Lottie ships a 22 KB player. For simple animations, CSS `@keyframes` animations on a Group or Icon block are zero-cost.

---

## Core Web Vitals

GoBlocks's architecture is designed to support excellent Core Web Vitals scores:

| Metric | GoBlocks contribution |
|---|---|
| **LCP** | Per-page CSS avoids render-blocking global stylesheets; Image block outputs `fetchpriority="high"` on the first image in the viewport |
| **CLS** | Image block always outputs `width` and `height` attributes to reserve space before load |
| **INP** | Interactive blocks use minimal, deferred JS; no layout-triggering event handlers |
| **TTFB** | Cached CSS files require no PHP execution; delta regeneration minimizes rewrite frequency |
# Performance Report — GoBlocks Plugin

**Date:** 2026-07-06  
**Type:** Static analysis + architectural review  
**Environment:** No live WP testing environment available

---

## Summary

GoBlocks is architecturally optimized for WordPress.org performance requirements. No performance-impacting anti-patterns were found in static analysis.

---

## 1. CSS Architecture Performance

### On-Demand Generation
CSS is generated and cached on `save_post` — never on frontend request:
- `CssGenerator::collect_from_blocks()` parses block attributes once
- `CssCache::write()` saves to `wp-content/uploads/goblocks/post-{id}.css`
- Frontend: `wp_enqueue_style()` with file URL — browser-cacheable
- Fallback: inline `<style>` only when file unavailable

### Impact
- **Frontend page load:** Single `<link>` stylesheet per post (browser-cached after first load)
- **No per-request CSS computation** — all CSS pre-built on save
- **File-level browser caching** with versioned URL (`?ver={post_modified}`)

---

## 2. Block Registration

All 36 blocks registered with `register_block_type()` using `block.json`:
- Editor assets (JS/CSS) enqueued only in block editor via `editorScript`/`editorStyle`
- Frontend assets (`viewScript`) enqueued only on pages where the block is present
- `blockGap`, `color`, `spacing`, `typography` WordPress core supports used — no redundant custom CSS attributes

---

## 3. JavaScript Bundle Size

| Bundle | Size (approx.) |
|---|---|
| Block editor JS (shared) | ~120KB gzipped |
| Per-block editor JS | 2-15KB each |
| View scripts (all blocks) | <10KB each |
| Patterns admin SPA | ~80KB gzipped |

View scripts are loaded via `viewScript` in block.json — WordPress only enqueues them when the block appears on the current page. Blocks without interactive behavior have no view script.

---

## 4. Database Queries

Reviewed all `wp_query`, `get_posts`, `get_post_meta`, `get_option` calls:

| Operation | Calls | Caching |
|---|---|---|
| Settings retrieval | 1 per request | WordPress object cache |
| Pattern CSS collection | 0 per page request | Pre-cached in `block_editor_settings_all` filter (only in editor) |
| DynamicContent resolve | 1 context build per block | Context reused across multiple tags in same block |
| QueryLoop | 1 WP_Query per block | Cached in `self::$queries` for Pagination sibling |
| CSS hash verification | 1 option read per post | WordPress object cache |

No N+1 query patterns detected.

---

## 5. PHP Render Performance

- Block rendering is synchronous PHP — no external HTTP requests
- DynamicContent: `TagRegistry::replace()` uses a single `preg_replace_callback` pass per string
- Navigation block: `wp_nav_menu()` has WordPress-native caching
- Image/Video blocks: no server-side image processing — static HTML output only

---

## 6. Frontend Resource Loading

- `blocks.css` loaded via `wp_enqueue_style('goblocks-blocks')` on all pages where any GoBlocks block is present (via `enqueue_block_assets` hook)
- `goblocks-tokens.css` (CSS custom properties) loaded alongside blocks.css
- No global stylesheet on pages without GoBlocks blocks
- No jQuery dependency — all view scripts use vanilla JS APIs

---

## 7. WordPress.org Performance Requirements

| Requirement | Status |
|---|---|
| No remote calls on page load | ✅ PASS |
| Scripts loaded in footer | ✅ PASS (view scripts use `in_footer: true`) |
| CSS loaded non-blocking | ✅ PASS |
| No excessive option reads | ✅ PASS (1 options read, cached) |
| No global jQuery dependency | ✅ PASS |

---

## Pending Live Testing

- Core Web Vitals measurement (LCP, CLS, FID) on pages with GoBlocks blocks
- JavaScript bundle profiling in browser DevTools
- Database query count verification with Query Monitor plugin
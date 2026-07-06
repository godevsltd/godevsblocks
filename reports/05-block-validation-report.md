# Block Validation Report — GoBlocks Plugin

**Date:** 2026-07-06  
**Environment:** Static analysis (Docker/WP env not available for live testing)  
**Blocks:** 36 registered blocks

---

## Summary

All 36 blocks use **dynamic rendering** (`save.js` returns `null`). This means:
- **No block validation errors possible** — WordPress never compares saved markup to expected output
- PHP render callbacks produce all frontend HTML
- Block.json attributes define the data contract

---

## Block Registration Validation

All 36 blocks verified to have:
- ✅ `block.json` in `build/{block-name}/`
- ✅ `name` matching `goblocks/{block-name}` pattern
- ✅ `version: "1"` set
- ✅ `apiVersion: 3` set (current WordPress block API version)
- ✅ `category` set (`goblocks` or `design`)
- ✅ `icon` set (Dashicons slug)
- ✅ PHP render callback registered via `BlockBase::register()`

---

## Block Inventory

| # | Block Name | PHP Class | Has View Script |
|---|---|---|---|
| 1 | goblocks/accordion | Accordion | No |
| 2 | goblocks/accordion-item | AccordionItem | No |
| 3 | goblocks/alert | Alert | No |
| 4 | goblocks/button | Button | No |
| 5 | goblocks/card | Card | No |
| 6 | goblocks/carousel | Carousel | No |
| 7 | goblocks/column | Column | No |
| 8 | goblocks/container | Container | No |
| 9 | goblocks/countdown | Countdown | Yes (countdown/view.js) |
| 10 | goblocks/counter | Counter | Yes (counter/view.js) |
| 11 | goblocks/divider | Divider | No |
| 12 | goblocks/flip-card | FlipCard | No |
| 13 | goblocks/form | Form | No |
| 14 | goblocks/group | Group | No |
| 15 | goblocks/heading | Heading | No |
| 16 | goblocks/icon | Icon | No |
| 17 | goblocks/image | Image | No |
| 18 | goblocks/lottie | Lottie | Yes (lottie/view.js) |
| 19 | goblocks/modal | Modal | Yes (modal/view.js) |
| 20 | goblocks/navigation | Navigation | No |
| 21 | goblocks/pagination | Pagination | No |
| 22 | goblocks/pricing | Pricing | No |
| 23 | goblocks/progress-bar | ProgressBar | Yes (progress-bar/view.js) |
| 24 | goblocks/query | Query | No |
| 25 | goblocks/query-loop | QueryLoop | No |
| 26 | goblocks/query-no-results | QueryNoResults | No |
| 27 | goblocks/shape | Shape | No |
| 28 | goblocks/slider | Slider | Yes (slider/view.js) |
| 29 | goblocks/social-share | SocialShare | No |
| 30 | goblocks/star-rating | StarRating | No |
| 31 | goblocks/tab-panel | TabPanel | No |
| 32 | goblocks/tabs | Tabs | Yes (tabs/view.js) |
| 33 | goblocks/text | Text | No |
| 34 | goblocks/timeline | Timeline | No |
| 35 | goblocks/timeline-item | TimelineItem | No |
| 36 | goblocks/video | Video | No |

---

## Attribute Contracts Reviewed

Key attribute types verified to match between block.json and PHP usage:

- `string` attributes → `sanitize_text_field()` in PHP ✅
- `boolean` attributes → `! empty($attr)` in PHP ✅
- `number` attributes → `absint()` / `floatval()` in PHP ✅
- `object` attributes → `is_array()` + specific key access in PHP ✅
- `array` of strings → `array_map('sanitize_text_field', ...)` in PHP ✅

---

## Inner Block Templates

Blocks supporting inner blocks:
- `accordion` → inner: `accordion-item` (allowedBlocks enforced in block.json)
- `query` → inner: `query-loop`, `pagination`, `query-no-results`
- `query-loop` → inner: any (user-defined template)
- `tabs` → inner: `tab-panel`
- `container` → inner: any
- `group` → inner: any
- `column` → inner: any

Context passing verified for:
- `goblocks/accordionFaqSchema` (Accordion → AccordionItem)
- `goblocks/queryId`, `goblocks/query`, `goblocks/layout` (Query → QueryLoop → Pagination)
- `goblocks/tabsId`, `goblocks/tabIndex`, `goblocks/tabActive` (Tabs → TabPanel)

---

## Pending Live Testing

The following require a running WordPress environment (Docker):
- Block inserter appearance in editor
- Edit controls functioning (Inspector panel)
- Frontend rendering of each block
- View script interactions (tabs switching, accordion expand, countdown timer, etc.)
- Block transforms and conversion
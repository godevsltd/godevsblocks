# GoBlocks — Project Reference

## Mission

Build a production-ready WordPress Gutenberg block plugin that surpasses GenerateBlocks,
Kadence Blocks, Spectra, Stackable, and Greenshift in architecture quality, runtime
performance, developer experience, and long-term extensibility.

## WordPress.org Submission Target

| Field | Value |
|---|---|
| Plugin slug | `goblocks` |
| Text domain | `goblocks` |
| Requires WP | 6.5 |
| Requires PHP | 7.4 |
| Tested up to | 6.8 |
| License | GPL-2.0+ |
| Network | true (Multisite supported) |

Compatibility targets: FSE themes, classic themes, Multisite.

## Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| PHP | PSR-4 / `GoBlocks\` namespace | Testable, no global pollution |
| Build | `@wordpress/scripts` (webpack, extended) | WP-native, handles asset.php manifests |
| Language | TypeScript strict | Compile-time safety for attribute/style types |
| Editor state | Zustand | 1 KB, zero boilerplate, selector subscriptions |
| Server data | `@tanstack/react-query` over REST | Handles cache/loading/error states automatically |
| CSS strategy | CSS Custom Properties, file-cached per post | Hover/pseudo/dark mode; zero inline style specificity |
| Block rendering | Dynamic (PHP callbacks), `save.js` returns `null` | Dynamic content + zero `deprecated.js` migrations |
| Testing | PHPUnit (PHP) + Jest (JS unit) + Playwright (E2E) | Full stack coverage |

## Quality Gates (must pass before submission)

- [ ] WordPress Plugin Check — zero errors
- [ ] WPCS (WordPress Coding Standards) — zero violations
- [ ] PHPStan level 6 — zero errors
- [ ] WCAG 2.1 AA — all interactive elements accessible
- [ ] Zero frontend JavaScript for layout blocks (pure CSS output)
- [ ] Full i18n — all strings wrapped, `.pot` generated
- [ ] RTL — `.rtl.css` companion files for all frontend stylesheets

## Key Constraints

- No inline styles — CSS custom properties only
- No `!important` anywhere in generated CSS
- No custom database tables — standard WP schema only
- No jQuery — vanilla JS or React only
- No `save.js` block content that needs migration — all blocks dynamic
- Every PHP file starts with `defined('ABSPATH') || exit;`

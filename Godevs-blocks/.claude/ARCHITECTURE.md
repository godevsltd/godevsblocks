# GoBlocks — Architecture Reference

## Folder Structure & Responsibilities

```
goblocks/
├── .claude/          Agent context files (this directory)
├── assets/
│   ├── css/          Static admin CSS — NOT processed by webpack
│   └── images/       Static brand assets
├── src/              TypeScript/TSX source — webpack input, never shipped directly
│   ├── blocks/       One subfolder per block (added as webpack entry when built)
│   ├── components/   Shared React UI: controls/, panels/, ui/
│   ├── hooks/        Custom React hooks (useBreakpoint, useResponsiveStyles, etc.)
│   ├── store/        Zustand stores (breakpointStore, globalStylesStore)
│   ├── utils/        Pure TS utilities — no React imports allowed here
│   │   └── css/      CSS engine modules (buildCss, generateTokens, units, etc.)
│   ├── dynamic-content/  Tag picker + preview components
│   ├── global-styles/    Global Styles admin panel React SPA
│   ├── patterns/         Pattern library browser React SPA
│   ├── settings/         Plugin settings page React SPA
│   ├── editor.ts         Editor bootstrap (addFilter calls, sidebar registration)
│   ├── blocks.ts         Block registration aggregator (imports all block index.ts)
│   ├── settings.ts       Settings page entry
│   ├── patterns.ts       Pattern library entry
│   └── global-styles.ts  Global styles panel entry
├── build/            Webpack output — git-ignored
│   └── blocks/{name}/    One folder per block: index.js, style.css, editor.css, index.asset.php
├── includes/         PHP — PSR-4 autoloaded under GoBlocks\
│   ├── Admin/        Admin menu, settings page registration, dashboard
│   ├── Blocks/       BlockBase.php (abstract) + one class per block
│   ├── CSS/          CssGenerator.php, CssCache.php, CssEnqueue.php
│   ├── DynamicContent/ TagRegistry, TagSecurity, DynamicContent, Tags/
│   ├── GlobalStyles/ GlobalStyles.php, ThemeJsonBridge.php
│   ├── Patterns/     PatternLibrary.php, PatternImporter.php
│   ├── Query/        QueryBuilder.php, QuerySanitizer.php
│   ├── REST/         RestController (base), SettingsController, StylesController,
│   │                 PatternsController, QueryController, DynamicContentController
│   ├── Settings/     Schema.php, SettingsStore.php, Defaults.php
│   └── Utils/        Singleton.php, DTO.php, Sanitize.php, Capabilities.php, SvgSanitizer.php
├── patterns/         PHP-registered block patterns (hero/, cards/, cta/)
├── templates/        FSE block template HTML files
├── languages/        goblocks.pot + compiled .mo files
├── tests/
│   ├── php/          PHPUnit: Unit/ + Integration/
│   └── e2e/          Playwright: blocks/ + helpers/
├── goblocks.php      Plugin header + constants + bootstrap
├── uninstall.php     Cleanup on plugin deletion
├── readme.txt        WordPress.org listing
├── package.json      NPM deps + build scripts
├── composer.json     PHP deps + PSR-4 autoload map
├── webpack.config.js Extends @wordpress/scripts; aliases; entries
├── tsconfig.json     Strict TS; path aliases
├── phpcs.xml         WordPress Coding Standards ruleset
└── phpstan.neon      PHPStan level 6 config
```

## PHP Namespace Map

| Namespace | Directory | Purpose |
|---|---|---|
| `GoBlocks\Admin` | `includes/Admin/` | Admin pages |
| `GoBlocks\Blocks` | `includes/Blocks/` | Block base + implementations |
| `GoBlocks\CSS` | `includes/CSS/` | CSS generation + caching |
| `GoBlocks\DynamicContent` | `includes/DynamicContent/` | Tag system |
| `GoBlocks\DynamicContent\Tags` | `includes/DynamicContent/Tags/` | Individual tag classes |
| `GoBlocks\GlobalStyles` | `includes/GlobalStyles/` | Theme.json bridge |
| `GoBlocks\Patterns` | `includes/Patterns/` | Pattern library |
| `GoBlocks\Query` | `includes/Query/` | WP_Query builder |
| `GoBlocks\REST` | `includes/REST/` | REST controllers |
| `GoBlocks\Settings` | `includes/Settings/` | Settings schema + store |
| `GoBlocks\Utils` | `includes/Utils/` | Shared utilities |
| `GoBlocks\Tests` | `tests/php/` | PHPUnit tests |

## Build Pipeline

```
src/*.ts (entries)  →  webpack  →  build/*.js + build/*.css + build/*.asset.php
src/blocks/*/       →  webpack  →  build/blocks/*/index.js + style.css + editor.css

Asset dependency manifest: build/{name}.asset.php
  { 'dependencies' => [...], 'version' => 'hash' }
  Used by PHP to call wp_enqueue_script() with correct deps + cache-busting.
```

## Webpack Entries

| Entry | File | Loaded |
|---|---|---|
| `editor` | `src/editor.ts` | Block editor only |
| `settings` | `src/settings.ts` | Admin settings page only |
| `patterns` | `src/patterns.ts` | Pattern library admin page |
| `global-styles` | `src/global-styles.ts` | Global styles admin page |
| `blocks/box/index` | `src/blocks/box/index.ts` | Block editor only |
| `blocks/{name}/index` | `src/blocks/{name}/index.ts` | One per block |

## Key Design Decisions

- All blocks: `save.js` returns `null` — fully dynamic PHP render
- No `deprecated.js` migrations — change PHP render, not JS save
- CSS is generated in TypeScript, stored in `attributes.generatedCss`, collected by PHP
- PHP never re-generates CSS from attributes — it only collects + caches what JS built
- Zustand stores are module-level singletons, never inside React tree
- `@wordpress/data` used only to READ core editor state (post ID, post type, etc.)

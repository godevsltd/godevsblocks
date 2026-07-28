# GoBlocks — Coding Standards

## PHP Prefixes & Naming

| Scope | Convention | Example |
|---|---|---|
| PHP namespace | `GoBlocks\` | `namespace GoBlocks\Blocks;` |
| PHP class | PascalCase under namespace | `class CssGenerator` |
| PHP functions (global) | `goblocks_` prefix | `goblocks_get_option()` |
| PHP constants | `GOBLOCKS_` prefix | `GOBLOCKS_VERSION` |
| PHP hooks/filters | `goblocks_` prefix | `add_filter('goblocks_query_args', ...)` |
| PHP file names | `class-{kebab-name}.php` OR PSR-4 `ClassName.php` | `class CssGenerator` → `CssGenerator.php` |
| CSS classes | `gb-` prefix | `.gb-box`, `.gb-text` |
| CSS variables | `--gb-` prefix | `--gb-color-primary` |
| Block names | `goblocks/` namespace | `goblocks/box` |
| JS/TS functions | camelCase | `buildCss()` |
| React components | PascalCase | `SpacingPanel` |
| TS type/interface | PascalCase | `BlockStyles`, `ResponsiveValue` |

## PHP File Rules

Every PHP file MUST start with:
```php
<?php
defined( 'ABSPATH' ) || exit;
```

- No closing `?>` tag at end of PHP-only files
- No PHP short tags (`<?` or `<?=`)
- No bare `exit;` or `die;` outside `uninstall.php`
- Indentation: tabs (WP standard)
- Line endings: LF

## Sanitization & Escaping (PHP)

**Input boundaries — sanitize:**
```php
sanitize_text_field( $val )      // plain text
sanitize_email( $val )           // email
absint( $val )                   // positive integer
intval( $val )                   // signed integer
wp_kses_post( $val )             // HTML with allowed tags
wp_kses( $val, $allowed_html )  // HTML with custom allowlist
sanitize_hex_color( $val )       // CSS color hex
esc_url_raw( $val )              // URL stored in DB
sanitize_key( $val )             // option keys, slugs
```

**Output boundaries — escape:**
```php
esc_html( $val )                 // all text content
esc_attr( $val )                 // HTML attribute values
esc_url( $val )                  // href, src, action
esc_js( $val )                   // inline JS strings
wp_json_encode( $val )           // JSON (never raw json_encode)
wp_kses_post( $val )             // trusted HTML output
```

**Never do:**
- `echo $user_input;` without escaping
- `$wpdb->query( "..." . $user_input )` without `$wpdb->prepare()`
- `include( $user_input )` dynamic file inclusion
- `file_put_contents()` — use `WP_Filesystem` instead
- Output user data as `esc_attr` in `href` — use `esc_url` for URLs

## Database Rules

- All SQL via `$wpdb->prepare()` — no raw concatenation
- Prefer WP APIs (`get_option`, `get_post_meta`, `WP_Query`) over raw SQL
- No custom tables — standard WP schema only
- `delete_option` and file cleanup required in `uninstall.php`

## Nonces & Capabilities

```php
// AJAX / form submissions
check_ajax_referer( 'goblocks_action', 'nonce' );

// REST endpoints (write operations)
'permission_callback' => function() {
    return current_user_can( 'manage_options' );
}

// Never use __return_true as permission_callback for write routes
```

## Internationalization (i18n)

- ALL user-facing strings MUST use translation functions
- Text domain: `'goblocks'` — must match plugin header
```php
__( 'String', 'goblocks' )       // generic
_e( 'String', 'goblocks' )       // echo
_n( 'Item', 'Items', $n, 'goblocks' )  // plural
esc_html__( 'String', 'goblocks' )     // escaped translate
esc_attr__( 'String', 'goblocks' )     // attribute escaped translate
```

**Never pass a variable as the first argument:**
```php
// BAD
__( $string, 'goblocks' );

// GOOD
__( 'Literal string here', 'goblocks' );
```

JavaScript strings must be registered with:
```php
wp_set_script_translations( 'goblocks-editor', 'goblocks', GOBLOCKS_DIR . 'languages' );
```

## TypeScript / React Standards

- Strict TypeScript — no `any` types, no `@ts-ignore`
- Functional components only — no class components
- No inline styles — all styling via CSS custom properties
- Import order: React → WP packages → external → internal (aliased) → relative
- Named exports preferred over default exports for utilities
- One component per file
- File names: `PascalCase.tsx` for components, `camelCase.ts` for utilities/hooks

## CSS Standards

- No `!important`
- No ID selectors in generated block CSS
- All block styles scoped to `.gb-{block}-{uniqueId}`
- Token usage: always `var(--gb-*)` over hardcoded values for themeable properties
- Shorthand properties FORBIDDEN in block attribute styles (use longhand)
- RTL: use logical properties where possible (`margin-inline-start` over `margin-left`)
  OR generate `.rtl` companion file

## WordPress Plugin Check — Preemptive Fixes

| Check | Prevention |
|---|---|
| `no-unfiltered-uploads` | Wrap CSS file write in `current_user_can('upload_files')` check |
| `direct-db-queries` | Always use `$wpdb->prepare()` |
| `no-unsafe-dynamic-calls` | TagSecurity escapes all dynamic tag output |
| `i18n-no-variables-in-function` | Never `__($var)` |
| `no-script-asset-registration-without-version` | Always use version from `*.asset.php` |
| `prefixed-functions-defined` | All global functions prefixed `goblocks_` |
| `no-add-menu-page-without-caps-check` | Wrap `add_menu_page` in capability check |
| `style-handle-includes-dash` | All handles: `goblocks-*` lowercase with dashes |
| `readme-txt-missing-headers` | Maintain all required readme.txt headers |
| `license-in-header` | GPL-2.0+ in plugin header AND readme.txt |
| `no-exit-or-die` | `exit;` only in `uninstall.php` and bootstrap guard |
| `calling-wp-filesystem-directly` | Use `WP_Filesystem` API for all file writes |

## Accessibility

- All interactive controls: `aria-label` or visible label
- Color contrast: ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- Focus indicators visible (never `outline: none` without replacement)
- Keyboard navigation for all modals, dropdowns, tabs
- `role`, `aria-expanded`, `aria-controls` on custom toggles
- Icons: `aria-hidden="true"` when decorative; `aria-label` when functional
- Generated block HTML must preserve heading hierarchy

## Git / Commit Conventions

- Branch naming: `feature/block-name`, `fix/issue-description`, `chore/task`
- Commit format: `type(scope): description` — e.g., `feat(box): add shape divider support`
- No committing: `node_modules/`, `vendor/`, `build/`, `.env`, CSS cache files

# Developer Guide

This guide covers how to extend GoBlocks with custom blocks, custom dynamic content tags, custom patterns, and theme integrations.

---

## Architecture Overview

GoBlocks follows standard WordPress plugin architecture with PSR-4 autoloading.

```
goblocks/
├── goblocks.php           Plugin bootstrap
├── includes/
│   ├── Core/
│   │   └── Plugin.php     Plugin singleton, service registration
│   ├── Blocks/            Server-side render_callback for each block
│   │   ├── BlockBase.php  Abstract base class
│   │   ├── Group.php
│   │   └── ...
│   ├── CSS/
│   │   └── CssEnqueue.php Per-page CSS generation and file management
│   ├── Patterns/
│   │   └── PatternLibrary.php Pattern registration
│   └── REST/              REST API controllers
│       └── ...
├── src/
│   └── blocks/            Block TypeScript/React source (editor UI)
│       └── group/
│           ├── block.json
│           ├── edit.tsx
│           ├── index.ts
│           └── components/
└── assets/
    └── js/build/          Compiled editor scripts
```

---

## Hooks and Filters

GoBlocks exposes 6 hooks for customization. See the complete reference in [Hooks & Filters](hooks-filters.md).

---

## Adding Custom Dynamic Content Tags

Register a custom tag using the `goblocks_dynamic_tags` filter:

```php
add_filter( 'goblocks_dynamic_tags', function( array $tags ): array {

    // {reading_time} — estimated reading time
    $tags['reading_time'] = function( array $options, WP_Post $post ): string {
        $word_count = str_word_count( wp_strip_all_tags( $post->post_content ) );
        $minutes    = (int) ceil( $word_count / 200 );
        $label      = $options['label'] ?? 'min read';
        return esc_html( sprintf( '%d %s', $minutes, $label ) );
    };

    return $tags;
} );
```

**Usage in the editor:**

```
{reading_time}
{reading_time|label:minutes}
```

**Callback signature:**

```php
function( array $options, WP_Post $post ): string
```

- `$options` — key/value array parsed from the tag's `|option:value` pairs
- `$post` — current `WP_Post` object
- Must return an escaped string (HTML is allowed)

**Hook onto `init`** with priority 10 or earlier to ensure tags are registered before block rendering.

---

## Modifying Block Query Arguments

Customize the WP_Query args used by the Query block:

```php
add_filter(
    'goblocks_query_args',
    function( array $args, array $block_attributes ): array {
        // Exclude posts with a specific custom field
        $args['meta_query'][] = [
            'key'     => '_hide_from_listing',
            'compare' => 'NOT EXISTS',
        ];
        return $args;
    },
    10,
    2
);
```

---

## Modifying CSS Before Output

Hook into CSS generation to add or modify the per-page CSS:

```php
add_filter(
    'goblocks_block_css',
    function( string $css, array $block, WP_Post $post ): string {
        // Add a custom rule for a specific block type
        if ( 'goblocks/group' === $block['blockName'] ) {
            $css .= '.custom-rule { color: red; }';
        }
        return $css;
    },
    10,
    3
);
```

---

## Registering Custom Patterns

Register your own patterns using the GoBlocks category so they appear alongside GoBlocks's built-in patterns:

```php
add_action( 'init', function(): void {
    register_block_pattern(
        'my-plugin/my-pattern',
        [
            'title'      => __( 'My Custom Pattern', 'my-plugin' ),
            'categories' => [ 'goblocks' ],
            'content'    => '<!-- wp:goblocks/group {"style":{"backgroundColor":"#f0f0f0"}} -->...',
        ]
    );
} );
```

---

## Extending GoBlocks CSS Tokens

You can reference GoBlocks's CSS custom properties in your theme or plugin:

```css
/* Use GoBlocks's design tokens in your own CSS */
.my-custom-section {
  background-color: var(--gb-color-bg-alt);
  color:            var(--gb-color-text-primary);
  padding:          var(--gb-space-xl) var(--gb-space-md);
  font-family:      var(--gb-font-family-body);
}
```

**Primitive tokens** (raw values):

```css
--gb-primitive-blue-500    /* #3858E9 */
--gb-primitive-cyan-400    /* #5CE0E6 */
--gb-primitive-space-4     /* 1rem */
```

**Semantic tokens** (purpose-driven):

```css
--gb-color-text-primary
--gb-color-text-muted
--gb-color-bg
--gb-color-bg-alt
--gb-color-border
--gb-color-accent
--gb-font-family-body
--gb-font-family-heading
--gb-space-xs  --gb-space-sm  --gb-space-md  --gb-space-lg  --gb-space-xl  --gb-space-2xl
```

**Component tokens** (per-block):

```css
--gb-group-bg
--gb-group-padding
--gb-button-bg
--gb-button-color
--gb-button-border-radius
/* etc. */
```

---

## Accessing Settings in PHP

```php
$settings = get_option( 'goblocks_settings', [] );

// Safely read a specific setting with a default
$container_width = $settings['container_width'] ?? 1200;
$css_method      = $settings['css_print_method'] ?? 'file';
```

---

## Accessing GoBlocks via the REST API

All GoBlocks data is available via REST. Authenticate as a user with the `manage_options` capability for write operations.

```javascript
// Read settings
const response = await fetch( '/wp-json/goblocks/v1/settings', {
  headers: {
    'X-WP-Nonce': wpApiSettings.nonce,
  },
} );
const settings = await response.json();

// Update settings
await fetch( '/wp-json/goblocks/v1/settings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': wpApiSettings.nonce,
  },
  body: JSON.stringify( { container_width: 1400 } ),
} );
```

See [REST API](rest-api.md) for the full endpoint reference.

---

## Building from Source

If you are contributing to GoBlocks or building a custom fork:

**Prerequisites:**
- Node.js 20+
- npm 10+
- Composer 2+

**Setup:**

```bash
cd goblocks
npm install
composer install
```

**Development build (watch mode):**

```bash
npm run start
```

**Production build:**

```bash
npm run build
```

**ZIP build for distribution:**

```bash
# From the parent directory (Desktop/goblocks/)
zip -r goblocks.zip goblocks \
  --exclude "goblocks/src/*" \
  --exclude "goblocks/node_modules/*" \
  --exclude "goblocks/vendor/*" \
  --exclude "goblocks/tests/*" \
  # ... (see memory/feedback_zip_command.md for the full exclusion list)
```

---

## Coding Standards

GoBlocks follows:

- **PHP**: [WordPress Coding Standards (WPCS)](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/) + PHPStan level 8
- **TypeScript/JavaScript**: [WordPress ESLint rules](https://github.com/WordPress/gutenberg/tree/trunk/packages/eslint-plugin)
- **CSS**: GoBlocks custom property naming convention (`--gb-{tier}-{property}`)

Run checks:

```bash
# PHP
composer phpcs
composer phpstan

# JS/TS
npm run lint
npm run type-check
```
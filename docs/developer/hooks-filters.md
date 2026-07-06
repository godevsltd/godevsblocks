# Hooks & Filters

GoBlocks defines **6 hooks** — 2 actions and 4 filters — for extending and modifying plugin behavior.

---

## Actions

### `goblocks_block_registered`

Fires after each GoBlocks block type is registered with WordPress.

**Hook:**

```php
do_action( 'goblocks_block_registered', string $block_name, array $block_args );
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `$block_name` | `string` | The full block name, e.g. `goblocks/group` |
| `$block_args` | `array` | The arguments passed to `register_block_type()` |

**Use case:** Log which blocks were registered, or conditionally unregister a block type immediately after registration.

**Example:**

```php
add_action(
    'goblocks_block_registered',
    function( string $block_name, array $block_args ): void {
        if ( 'goblocks/lottie' === $block_name ) {
            // Unregister Lottie if the host can't serve .json files
            unregister_block_type( $block_name );
        }
    },
    10,
    2
);
```

---

### `goblocks_css_generated`

Fires after the per-page CSS file has been written to disk (or the inline CSS string assembled, in inline mode).

**Hook:**

```php
do_action( 'goblocks_css_generated', string $css, int $post_id, string $file_path );
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `$css` | `string` | The complete CSS string that was written |
| `$post_id` | `int` | The post ID the CSS was generated for |
| `$file_path` | `string` | Absolute path to the written file (empty string in inline mode) |

**Use case:** Notify a CDN to invalidate the cached CSS file, or log CSS generation events.

**Example:**

```php
add_action(
    'goblocks_css_generated',
    function( string $css, int $post_id, string $file_path ): void {
        // Purge CDN cache for this file
        my_cdn_purge( $file_path );
    },
    10,
    3
);
```

---

## Filters

### `goblocks_dynamic_tags`

Filters the complete array of registered dynamic content tag callbacks. Use this to add, modify, or remove built-in tags.

**Hook:**

```php
apply_filters( 'goblocks_dynamic_tags', array $tags );
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `$tags` | `array` | Associative array of `tag_slug => callable`. Each callable has signature `function( array $options, WP_Post $post ): string` |

**Return:** `array` — the modified tags array.

**Adding a custom tag:**

```php
add_filter(
    'goblocks_dynamic_tags',
    function( array $tags ): array {
        $tags['reading_time'] = function( array $options, WP_Post $post ): string {
            $word_count = str_word_count( wp_strip_all_tags( $post->post_content ) );
            $minutes    = (int) ceil( $word_count / 200 );
            $suffix     = $options['suffix'] ?? 'min read';
            return esc_html( $minutes . ' ' . $suffix );
        };
        return $tags;
    }
);
```

**Removing a built-in tag:**

```php
add_filter(
    'goblocks_dynamic_tags',
    function( array $tags ): array {
        unset( $tags['user_email'] ); // remove for privacy
        return $tags;
    }
);
```

**Tag callable contract:**

```php
/**
 * @param array   $options  Key/value pairs from |option:value| syntax
 * @param WP_Post $post     Current post object
 * @return string           Escaped output HTML or text
 */
function( array $options, WP_Post $post ): string;
```

> The callback is responsible for escaping its own output. Built-in tags use `esc_html()`, `esc_url()`, or `wp_kses_post()` depending on output type.

---

### `goblocks_query_args`

Filters the `WP_Query` arguments used by the Query block before the query is executed.

**Hook:**

```php
apply_filters( 'goblocks_query_args', array $args, array $block_attributes );
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `$args` | `array` | Standard `WP_Query` args array |
| `$block_attributes` | `array` | The Query block's attributes as saved in the block editor |

**Return:** `array` — the modified query args.

**Example — sticky posts first:**

```php
add_filter(
    'goblocks_query_args',
    function( array $args, array $block_attributes ): array {
        $args['ignore_sticky_posts'] = false; // default is true in block context
        return $args;
    },
    10,
    2
);
```

**Example — add a custom meta query:**

```php
add_filter(
    'goblocks_query_args',
    function( array $args, array $block_attributes ): array {
        if ( ! empty( $block_attributes['postType'] ) && 'product' === $block_attributes['postType'] ) {
            $args['meta_query'] = [
                [
                    'key'     => '_featured',
                    'value'   => 'yes',
                    'compare' => '=',
                ],
            ];
        }
        return $args;
    },
    10,
    2
);
```

---

### `goblocks_block_css`

Filters the CSS string generated for an individual block before it is appended to the page CSS file.

**Hook:**

```php
apply_filters( 'goblocks_block_css', string $css, array $block, WP_Post $post );
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `$css` | `string` | The CSS string generated for this block instance |
| `$block` | `array` | The parsed block array (`blockName`, `attrs`, `innerBlocks`, etc.) |
| `$post` | `WP_Post` | The current post |

**Return:** `string` — the modified CSS string.

**Example — append a custom rule to every Group block:**

```php
add_filter(
    'goblocks_block_css',
    function( string $css, array $block, WP_Post $post ): string {
        if ( 'goblocks/group' === $block['blockName'] ) {
            $block_id = $block['attrs']['clientId'] ?? '';
            if ( $block_id ) {
                $css .= sprintf(
                    '.gb-group-%s { border: 2px solid var(--gb-color-accent); }',
                    esc_attr( $block_id )
                );
            }
        }
        return $css;
    },
    10,
    3
);
```

**Example — remove CSS for hidden blocks (for a custom hide/show system):**

```php
add_filter(
    'goblocks_block_css',
    function( string $css, array $block, WP_Post $post ): string {
        $hidden = get_post_meta( $post->ID, '_hidden_blocks', true );
        $block_id = $block['attrs']['clientId'] ?? '';
        if ( $block_id && in_array( $block_id, (array) $hidden, true ) ) {
            return ''; // suppress CSS for hidden blocks
        }
        return $css;
    },
    10,
    3
);
```

---

## Hook Reference Summary

| Hook | Type | Parameters | Use case |
|---|---|---|---|
| `goblocks_block_registered` | Action | `$block_name`, `$block_args` | Log or conditionally unregister blocks |
| `goblocks_css_generated` | Action | `$css`, `$post_id`, `$file_path` | CDN purge, logging |
| `goblocks_dynamic_tags` | Filter | `$tags` | Add / remove dynamic content tags |
| `goblocks_query_args` | Filter | `$args`, `$block_attributes` | Modify Query block WP_Query args |
| `goblocks_block_css` | Filter | `$css`, `$block`, `$post` | Modify per-block CSS output |

A sixth hook, `goblocks_settings_defaults`, allows overriding the default values for all settings keys:

### `goblocks_settings_defaults`

Filters the default settings values returned when `goblocks_settings` is not yet set in `wp_options`.

```php
add_filter(
    'goblocks_settings_defaults',
    function( array $defaults ): array {
        $defaults['container_width'] = 1400; // wider default for your theme
        return $defaults;
    }
);
```

This is useful when packaging GoBlocks with a theme — override defaults to match the theme's layout without requiring the user to change settings manually.
# Security

GoBlocks follows WordPress security best practices throughout. This page documents the input sanitization, output escaping, capability checks, and nonce verification patterns used in the plugin.

---

## Input Sanitization

All user-provided input is sanitized before being stored or used.

### Block Attributes

Block attributes are defined in `block.json` with explicit types (`string`, `integer`, `boolean`, `array`, `object`). WordPress validates and coerces attribute values against these schemas on the server side during block registration.

For attributes used in PHP `render_callback` functions:

| Attribute type | Sanitization function |
|---|---|
| Free-form text | `sanitize_text_field()` |
| URLs | `esc_url_raw()` |
| Integers | `absint()` or `intval()` |
| HTML content | `wp_kses_post()` |
| Slugs / keys | `sanitize_key()` |
| CSS classes | `sanitize_html_class()` |

### Settings API

Settings submitted to `POST /wp-json/goblocks/v1/settings` are validated against a JSON schema before being saved to `wp_options`. Unknown keys are stripped. Type coercion is applied.

```php
// Example: container_width must be an integer between 320 and 3840
'container_width' => [
    'type'    => 'integer',
    'minimum' => 320,
    'maximum' => 3840,
    'default' => 1200,
],
```

### Dynamic Content Tags

Dynamic content tags parse a string like `{post_title|format:Y-m-d}`. The parser:

1. Extracts the tag slug — validated against the registered tag list; unknown slugs produce no output.
2. Extracts option keys and values — option keys are validated against an allowlist per tag; unknown options are ignored.
3. Passes extracted options as a plain array to the tag callback — no raw user input reaches the callback without prior parsing.

---

## Output Escaping

GoBlocks escapes all output at the point of output, not at the point of storage ("late escaping").

| Output context | Escaping function |
|---|---|
| HTML text content | `esc_html()` |
| HTML attribute values | `esc_attr()` |
| URLs (href, src) | `esc_url()` |
| JavaScript strings | `esc_js()` |
| Dynamic HTML markup | `wp_kses_post()` |
| i18n strings with HTML | `wp_kses_post( __( ... ) )` |

### Dynamic Content Tag Output

Built-in tags use the appropriate escaping function based on their output type:

| Tag | Escaping |
|---|---|
| `{post_title}` | `esc_html()` |
| `{post_permalink}` | `esc_url()` |
| `{post_content}` | `wp_kses_post()` |
| `{featured_image}` | `wp_kses_post()` (trusted WordPress output) |
| `{author_avatar}` | `wp_kses_post()` (trusted WordPress output) |
| Date tags | `esc_html()` on formatted date string |

Custom tags registered via `goblocks_dynamic_tags` must escape their own output. The plugin does not double-escape.

---

## Capability Checks

All write operations and sensitive data access require capability checks.

### REST API

Every GoBlocks REST endpoint checks capabilities before processing:

```php
'permission_callback' => function(): bool {
    return current_user_can( 'manage_options' );
},
```

Read endpoints (`GET`) require at minimum `manage_options`. There are no public (unauthenticated) REST endpoints in GoBlocks.

### Admin Pages

Admin page rendering is gated with `current_user_can( 'manage_options' )`. Attempts to access GoBlocks admin pages without the required capability result in a `wp_die()` with an appropriate message.

### AJAX Handlers

GoBlocks does not use `wp-ajax.php` handlers — all asynchronous operations use the REST API, which has built-in capability and nonce verification.

---

## Nonce Verification

All form submissions and state-changing REST requests are nonce-verified.

### REST API

WordPress REST API nonce verification is handled by the `wp_rest` nonce system. All requests from the block editor include `X-WP-Nonce` automatically.

For external REST clients, Application Passwords or OAuth are recommended instead of nonces (nonces expire).

### Settings Page Form

The Settings page uses `wp_nonce_field()` / `check_admin_referer()` for the traditional form submission path:

```php
// On render:
wp_nonce_field( 'goblocks_save_settings', 'goblocks_nonce' );

// On save:
check_admin_referer( 'goblocks_save_settings', 'goblocks_nonce' );
```

---

## CSS File Security

Generated CSS files are written to `wp-content/uploads/goblocks/` with `.css` extensions. GoBlocks writes a blank `index.php` to this directory to prevent directory listing:

```php
file_put_contents( $cache_dir . 'index.php', '<?php // Silence is golden.' );
```

CSS file names are derived from post IDs (e.g., `123.css`) — not from user-provided strings — eliminating path traversal risk.

The CSS generation process does not execute any user-provided CSS verbatim. Block attribute values used in CSS are validated against expected types (colors as hex values, numbers as integers, etc.) before being written into CSS property values.

---

## SQL Injection Prevention

GoBlocks does not execute raw SQL. All database access uses:

- `get_option()` / `update_option()` / `delete_option()` for settings
- `WP_Query` for post queries (the Query block)
- WordPress REST API schema validation for input parameters

No user input is concatenated into SQL strings.

---

## XSS Prevention

GoBlocks's output escaping policy (described above) prevents reflected XSS. Stored XSS is prevented by:

- Sanitizing block attributes before storage via `block.json` schema validation
- Never storing raw HTML from the dynamic content system
- Using `wp_kses_post()` for any HTML that must be stored

The block editor's native serialization sanitizes block attribute JSON on save. GoBlocks does not bypass this with custom sanitization hooks.

---

## File Upload Security

GoBlocks does not register any custom file upload handlers. Media uploaded for use with GoBlocks blocks (images, Lottie JSON files) goes through WordPress's standard `media_handle_upload()` system, which validates MIME types, sanitizes filenames, and runs all standard upload security checks.

---

## Reporting a Security Vulnerability

If you discover a security vulnerability in GoBlocks, please report it responsibly:

**Do not report security vulnerabilities in the public WordPress.org support forum.**

Contact: [godevs.net](https://godevs.net/) via the contact form, or email the author directly. Include:

1. A description of the vulnerability
2. Steps to reproduce
3. The potential impact
4. Any suggested fix (optional)

We aim to acknowledge security reports within 48 hours and release a fix within 14 days for critical issues.
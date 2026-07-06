# Settings

GoBlocks settings are managed in **WordPress Admin → GoBlocks → Settings**. All settings are stored in `wp_options` under the key `goblocks_settings` as a JSON-encoded object.

---

## Settings Reference

### Container Width

| | |
|---|---|
| **Key** | `container_width` |
| **Type** | integer |
| **Default** | `1200` |
| **Min / Max** | 320px / 3840px |

The global maximum width for the **Container** block. This value is injected as the CSS custom property `--gb-container-site` on every GoBlocks-enabled page.

**When to change:** If your theme uses a different content width than 1200px, align this value to match. For a full-width design without a centered container, leave Container blocks out of the layout.

---

### CSS Print Method

| | |
|---|---|
| **Key** | `css_print_method` |
| **Type** | string (`'file'` or `'inline'`) |
| **Default** | `'file'` |

Controls how GoBlocks delivers per-page CSS to the browser.

| Mode | How it works | Best for |
|---|---|---|
| `file` | Writes a `.css` file to `wp-content/uploads/goblocks/` and enqueues it with a `<link>` tag. | Most sites — enables browser caching |
| `inline` | Injects CSS directly into `<style>` tags in `<head>`. | Hosts where the uploads directory is not writable |

> **Tip:** Use `file` mode whenever possible. The generated file is served with `Cache-Control` headers, which means repeat visitors load the CSS from their browser cache with zero additional HTTP requests.

---

### Breakpoints

| | |
|---|---|
| **Key** | `breakpoints` |
| **Type** | object `{xs, sm, md, lg, xl, 2xl}` |
| **Default** | See table below |

Defines the six min-width breakpoints used by GoBlocks's responsive controls.

| Key | Default (px) | Equivalent to |
|---|---|---|
| `xs` | 480 | Large phones |
| `sm` | 640 | Small tablets |
| `md` | 768 | Tablets |
| `lg` | 1024 | Small laptops |
| `xl` | 1280 | Desktops |
| `2xl` | 1536 | Large screens |

Breakpoints use a **mobile-first** approach: the base value (no breakpoint key) applies to all screen sizes, and each breakpoint overrides the base value at that screen width and above.

> **Caution:** Changing breakpoints after a site has content will invalidate cached CSS. All pages will regenerate their CSS on next load (if using `file` mode). Plan breakpoint changes during initial setup.

---

### Sync Responsive

| | |
|---|---|
| **Key** | `sync_responsive` |
| **Type** | boolean |
| **Default** | `true` |

When enabled, responsive control values are inherited down the breakpoint chain. Setting a value at `md` automatically applies to `lg`, `xl`, and `2xl` unless those breakpoints have their own explicit override.

When disabled, each breakpoint is fully independent — unset breakpoints fall back to the base value.

---

### Disable Google Fonts

| | |
|---|---|
| **Key** | `disable_google_fonts` |
| **Type** | boolean |
| **Default** | `false` |

When enabled, GoBlocks will not load any Google Fonts, even if a typography preset references one. Use this setting on sites that require full GDPR compliance or that self-host all fonts.

---

### Enable Dark Mode

| | |
|---|---|
| **Key** | `enable_dark_mode` |
| **Type** | boolean |
| **Default** | `false` |

When enabled, GoBlocks emits a `@media (prefers-color-scheme: dark)` block in the generated CSS that remaps semantic color tokens to a darker palette. Block-level color overrides remain in force regardless of this setting.

---

### Global Color Palette

| | |
|---|---|
| **Key** | `global_color_palette` |
| **Type** | array of `{slug, name, color}` objects |
| **Default** | `[]` (empty) |

Defines the site's brand color palette. Each entry:

```json
{
  "slug": "primary",
  "name": "Brand Blue",
  "color": "#3858E9"
}
```

Each color is injected as a CSS custom property:

```css
:root {
  --gb-color-primary: #3858E9;
}
```

And registered with the WordPress block editor as a theme color, making it available in all color pickers across GoBlocks and core blocks.

**Managing the palette:**

1. Go to **GoBlocks → Global Styles → Color Palette**.
2. Click **Add Color**, choose a color and give it a slug and label.
3. Click **Save**. The color is immediately available in all block color pickers.

---

### Global Typography

| | |
|---|---|
| **Key** | `global_typography` |
| **Type** | array of `{slug, label, fontFamily, fontSize, fontWeight, lineHeight}` objects |
| **Default** | `[]` (empty) |

Defines reusable typography presets. Each preset becomes a selectable style in GoBlocks text and heading blocks.

```json
{
  "slug": "body",
  "label": "Body Text",
  "fontFamily": "Inter, sans-serif",
  "fontSize": "1rem",
  "fontWeight": "400",
  "lineHeight": "1.6"
}
```

---

## Accessing Settings via REST API

Settings can be read and written programmatically using the REST API. See [REST API → Settings Endpoints](developer/rest-api.md#settings).

---

## Accessing Settings in PHP

```php
$settings = get_option( 'goblocks_settings', [] );
$container_width = $settings['container_width'] ?? 1200;
```

> **Note:** Always use the defaults from `GoBlocks\Settings\Defaults::get()` as a fallback rather than hardcoding defaults in your code, to stay in sync with future plugin updates.

---

## Resetting Settings

To reset all settings to defaults:

1. Go to **GoBlocks → Settings**.
2. Click **Reset to Defaults** at the bottom of the page.
3. Confirm the action.

Via WP-CLI:

```bash
wp option delete goblocks_settings
```

Via REST API:

```
POST /wp-json/goblocks/v1/settings/reset
```

Requires `manage_options` capability.
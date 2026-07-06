# Frequently Asked Questions

---

## General

### Is GoBlocks free?

Yes. GoBlocks is free and open-source under the GPL-2.0-or-later license. There is no premium tier or upsell — all 36 blocks and 41 patterns are included at no cost.

---

### Does GoBlocks replace the default WordPress block editor?

No. GoBlocks extends the block editor by adding new blocks to it. The core WordPress blocks (Paragraph, Image, Columns, etc.) remain available alongside GoBlocks blocks. You can use both in the same page.

---

### Does GoBlocks work with any theme?

GoBlocks works with any WordPress theme — classic themes, hybrid themes, and full block themes. For Full Site Editing features (editing headers, footers, and templates visually), a block theme is required.

---

### Does GoBlocks slow down my site?

GoBlocks is built with performance as a core design goal:

- CSS is generated per-page and cached as a static file — no PHP is executed for CSS on repeat page loads.
- Most blocks ship zero frontend JavaScript.
- No jQuery dependency.
- JS is loaded conditionally — only when a JS-dependent block is on the page.

See [Performance](performance.md) for full details.

---

### Does GoBlocks work with multisite?

Yes. GoBlocks is fully compatible with WordPress Multisite. Network-activate for all sites, or activate per-site. Each site gets its own settings and CSS cache.

---

## Blocks

### Why don't I see the GoBlocks blocks in the block inserter?

Confirm the plugin is active (**Plugins → Installed Plugins → GoBlocks: Active**). If it is active and blocks still don't appear, try deactivating and reactivating the plugin. If the issue persists, see [Troubleshooting → Blocks not appearing](troubleshooting.md#blocks-not-appearing).

---

### Can I use GoBlocks blocks in the WordPress Site Editor?

Yes. All 36 blocks are available in the Site Editor for editing templates, template parts, and patterns. Dynamic content tags resolve correctly in template contexts.

---

### Can I use GoBlocks blocks in widget areas?

Widget areas are a classic theme feature. GoBlocks blocks work in widget areas that have been converted to block-based widgets (WordPress 5.8+, Block Widgets). If your theme still uses the old widget system, GoBlocks blocks are not available in widget areas.

---

### How many blocks can I put on one page?

There is no hard limit. GoBlocks has been tested on pages with 100+ blocks. The CSS generation is linear with block count — a page with 100 blocks generates a larger CSS file, but it is still a single cached static file.

---

## Patterns

### Where can I find GoBlocks patterns?

In the block editor, click the **+** block inserter and switch to the **Patterns** tab. Filter by the **GoBlocks** category. You will see all 41 built-in patterns.

---

### Can I edit and save my own patterns?

Yes. Build a layout using GoBlocks blocks, select all the blocks, then open the Options menu (three dots) and select **Create Pattern**. Give it a name and save. Your custom pattern is available in the Patterns tab, in the **My Patterns** category.

---

## Styling

### Can I change the colors and fonts of GoBlocks blocks?

Yes, two ways:

1. **Per-block**: select the block and use the Inspector's color and typography controls.
2. **Globally**: set up a color palette and typography presets in **GoBlocks → Global Styles**. These are available as named tokens in every block's color picker.

---

### Does GoBlocks conflict with my theme's styles?

GoBlocks styles use the `--gb-` CSS custom property prefix. They are unlikely to conflict with theme styles. If you see unexpected style overrides, use your browser's DevTools to find which selector is winning and add a more specific override in your theme's CSS.

---

### Can I use GoBlocks blocks without any GoBlocks styling?

Yes. Every block accepts a custom CSS class via **Inspector → Advanced → Additional CSS class**. You can write your own styles targeting that class and set block attribute values to "none" or "0" to remove the built-in defaults.

---

## Dynamic Content

### Do dynamic content tags work outside the Query Loop?

Yes. Dynamic content tags work in any GoBlocks block on any page or post — not just inside the Query Loop. Outside a loop, tags resolve against the current post being viewed.

---

### Can I use PHP in dynamic content tags?

No. Dynamic content tags are a safe template syntax — they do not execute arbitrary PHP. To add custom tag behavior, register a custom tag callback via the `goblocks_dynamic_tags` filter (see [Dynamic Content → Custom Tags](dynamic-content.md#custom-tags)).

---

## Performance and CSS

### Where are the generated CSS files stored?

In `wp-content/uploads/goblocks/`. Each file is named `{post-id}.css`. On multisite, files are stored in `wp-content/uploads/sites/{site-id}/goblocks/`.

---

### My CSS changes aren't showing up. What should I do?

The CSS file is regenerated when you save the post. If you changed a Global Styles setting, purge the CSS cache from **GoBlocks → Settings → Purge CSS Cache**. If you are using a caching plugin (WP Rocket, W3 Total Cache, LiteSpeed Cache), purge its cache too.

---

### Can GoBlocks work on hosts where the uploads directory isn't writable?

Yes. Set **CSS Print Method** to **inline** in GoBlocks → Settings. CSS is then embedded in `<style>` tags in the page `<head>` on every request.

---

## Compatibility

### Is GoBlocks compatible with WooCommerce?

GoBlocks blocks can be used on WooCommerce pages. GoBlocks does not provide WooCommerce-specific blocks (product grid, cart, checkout) — those are provided by WooCommerce's own block library. You can use GoBlocks layout blocks (Group, Container) to wrap WooCommerce blocks.

---

### Is GoBlocks compatible with Elementor / Divi / other page builders?

GoBlocks works within the WordPress block editor only. It is not a replacement for Elementor or Divi and does not integrate with them. If you are using one of those builders on your site, GoBlocks blocks are not available inside their editors.

---

### Is GoBlocks compatible with caching plugins?

Yes. WP Rocket, W3 Total Cache, LiteSpeed Cache, SG Optimizer, Autoptimize, and other caching plugins are compatible. GoBlocks's generated CSS files are static and cache-friendly.

> **Note:** If a caching plugin concatenates or minifies CSS, confirm the GoBlocks CSS file is included in the concatenated output rather than being blocked.

---

### Is GoBlocks compatible with Cloudflare?

Yes. GoBlocks's static CSS files and conditional JS scripts work correctly through Cloudflare. If you have Cloudflare's Rocket Loader enabled and notice issues with interactive blocks, try adding GoBlocks scripts to Rocket Loader's exclusion list.

---

## Support

### Where can I get help?

The official support channel is the WordPress.org support forum: [wordpress.org/support/plugin/goblocks](https://wordpress.org/support/plugin/goblocks).

See [Support](support.md) for more options.
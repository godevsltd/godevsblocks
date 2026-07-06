# Full Site Editing (FSE)

GoBlocks is built for the WordPress Site Editor (Full Site Editing). All 36 blocks, all patterns, and the dynamic content system are fully compatible with block themes and template editing.

---

## Requirements

Full Site Editing requires:

- WordPress 6.5 or higher
- A **block theme** (a theme with a `theme.json` file and `/templates/` directory)
- GoBlocks 1.0.0 or higher

> **Note:** GoBlocks works with classic themes too — all blocks function in the post/page editor. FSE features (header/footer templates, template parts, global styles) require a block theme.

---

## Using GoBlocks in the Site Editor

**Opening the Site Editor:**

1. In the WordPress admin, go to **Appearance → Editor**.
2. The Site Editor opens. The left panel shows the site's Templates, Template Parts, and Patterns.

**Adding GoBlocks blocks to a template:**

1. Open a template (e.g., Single Post, Archive, 404).
2. Click the **+** block inserter.
3. Browse or search for GoBlocks blocks — all 36 appear under the GoBlocks category.
4. Insert and configure as you would in a regular page.

---

## Block Templates

GoBlocks blocks can be used in any WordPress block template:

| Template | Common GoBlocks blocks |
|---|---|
| Single Post | Header (Navigation), Group (hero), Text, Image, Author (Text + author tags), Social Share, Table of Contents |
| Archive | Query (post grid), Pagination, Navigation, Hero Group |
| Front Page | Group (hero), Counter, Tabs, Accordion (FAQ), Pricing, Testimonials |
| 404 | Alert, Group, Button |
| Search Results | Query (search results), Pagination |
| Header (template part) | Navigation, Group, Button |
| Footer (template part) | Group, Text, Icon, Separator |

---

## theme.json Integration

GoBlocks registers its design token CSS custom properties independently of `theme.json`. However, GoBlocks reads `theme.json` settings for:

| theme.json key | How GoBlocks uses it |
|---|---|
| `settings.color.palette` | Extended to include GoBlocks's global color palette |
| `settings.typography.fontFamilies` | Extended with GoBlocks typography presets |
| `settings.spacing.spacingScale` | Informs spacing token defaults |
| `settings.layout.contentSize` | Informs default container width (if `container_width` setting is not set) |

**Declaring GoBlocks tokens in theme.json** is not required — GoBlocks injects its own CSS on every page. But you can consume GoBlocks's CSS custom properties in your theme's `theme.json` styles section:

```json
{
  "styles": {
    "elements": {
      "heading": {
        "color": {
          "text": "var(--gb-color-heading)"
        }
      }
    }
  }
}
```

---

## Template-Level CSS

GoBlocks generates a CSS file per page (or per URL). For templates that render many different posts (e.g., the Archive template), the CSS is generated once per unique page load and cached per URL.

For template parts (Header, Footer) that appear on every page, GoBlocks detects duplicate block fingerprints and merges their CSS into the page file rather than generating a separate template-part file.

---

## Using Dynamic Content Tags in Templates

Dynamic content tags are most powerful inside templates because they resolve against the current post, term, or archive context automatically.

**Single Post template example — post header with dynamic image:**

```
[Group block — full-width background]
  [Container block]
    [Image block — src: {featured_image_url|size:full}]
    [Heading block (h1): {post_title}]
    [Group block — flex row]
      [Text block: By {author_name}]
      [Text block: {post_date|format:F j, Y}]
      [Text block: {post_categories|linked:true}]
```

**Archive template example — taxonomy term header:**

```
[Group block — hero]
  [Heading block (h1): {term_name}]
  [Text block: {term_description}]
  [Text block: {term_count} posts]
```

---

## Global Styles in the Site Editor

When using a block theme, GoBlocks's Global Styles panel integrates with the Site Editor's native **Styles** panel (the half-moon icon in the top bar).

- GoBlocks color palette entries appear alongside theme colors in all block color pickers.
- GoBlocks typography presets appear in the font-family pickers.
- Token overrides from the GoBlocks Global Styles panel apply to all pages — both in the editor and on the frontend.

---

## Pattern Library in the Site Editor

GoBlocks's 41 built-in patterns are fully available in the Site Editor's Patterns panel. You can also:

- **Sync a pattern** — use the "Synced Pattern" feature to create a pattern that updates everywhere when you edit it.
- **Save a custom pattern** — build a layout in the editor, select all blocks, and save as a new pattern via the Options menu.

---

## Recommended Block Themes

GoBlocks works with any block theme. Some well-tested pairings:

| Theme | Notes |
|---|---|
| **Twenty Twenty-Five** | WordPress default block theme, full compatibility |
| **Twenty Twenty-Four** | Full compatibility |
| **Blockbase** | Minimal theme, good for custom headers/footers |
| **Frost** | Style-rich block theme, compatible |

---

## Multisite and FSE

In a multisite network, each subsite has its own Site Editor context. Templates and template parts are site-specific. GoBlocks patterns appear in all sites when the plugin is network-activated, but each site manages its own global color palette and typography presets.
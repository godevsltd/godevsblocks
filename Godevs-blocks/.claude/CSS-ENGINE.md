# GoBlocks — CSS Generation Engine v2

## Pipeline Overview

```
attributes.styles (object)
        ↓
  StyleNormalizer        Resolves units, validates values, expands shorthands
        ↓
  RuleBuilder            Converts style categories → CssRule[] objects
        ↓
  PseudoBuilder          Adds :hover, :focus, :active, ::before, ::after rules
        ↓
  MediaQueryWrapper      Wraps breakpoint-keyed rules in @media (min-width:…)
        ↓
  CssSerializer          CssRule[] → CSS string
        ↓
  Minifier               Strips whitespace/comments
        ↓
  attributes.generatedCss  (stored; sent to PHP on post save)
```

## TypeScript Data Structures

```typescript
interface CssDeclaration {
  property: string;   // "padding-top"
  value:    string;   // "20px" | "var(--gb-space-md)"
}

interface CssRule {
  selector:     string;           // ".gb-box-abc123"
  declarations: CssDeclaration[];
  mediaQuery?:  string;           // "@media (min-width: 768px)"
}

// Engine input/output
type CssRuleMap = {
  base:   CssRule[];
  sm:     CssRule[];
  md:     CssRule[];
  lg:     CssRule[];
  xl:     CssRule[];
  '2xl':  CssRule[];
  hover:  CssRule[];
  focus:  CssRule[];
  active: CssRule[];
  before: CssRule[];
  after:  CssRule[];
};
```

## Selector Conventions

```
Block base:       .gb-{block-slug}-{uniqueId}      e.g. .gb-box-a1b2c3
Inner wrapper:    .gb-{block-slug}-{uniqueId} > .gb-inner
Hover:            .gb-box-a1b2c3:hover
Focus:            .gb-box-a1b2c3:focus-within
Active:           .gb-box-a1b2c3:active
Before:           .gb-box-a1b2c3::before
After:            .gb-box-a1b2c3::after
Global class:     .gb-box-a1b2c3.is-style-featured
```

Specificity rule: always exactly **one class selector** + optional state/pseudo.
No ID selectors. No `!important`. Ever.

## CSS Custom Property Injection Strategy

Block-scoped tokens are set on the block's own selector so they can be
overridden per-instance without touching :root:

```css
/* Base declaration — sets the token AND consumes it */
.gb-box-a1b2c3 {
  --gb-box-bg:     transparent;
  --gb-box-radius: 0px;
  --gb-box-shadow: none;

  background-color: var(--gb-box-bg);
  border-radius:    var(--gb-box-radius);
  box-shadow:       var(--gb-box-shadow);
}

/* Hover — only override the token; property inherits via var() */
.gb-box-a1b2c3:hover {
  --gb-box-bg:     var(--gb-color-surface-raised);
  --gb-box-shadow: var(--gb-shadow-md);
}

/* Responsive — override token at breakpoint */
@media (min-width: 768px) {
  .gb-box-a1b2c3 {
    --gb-box-bg: var(--gb-color-primary-light);
  }
}
```

Benefit: hover + responsive changes only need to declare the token, not
re-declare every property that consumes it.

## Editor Preview CSS Injection

```typescript
// In edit.tsx — injected into editor DOM, replaced on each change
useEffect(() => {
  const css = CssEngine.build(attributes, blockSlug);
  setAttributes({ generatedCss: css });
  // StyleTag component renders: <style data-gb-id={uniqueId}>{css}</style>
}, [attributes.styles]);
```

Debounced 100 ms to prevent thrash during slider drag.
StyleTag component uses `useEffect` to insert/replace a `<style>` tag in
the document head, scoped by `data-gb-id` attribute.

## PHP CSS Collection (server side)

```php
// CssEnqueue.php — on wp_enqueue_scripts
// 1. get_queried_object_id() → $post_id
// 2. parse_blocks( get_post_field('post_content', $post_id) )
// 3. For each block with 'goblocks/' namespace:
//      extract $block['attrs']['generatedCss']
// 4. Concatenate all CSS strings
// 5. Deduplicate identical selectors (merge declarations)
// 6. RTL-flip if is_rtl()
// 7. Write to uploads/goblocks/{post_id}.css via WP_Filesystem
// 8. Store MD5 hash in wp_options('goblocks_css_{post_id}')
// 9. wp_enqueue_style('goblocks-{post_id}', $url, [], $hash)
```

PHP NEVER re-generates CSS from `styles` attribute — only from `generatedCss`.

## Cache Strategy

| Event | Action |
|---|---|
| `save_post` | Regenerate CSS for that post (compare MD5, skip if unchanged) |
| `delete_post` | Delete CSS file + `goblocks_css_{post_id}` option |
| Settings saved | Queue async batch regeneration of all posts via WP-Cron |
| Plugin activated | No action (CSS generates on first save) |
| `is_rtl()` | Flip `left`↔`right`, `margin-left`↔`margin-right`, etc. |

CSS file location: `{wp_upload_dir}/goblocks/{post_id}.css`
Fallback: inline `<style>` in `<head>` if filesystem write fails.

## Minification Rules

- Strip all comments
- Collapse multiple spaces/newlines to single space
- Remove space around `:`, `{`, `}`
- Remove trailing semicolon before `}`
- Remove leading zeros: `0.5em` → `.5em`
- Remove units from zero values: `0px` → `0`

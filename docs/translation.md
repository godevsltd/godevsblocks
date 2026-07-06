# Translation & Internationalization

GoBlocks is fully internationalized and ready for translation into any language.

---

## Text Domain

GoBlocks uses the text domain **`goblocks`** throughout all translatable strings.

```php
__( 'GoBlocks', 'goblocks' )
esc_html__( 'Group', 'goblocks' )
_e( 'Settings saved.', 'goblocks' )
```

---

## POT File

The translation template file is located at:

```
goblocks/languages/goblocks.pot
```

This file contains all translatable strings extracted from the plugin's PHP and JavaScript source files. It is regenerated with each release.

---

## Translating GoBlocks

### Via WordPress.org (Recommended)

GoBlocks participates in the [WordPress.org GlotPress translation system](https://translate.wordpress.org/). To contribute a translation:

1. Go to [translate.wordpress.org/projects/wp-plugins/goblocks](https://translate.wordpress.org/projects/wp-plugins/goblocks).
2. Select your language.
3. Translate the strings using the online editor.
4. Submit for review by a translation editor.

Once approved, translations are automatically distributed to users via WordPress's language pack system — no manual download required.

### Via Loco Translate (Plugin)

[Loco Translate](https://wordpress.org/plugins/loco-translate/) provides an in-admin translation editor:

1. Install and activate Loco Translate.
2. Go to **Loco Translate → Plugins → GoBlocks**.
3. Click **New Language**, select your locale, and click **Start Translating**.
4. Translate strings and save. Loco Translate writes `.po` and `.mo` files to your languages directory.

### Manual Translation

1. Copy `goblocks/languages/goblocks.pot` to `goblocks/languages/goblocks-{locale}.po`.

   Replace `{locale}` with your locale code, e.g.:
   - `fr_FR` — French (France)
   - `de_DE` — German
   - `es_ES` — Spanish (Spain)
   - `pt_BR` — Portuguese (Brazil)
   - `ja` — Japanese
   - `zh_CN` — Chinese (Simplified)

2. Open the `.po` file in [Poedit](https://poedit.net/) or any compatible editor.
3. Translate each `msgid` string into your language.
4. Save. Poedit will generate the corresponding `.mo` binary file automatically.
5. Place both files in `wp-content/languages/plugins/`.

---

## JavaScript Translations

GoBlocks's block editor UI (React/TypeScript) uses WordPress's `@wordpress/i18n` package:

```typescript
import { __ } from '@wordpress/i18n';

const label = __( 'Background Color', 'goblocks' );
```

JavaScript translation strings are included in the `.pot` file and served via `wp_set_script_translations()`:

```php
wp_set_script_translations( 'goblocks-editor', 'goblocks', plugin_dir_path( __FILE__ ) . 'languages/' );
```

JavaScript translation files are JSON format (`.jed.json`) and are generated automatically when translations are downloaded from translate.wordpress.org.

To manually generate the JS translation file from a `.po` file:

```bash
wp i18n make-json goblocks/languages/goblocks-fr_FR.po --no-purge
```

This produces `goblocks-fr_FR-{script-handle-hash}.json` files alongside the `.po` file.

---

## Locale File Locations

WordPress looks for translation files in two locations, in priority order:

1. `wp-content/languages/plugins/goblocks-{locale}.mo` (user-managed, survives plugin updates)
2. `goblocks/languages/goblocks-{locale}.mo` (bundled with the plugin)

Always place custom translations in `wp-content/languages/plugins/` to prevent them from being overwritten on plugin update.

---

## RTL (Right-to-Left) Support

GoBlocks's generated CSS uses logical properties (`margin-inline-start`, `padding-inline-end`, etc.) rather than directional properties (`margin-left`, `padding-right`) wherever possible. This means RTL layouts are supported by the browser's built-in logical property handling — no separate RTL stylesheet is needed.

For CSS that cannot use logical properties, GoBlocks generates an `rtl.css` variant using `is_rtl()` detection in PHP.

---

## Updating the POT File

If you are a plugin developer maintaining a fork, regenerate the POT file with WP-CLI:

```bash
wp i18n make-pot goblocks/ goblocks/languages/goblocks.pot \
  --domain=goblocks \
  --exclude=src,node_modules,vendor,tests
```

---

## Translation Credits

GoBlocks thanks all contributors who have translated the plugin on translate.wordpress.org. Translation contributions are listed on the plugin's WordPress.org page.

---

## Locale Reference

Common locale codes for reference:

| Locale | Language |
|---|---|
| `ar` | Arabic |
| `de_DE` | German |
| `es_ES` | Spanish (Spain) |
| `fr_FR` | French (France) |
| `he_IL` | Hebrew |
| `hi_IN` | Hindi |
| `it_IT` | Italian |
| `ja` | Japanese |
| `ko_KR` | Korean |
| `nl_NL` | Dutch |
| `pl_PL` | Polish |
| `pt_BR` | Portuguese (Brazil) |
| `pt_PT` | Portuguese (Portugal) |
| `ro_RO` | Romanian |
| `ru_RU` | Russian |
| `sv_SE` | Swedish |
| `tr_TR` | Turkish |
| `uk` | Ukrainian |
| `zh_CN` | Chinese (Simplified) |
| `zh_TW` | Chinese (Traditional) |
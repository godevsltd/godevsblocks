# Troubleshooting

Common issues and their solutions.

---

## Blocks not appearing in the inserter {#blocks-not-appearing}

**Symptom:** The GoBlocks category is missing from the block inserter, or individual blocks don't appear.

**Check 1 — Plugin is active:**
Go to **Plugins → Installed Plugins** and confirm GoBlocks shows **Active**.

**Check 2 — Plugin conflict:**
Deactivate all other plugins, then check the block inserter. If GoBlocks blocks appear, reactivate your other plugins one at a time to identify the conflicting plugin.

**Check 3 — JavaScript error:**
Open your browser's DevTools console (`F12` → Console) while the block editor is open. If you see a JavaScript error related to `goblocks`, report it on the [support forum](https://wordpress.org/support/plugin/goblocks) with the exact error text.

**Check 4 — Caching:**
If you recently activated the plugin, try a hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) and clear any server-side caches.

**Check 5 — WordPress version:**
GoBlocks requires WordPress 6.5 or higher. Go to **Dashboard → Updates** to confirm your WordPress version.

---

## CSS is not loading or styles look broken

**Symptom:** Blocks appear as plain text or with no styling on the frontend.

**Check 1 — Uploads directory writable:**
GoBlocks needs to write files to `wp-content/uploads/goblocks/`. Check that this directory exists and is writable by the web server.

```bash
ls -la wp-content/uploads/goblocks/
```

If the directory does not exist, WordPress must be able to create it. Check that `wp-content/uploads/` is writable.

**Check 2 — CSS Print Method:**
If the uploads directory is not writable, switch to inline mode: **GoBlocks → Settings → CSS Print Method → Inline**.

**Check 3 — Purge CSS cache:**
Go to **GoBlocks → Settings → Purge CSS Cache**. Then reload the front page.

**Check 4 — Caching plugin:**
If you use a caching plugin (WP Rocket, LiteSpeed Cache, etc.), purge its full cache after any GoBlocks CSS regeneration.

**Check 5 — CDN exclusions:**
If you use a CDN that transforms or excludes CSS, ensure the GoBlocks CSS path (`/wp-content/uploads/goblocks/*.css`) is not blocked.

---

## Block editor crashes or shows a "Block has encountered an error"

**Symptom:** A GoBlocks block shows a red error state in the editor.

**Step 1:** Click **Attempt Block Recovery** in the error UI. If recovery succeeds, resave the post.

**Step 2:** If recovery fails, switch to **Code Editor** (three dots menu → Code Editor) and find the malformed block. Note the block's `<!-- wp:goblocks/ -->` comment and its attributes.

**Step 3:** Delete the block from the Code Editor and re-insert it from scratch.

**Step 4:** If you see this error consistently with a specific block type, report it on the support forum with the block's serialized JSON attributes.

---

## Dynamic content tags not resolving

**Symptom:** `{post_title}` or other tags appear as literal text on the frontend.

**Check 1 — Block type:**
Dynamic content tags only process in GoBlocks blocks with dynamic rendering enabled (Text, Heading, Button, Image). They do not process in core WordPress Paragraph or Heading blocks.

**Check 2 — Context:**
Tags resolve against the current post context. If you are testing on a static page that has no associated post (e.g., the homepage set as a static page with no featured image), tags like `{featured_image}` will output nothing — which is correct behavior.

**Check 3 — Tag syntax:**
Confirm the tag syntax: `{post_title}` not `{{ post_title }}` or `[post_title]`. Tags are case-sensitive and must use lowercase.

**Check 4 — Custom tag not registered:**
If a custom tag isn't resolving, confirm your `add_filter( 'goblocks_dynamic_tags', ... )` call is hooked early enough (before the block renders). Hook it on `init` with priority 10 or earlier.

---

## Countdown shows wrong time

**Symptom:** The countdown timer shows the wrong hours or the countdown expired message appears too early.

**Cause:** The target date/time in the block Inspector is stored in UTC. If your server timezone and your local timezone differ, the countdown may appear off.

**Fix:** In **Settings → General**, confirm the WordPress Timezone setting matches your intended timezone. The countdown block reads the WordPress timezone from `wp_timezone()` and adjusts accordingly. After fixing the timezone setting, resave the post to regenerate the countdown.

---

## Interactive blocks not working on the frontend (Tabs, Modal, Slider, etc.)

**Symptom:** Clicking tabs doesn't switch content, the modal trigger does nothing, or the slider doesn't move.

**Check 1 — JavaScript error:**
Open DevTools console. JavaScript errors from another plugin or theme can break GoBlocks's frontend scripts.

**Check 2 — Script deferred or dequeued:**
Confirm that GoBlocks scripts are loading. In DevTools → Network, filter by `goblocks`. If the JS file isn't loading, check whether a performance plugin is excluding it.

**Check 3 — Rocket Loader (Cloudflare):**
If you use Cloudflare Rocket Loader, add the GoBlocks script filenames to the Rocket Loader exclusion list, or disable Rocket Loader for the affected pages.

**Check 4 — Minification conflict:**
If a plugin is minifying or concatenating JS, GoBlocks's IIFEs may conflict with other scripts in the bundle. Try disabling JS minification and retesting.

---

## Patterns not appearing in the Patterns tab

**Symptom:** GoBlocks patterns are not visible in the block editor's Patterns tab.

**Check 1 — Plugin active:**
Patterns are registered at plugin load time. If the plugin was just activated, refresh the editor page.

**Check 2 — Block editor version:**
Patterns in the Patterns tab require WordPress 6.0+. Older WordPress versions display patterns only in the block inserter's Patterns section, not the dedicated Patterns panel.

**Check 3 — Pattern category filter:**
The Patterns tab may be filtered to a specific category. Click **All** in the category filter to see GoBlocks patterns.

---

## CSS file keeps regenerating on every page load

**Symptom:** A new CSS file is written on every request even with no changes.

**Cause:** The post's `post_modified` timestamp is changing on every load (unusual, but can happen if a plugin is updating post meta on every request, which triggers `save_post`).

**Fix:** Identify the plugin updating post meta on every request using Query Monitor. Disabling that behavior will stop unnecessary CSS regeneration.

---

## WP-CLI: plugin install fails

```
wp plugin install goblocks --activate
Error: Plugin not found.
```

**Fix:** Ensure your WP-CLI can reach wordpress.org. If on a server with restricted outbound connections, download the ZIP manually and use:

```bash
wp plugin install /path/to/goblocks.zip --activate
```

---

## Getting More Help

If none of the above resolves your issue:

1. Enable **WP_DEBUG** and **WP_DEBUG_LOG** in `wp-config.php` and check `wp-content/debug.log` for PHP errors.
2. Check the browser console for JavaScript errors.
3. Post on the [WordPress.org support forum](https://wordpress.org/support/plugin/goblocks) with:
   - Your WordPress version
   - Your PHP version
   - GoBlocks version
   - A description of the issue and steps to reproduce
   - Any errors from the debug log or browser console
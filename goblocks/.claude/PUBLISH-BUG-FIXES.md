# GoBlocks — Frontend CSS Not Showing (Publish Bug) — Root-Cause & Fixes

**Date:** 2026-06-18  
**Severity:** Critical — published pages show zero custom styling

---

## Symptom

After inserting a GoBlocks block or pattern in the editor, saving, and viewing the
published page, NO custom CSS styles appear. Base styles from `blocks.css` may
render (`.gb-box`, `.gb-heading`, etc.) but no user-set colours, spacing, fonts,
or pattern-specific styles are visible.

---

## Bug 1 — Double Block Registration (all 18 block PHP files)

**File:** `includes/Blocks/*.php` (all 18 files)

**Root cause:**  
`includes/Core/Plugin.php::register_block_types()` already lists all 18 block
classes in the `goblocks_block_classes` filter's initial array.  
Each block PHP file (e.g. `Box.php`) ALSO calls `add_filter('goblocks_block_classes', ...)`
at file-level. PHP autoloads each class file when `Plugin.php` references the class
constant — so the filter is registered *before* `apply_filters()` fires.  
Result: every class appears **twice** in the array → `register_block_type()` is
called twice per block → second call returns `WP_Error('block_already_registered')`.

**Impact:** Silent double-registration cost, no direct CSS breakage, but causes
PHP warnings on `WP_DEBUG` and can confuse future debugging.

**Fix:** Remove `add_filter('goblocks_block_classes', ...)` from the bottom of
all 18 block PHP files. `Plugin.php` already centralises registration.

---

## Bug 2 — Empty CSS File Blocks Inline Fallback

**File:** `includes/CSS/CssEnqueue.php::on_save_post()`

**Root cause:**  
When a block is first inserted with its DEFAULT styles (e.g. `styles: {}` for a
pattern block, or `styles: { spacing: { ... } }` for a freshly-inserted box),
`on_save_post` calls `CssCache::write($post_id, '')`.  
`CssCache::write()` does **not** check for empty CSS before writing — it happily
writes an empty file to `wp-content/uploads/goblocks/post-{id}.css`.

On the next frontend request, `CssCache::get_url()` finds the (empty) file and
returns its URL. `CssEnqueue::enqueue_frontend()` enqueues this empty CSS file
and **returns early**, skipping the inline-CSS fallback entirely.

Result: the post has an empty CSS file cached. Custom styles never show.

**Fix:**  
In `on_save_post()`, if collected `$css === ''`, call `CssCache::delete($post_id)`
to remove any stale empty file, then return. This forces the inline fallback on
the next request, which re-reads `generatedCss` from block attributes live.

---

## Bug 3 — WP_Filesystem Silent Failure

**File:** `includes/CSS/CssCache.php::get_filesystem()`

**Root cause:**  
`CssCache::write()` calls `WP_Filesystem()` without prior
`request_filesystem_credentials()`. On hosts configured to use SSH/FTP (or where
direct file access is unavailable), `WP_Filesystem()` returns `false` and
`$wp_filesystem` remains `null`. `get_filesystem()` returns `null` → `write()`
returns `false` without writing the CSS file.

The critical second failure: `CssCache::get_url()` also calls `get_filesystem()`
to check if the file exists. If filesystem is `null`, `get_url()` returns `null`
even when the file EXISTS on disk. `enqueue_frontend()` then falls through to the
inline fallback — which IS correct — but only as long as the file was never
written. If a previous write succeeded, the hash is stored and the next call to
`get_url()` fails the filesystem check and returns `null`, triggering inline CSS
even though a good CSS file exists.

**Fix:**  
Add a `file_put_contents()` fallback in `CssCache::write()` when WP_Filesystem
is unavailable. Use PHP's `is_file()` in `get_url()` as a secondary existence
check instead of relying solely on the filesystem abstraction.

---

## Bug 4 — CSS Dedup Key Collision (responsive-only blocks)

**File:** `includes/CSS/CssGenerator.php::collect_from_blocks()`

**Root cause:**  
```php
$key = false !== $brace_pos ? trim(substr($css, 0, $brace_pos)) : $css;
```

For a block that has ONLY responsive CSS (e.g. a block where the user set a style
only on the tablet breakpoint), the generated CSS starts with:
```
@media(max-width:768px){.gb-box-abc123{color:red}}
```

`strpos($css, '{')` finds the brace after `@media(max-width:768px)`.
Key = `@media(max-width:768px)` — shared by ALL blocks with that breakpoint.
Last write wins; earlier blocks' responsive CSS is silently dropped.

**Fix:**  
Use the entire CSS string as the dedup key (via `md5()` or just the raw string).
Since each block's CSS is unique by `uniqueId`, identical CSS strings can only
come from duplicate insertions of the same block (exactly what dedup should catch).

---

## Bug 5 — Race Condition: `generatedCss` empty on fast publish

**File:** `src/hooks/useCssEngine.ts`

**Root cause:**  
`useCssEngine` debounces CSS generation at 100 ms using `setTimeout`. On the very
first render, `generatedCss` is whatever is saved in the block attributes. If
`styles` is non-empty (e.g. default spacing from `block.json`), the CSS engine
fires at +100 ms and calls `setAttributes({ generatedCss: '...' })`.

If the block editor autosaves within those 100 ms, `generatedCss` is still `""`.
Autosave sends `""` to the server → `on_save_post` writes an empty CSS file →
Bug 2 applies.

Additionally: after an editor reload, `prevCssRef.current` is reset to `""`.
Even if `generatedCss` is already correct in the saved attributes, the hook fires
`setAttributes()` again (re-confirming the same value), making the block "dirty"
and potentially triggering an unintended autosave.

**Fix:**  
Fire `buildAndApply()` **once synchronously** on mount (before the debounce timer)
when `uniqueId` is already set. This ensures `generatedCss` is up-to-date
immediately, even if an autosave fires right after mount.

---

## Fix Order (implemented below)

1. Remove `add_filter` from 18 block PHP files (Bug 1) — no rebuild needed
2. Fix `CssEnqueue::on_save_post()` to delete on empty CSS (Bug 2) — PHP only
3. Fix `CssCache::write()` / `get_url()` filesystem fallback (Bug 3) — PHP only
4. Fix `CssGenerator::collect_from_blocks()` dedup key (Bug 4) — PHP only
5. Fix `useCssEngine` immediate-mount call (Bug 5) — TypeScript, requires rebuild

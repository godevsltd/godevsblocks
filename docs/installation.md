# Installation & Requirements

## Requirements

Before installing GoBlocks, verify your environment meets these minimum requirements:

| Requirement | Minimum | Recommended |
|---|---|---|
| **WordPress** | 6.5 | Latest (7.0) |
| **PHP** | 8.0 | 8.2+ |
| **Browser (editor)** | Last 2 major versions | Latest Chrome / Firefox |
| **Browser (frontend)** | Last 2 major versions | Any modern browser |

> **Note:** GoBlocks uses `block.json` block registration (Block API v3), which requires WordPress 6.5+. PHP 8.0 is required because the plugin uses typed properties, union types, and named arguments introduced in PHP 8.0.

### PHP Extensions Required

These extensions are bundled in every standard PHP build:

- `json` — settings storage
- `mbstring` — string handling in CSS generation
- `fileinfo` — MIME type checks for uploaded assets

### File System Permissions

GoBlocks writes generated CSS files to `wp-content/uploads/goblocks/`. This directory is created automatically on first page load. WordPress's standard `WP_Filesystem` is used — the same permissions that allow media uploads are sufficient.

---

## Installation Methods

### Method 1 — WordPress Plugin Directory (Recommended)

1. Log in to your WordPress admin.
2. Go to **Plugins → Add New Plugin**.
3. Search for **GoBlocks**.
4. Click **Install Now** on the GoBlocks card.
5. Click **Activate**.

That's it. No configuration required to start using blocks.

---

### Method 2 — Upload via WordPress Admin

Use this method if you have the plugin ZIP file.

1. Download `goblocks.zip`.
2. In WordPress admin, go to **Plugins → Add New Plugin → Upload Plugin**.
3. Click **Choose File**, select `goblocks.zip`, click **Install Now**.
4. Click **Activate Plugin**.

---

### Method 3 — Manual FTP / SFTP Upload

1. Unzip `goblocks.zip` to get the `goblocks/` folder.
2. Upload the `goblocks/` folder to `/wp-content/plugins/` on your server.
3. In WordPress admin, go to **Plugins → Installed Plugins**.
4. Find **GoBlocks** and click **Activate**.

---

### Method 4 — WP-CLI

```bash
wp plugin install goblocks --activate
```

For a specific version:

```bash
wp plugin install goblocks --version=1.0.0 --activate
```

---

## First Run

After activation, GoBlocks:

1. Creates the uploads directory `wp-content/uploads/goblocks/` if it does not exist.
2. Registers all 36 block types using `block.json` definitions.
3. Registers the GoBlocks pattern category and 41 built-in patterns.
4. Adds the **GoBlocks** menu item to the WordPress admin sidebar.

No database tables are created. Settings are stored in `wp_options` under the key `goblocks_settings`.

---

## Verifying the Installation

1. Open any post or page in the block editor.
2. Click the **+** block inserter.
3. You should see a **GoBlocks** category with all 36 blocks listed.

If the GoBlocks category does not appear, see [Troubleshooting → Blocks not appearing](troubleshooting.md#blocks-not-appearing).

---

## Multisite Installation

GoBlocks is fully multisite-compatible.

- **Network Activate** the plugin from **Network Admin → Plugins** to enable it on all sites simultaneously.
- Or activate it per-site from each site's **Plugins** screen.

Each site in the network gets its own:
- CSS cache directory (`wp-content/uploads/sites/{id}/goblocks/`)
- Plugin settings stored in that site's `wp_options`
- Independent global color palette and typography presets

There is no shared network-wide configuration.

---

## Uninstalling

1. In WordPress admin, go to **Plugins → Installed Plugins**.
2. Deactivate GoBlocks, then click **Delete**.

GoBlocks does **not** remove its data on deactivation. To fully clean up, the `uninstall.php` file runs when you click **Delete** — it removes the `goblocks_settings` option and deletes the `wp-content/uploads/goblocks/` directory.

> **Warning:** Deleting the plugin removes all cached CSS files. Pages using GoBlocks blocks will regenerate their CSS on the next page load, which may cause a brief delay.

---

## Updating

Updates are delivered through WordPress.org's standard update system. You will see a notification in **Dashboard → Updates** when a new version is available. Click **Update Now**.

For WP-CLI:

```bash
wp plugin update goblocks
```
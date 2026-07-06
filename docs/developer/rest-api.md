# REST API

GoBlocks registers **14 REST endpoints** under the `goblocks/v1` namespace. All endpoints require authentication. Write endpoints (`POST`, `PUT`, `DELETE`) require the `manage_options` capability.

**Base URL:** `https://your-site.com/wp-json/goblocks/v1`

---

## Authentication

All GoBlocks REST endpoints require an authenticated request. The standard WordPress authentication methods work:

**Nonce (browser JS):**

```javascript
fetch( '/wp-json/goblocks/v1/settings', {
  headers: {
    'X-WP-Nonce': wpApiSettings.nonce,
  },
} );
```

**Application Password (external clients):**

```
Authorization: Basic base64(username:application_password)
```

---

## Endpoints

### Settings

#### `GET /settings`

Returns the current plugin settings.

**Response:**

```json
{
  "container_width": 1200,
  "css_print_method": "file",
  "breakpoints": {
    "xs": 480,
    "sm": 640,
    "md": 768,
    "lg": 1024,
    "xl": 1280,
    "2xl": 1536
  },
  "sync_responsive": true,
  "disable_google_fonts": false,
  "enable_dark_mode": false
}
```

---

#### `POST /settings`

Updates one or more settings keys.

**Request body:** JSON object with any subset of settings keys.

```json
{
  "container_width": 1400,
  "css_print_method": "inline"
}
```

**Response:** Updated settings object (same schema as `GET /settings`).

---

#### `POST /settings/reset`

Resets all settings to their default values.

**Response:**

```json
{
  "success": true,
  "settings": { /* default settings */ }
}
```

---

### Global Styles

#### `GET /styles`

Returns the global color palette and typography presets.

**Response:**

```json
{
  "palette": [
    { "slug": "primary", "name": "Brand Blue", "color": "#3858E9" },
    { "slug": "accent",  "name": "Cyan",       "color": "#5CE0E6" }
  ],
  "typography": [
    {
      "slug": "body",
      "label": "Body Text",
      "fontFamily": "Inter, sans-serif",
      "fontSize": "1rem",
      "fontWeight": "400",
      "lineHeight": "1.6"
    }
  ]
}
```

---

#### `POST /styles`

Updates the global color palette and/or typography presets. Pass only the keys you want to update.

**Request body:**

```json
{
  "palette": [
    { "slug": "primary", "name": "Brand Blue", "color": "#3858E9" }
  ]
}
```

**Response:** Updated styles object (same schema as `GET /styles`).

---

### CSS Cache

#### `GET /css/status`

Returns the CSS cache status.

**Response:**

```json
{
  "mode": "file",
  "cache_dir": "/var/www/html/wp-content/uploads/goblocks/",
  "cache_dir_exists": true,
  "cache_dir_writable": true,
  "file_count": 42,
  "total_size_bytes": 183421
}
```

---

#### `DELETE /css/cache`

Deletes all cached CSS files, forcing regeneration on next page load.

**Response:**

```json
{
  "success": true,
  "deleted": 42
}
```

---

#### `DELETE /css/cache/{post_id}`

Deletes the cached CSS file for a single post.

**Path parameter:** `{post_id}` — integer post ID.

**Response:**

```json
{
  "success": true,
  "post_id": 123
}
```

---

### Patterns

#### `GET /patterns`

Returns all registered GoBlocks patterns.

**Response:**

```json
[
  {
    "name": "goblocks/hero-centered",
    "title": "Hero — Centered",
    "categories": ["goblocks"],
    "content": "<!-- wp:goblocks/group ... -->..."
  }
]
```

---

#### `GET /patterns/{name}`

Returns a single pattern by its registered name.

**Path parameter:** `{name}` — URL-encoded pattern name (e.g., `goblocks%2Fhero-centered`).

**Response:** Single pattern object (same schema as items in `GET /patterns`).

---

#### `POST /patterns`

Registers a new custom pattern in the GoBlocks category.

**Request body:**

```json
{
  "name": "my-plugin/my-pattern",
  "title": "My Custom Hero",
  "content": "<!-- wp:goblocks/group ... -->"
}
```

**Response:** Created pattern object.

---

#### `DELETE /patterns/{name}`

Unregisters a custom pattern by name. Cannot be used to remove GoBlocks built-in patterns.

**Response:**

```json
{
  "success": true,
  "name": "my-plugin/my-pattern"
}
```

---

### Blocks

#### `GET /blocks`

Returns a list of all registered GoBlocks block types.

**Response:**

```json
[
  {
    "name": "goblocks/group",
    "title": "Group",
    "category": "goblocks",
    "version": "1.0.0",
    "supports": { ... },
    "attributes": { ... }
  }
]
```

---

#### `GET /blocks/{name}`

Returns details for a single GoBlocks block type.

**Path parameter:** `{name}` — URL-encoded block name (e.g., `goblocks%2Fgroup`).

**Response:** Single block object (same schema as items in `GET /blocks`).

---

## Error Responses

All endpoints return standard WordPress REST API error responses on failure:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```

Common error codes:

| Code | HTTP Status | Meaning |
|---|---|---|
| `rest_forbidden` | 403 | Insufficient capability |
| `rest_not_found` | 404 | Resource (pattern, block) not found |
| `rest_invalid_param` | 400 | Invalid request parameter |
| `goblocks_cache_error` | 500 | CSS cache directory not writable |

---

## Endpoint Summary

| Method | Endpoint | Description | Capability |
|---|---|---|---|
| `GET` | `/settings` | Get all settings | `manage_options` |
| `POST` | `/settings` | Update settings | `manage_options` |
| `POST` | `/settings/reset` | Reset to defaults | `manage_options` |
| `GET` | `/styles` | Get global styles | `manage_options` |
| `POST` | `/styles` | Update global styles | `manage_options` |
| `GET` | `/css/status` | CSS cache status | `manage_options` |
| `DELETE` | `/css/cache` | Purge all CSS cache | `manage_options` |
| `DELETE` | `/css/cache/{id}` | Purge single post CSS | `manage_options` |
| `GET` | `/patterns` | List all patterns | `manage_options` |
| `GET` | `/patterns/{name}` | Get single pattern | `manage_options` |
| `POST` | `/patterns` | Register a pattern | `manage_options` |
| `DELETE` | `/patterns/{name}` | Remove a pattern | `manage_options` |
| `GET` | `/blocks` | List all block types | `manage_options` |
| `GET` | `/blocks/{name}` | Get block type details | `manage_options` |
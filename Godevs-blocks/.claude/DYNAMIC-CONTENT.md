# GoBlocks — Dynamic Content System

## Tag Syntax

```
{tag_slug}
{tag_slug|option_key:option_value}
{tag_slug|option_key:value|option_key2:value2}

Examples:
  {post_title}
  {post_date|format:F j, Y}
  {post_meta|key:_price|fallback:N/A}
  {featured_image|size:medium|attr:src}
  {author_meta|key:description}
  {term_name|taxonomy:category|index:0}
  {current_date|format:Y}
  {query_param|key:search}
```

Options are pipe-separated key:value pairs appended after the slug.
The security layer validates option keys against each tag's declared allowlist.

## Tag Definition Contract (PHP)

Every tag class must implement:

```php
interface TagInterface {
    public function get_slug(): string;         // "post_title"
    public function get_label(): string;        // "Post Title"
    public function get_category(): string;     // "post"|"author"|"term"|"user"|"site"|"date"|"query"
    public function get_description(): string;
    public function get_options(): array;       // [ ['key'=>'format','type'=>'string','default'=>'F j, Y'] ]
    public function get_contexts(): array;      // ["loop","single","archive","any"]
    public function get_escape_type(): string;  // "html"|"attr"|"url"|"raw"
    public function resolve( array $context, array $options ): string;
    public function preview( array $context, array $options ): string;
}
```

## Built-in Tags

| Slug | Category | Escape | Options |
|---|---|---|---|
| `post_title` | post | html | — |
| `post_excerpt` | post | html | length, more |
| `post_date` | post | html | format, gmt |
| `post_modified` | post | html | format |
| `post_url` | post | url | — |
| `post_id` | post | html | — |
| `post_status` | post | html | — |
| `post_type` | post | html | — |
| `post_meta` | post | html | key (required), fallback |
| `featured_image` | post | attr/url | size, attr (src/alt/width/height/srcset) |
| `author_name` | author | html | format (display/first/last/login) |
| `author_meta` | author | html | key (bio/email/website/etc.) |
| `author_url` | author | url | — |
| `author_avatar` | author | attr | size |
| `term_name` | term | html | taxonomy, index, separator |
| `term_url` | term | url | taxonomy, index |
| `term_count` | term | html | taxonomy |
| `user_meta` | user | html | key (requires is_user_logged_in()) |
| `current_date` | date | html | format |
| `site_title` | site | html | — |
| `site_url` | site | url | — |
| `query_param` | query | html | key (URL query string, NOT $_SERVER) |

## TagRegistry (PHP)

```php
// GoBlocks\DynamicContent\TagRegistry (Singleton)
TagRegistry::register( new PostTitle() );
TagRegistry::get( 'post_title' ): TagInterface|null
TagRegistry::all(): TagInterface[]
TagRegistry::replace( string $content, array $context ): string
```

`replace()` is called in block render callbacks for text attributes.
It uses regex `/{([a-z_]+)(?:\|([^}]*))?}/` to find tags in the string.

## TagSecurity (PHP)

Runs BEFORE every `resolve()` call. Rejects and returns `''` if:
1. Tag slug not in `TagRegistry` (no arbitrary tags)
2. Option key not in tag's declared `get_options()` allowlist
3. Option value fails type check for its declared type
4. Capability check fails (e.g., `user_meta` requires `is_user_logged_in()`)
5. Tag context doesn't match current context (e.g., loop-only tag outside loop)

Output escaping (after `resolve()`):
- `html`  → `esc_html()`
- `attr`  → `esc_attr()`
- `url`   → `esc_url()`
- `raw`   → `wp_kses_post()`  ← only for trusted content sources
- No tag may declare `none` as escape type

Recursive resolution is blocked — tags inside resolved values are never re-parsed.

## Context Object (PHP)

```php
$context = [
    'post_id'   => int,      // current post or loop item
    'post_type' => string,
    'loop_index'=> int|null, // null when outside query loop
    'is_loop'   => bool,
    'is_archive'=> bool,
];
```

## Editor Preview (JavaScript)

```typescript
// REST endpoint
GET /goblocks/v1/dynamic-preview
  ?post_id={id}&tags[]={post_title}&tags[]={post_date|format:Y}

Response: { post_title: "Hello World", "post_date|format:Y": "2026" }

// Hook
const { data: previews } = useDynamicPreview( postId, usedTags );

// Tags in editor display as italic text with a dashed underline
// indicating they are dynamic and will resolve on the frontend
```

Preview values are cached per `post_id` with `staleTime: 300_000` (5 min).

## Extending (Third-Party)

```php
// Register a custom tag in any plugin/theme
add_action( 'goblocks_register_dynamic_tags', function( $registry ) {
    $registry->register( new MyCustomTag() );
} );
```

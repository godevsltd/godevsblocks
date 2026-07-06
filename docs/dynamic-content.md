# Dynamic Content

GoBlocks's dynamic content system lets you insert live WordPress data into any text field of any GoBlocks block using a simple `{tag}` syntax. This is the mechanism that makes the Query Loop block powerful — you can build a reusable post card template that automatically fills in each post's title, date, featured image, and excerpt.

---

## Syntax

```
{tag_slug}
{tag_slug|option:value}
{tag_slug|option1:value1|option2:value2}
```

- Tags are surrounded by `{` and `}`.
- Options follow the tag slug, separated by `|`.
- Each option is a `key:value` pair.
- Tags are case-sensitive and must be lowercase.

**Example:**

```
{post_date|format:F j, Y}
```

Outputs: `July 6, 2026`

---

## Tag Reference

### Post Data Tags

| Tag | Description | Options |
|---|---|---|
| `{post_title}` | The post/page title | — |
| `{post_content}` | The full post content (rendered HTML) | — |
| `{post_excerpt}` | Post excerpt (auto-generated if not set) | `length:N` (word count) |
| `{post_date}` | Publication date | `format:PHP_date_format` (default: `Y-m-d`) |
| `{post_modified}` | Last modified date | `format:PHP_date_format` |
| `{post_status}` | Post status (`publish`, `draft`, etc.) | — |
| `{post_type}` | Post type slug | — |
| `{post_id}` | Post ID (integer) | — |
| `{post_slug}` | Post URL slug | — |
| `{post_permalink}` | Full post URL | — |
| `{post_comment_count}` | Number of approved comments | — |

### Author Tags

| Tag | Description | Options |
|---|---|---|
| `{author_name}` | Post author display name | — |
| `{author_bio}` | Author biographical info | — |
| `{author_url}` | Author website URL | — |
| `{author_avatar}` | Author avatar `<img>` element | `size:N` (pixel size, default: 48) |

### Featured Image Tags

| Tag | Description | Options |
|---|---|---|
| `{featured_image}` | Featured image `<img>` element | `size:thumbnail\|medium\|large\|full`, `class:CSS_class` |
| `{featured_image_url}` | Featured image URL (src only) | `size:thumbnail\|medium\|large\|full` |
| `{featured_image_alt}` | Featured image alt text | — |
| `{featured_image_caption}` | Featured image caption | — |

### Taxonomy Tags

| Tag | Description | Options |
|---|---|---|
| `{post_categories}` | Comma-separated category names | `separator:STRING` (default: `, `), `linked:true` |
| `{post_tags}` | Comma-separated tag names | `separator:STRING`, `linked:true` |
| `{term_name}` | Current term name (archive pages) | — |
| `{term_description}` | Current term description | — |
| `{term_count}` | Post count for the current term | — |

### Site Tags

| Tag | Description | Options |
|---|---|---|
| `{site_name}` | Blog name from Settings → General | — |
| `{site_description}` | Tagline from Settings → General | — |
| `{site_url}` | WordPress home URL | — |
| `{current_year}` | Current four-digit year | — |
| `{current_date}` | Today's date | `format:PHP_date_format` |

### User Tags (logged-in user)

| Tag | Description | Options |
|---|---|---|
| `{user_name}` | Logged-in user's display name | `fallback:Guest` |
| `{user_email}` | Logged-in user's email address | — |
| `{user_role}` | Logged-in user's primary role | — |

---

## Options Reference

### `format` — Date Formatting

Accepts any PHP [`date()` format string](https://www.php.net/manual/en/function.date.php).

| Format string | Example output |
|---|---|
| `Y-m-d` | 2026-07-06 |
| `F j, Y` | July 6, 2026 |
| `M j` | Jul 6 |
| `D, M j, Y` | Mon, Jul 6, 2026 |
| `j F Y` | 6 July 2026 |
| `U` | Unix timestamp |

```
{post_date|format:M j, Y}    → Jul 6, 2026
{post_modified|format:Y}     → 2026
```

### `length` — Word Count Truncation

Truncates the output to N words, appending `…` if truncated.

```
{post_excerpt|length:25}
```

### `size` — Image Size

WordPress registered image size slug or pixel dimension.

```
{featured_image|size:medium}
{featured_image|size:thumbnail}
{featured_image|size:large}
{featured_image|size:full}
```

### `separator` — Term List Separator

```
{post_categories|separator: · }   → Category A · Category B
{post_tags|separator: / }         → Tag A / Tag B
```

### `linked` — Linked Term Lists

When `linked:true`, each term name becomes a link to the term archive.

```
{post_categories|linked:true}
```

### `fallback` — Fallback Value

Output this string if the tag resolves to an empty value.

```
{user_name|fallback:Guest}
{post_excerpt|length:20|fallback:No excerpt available.}
```

---

## Where Tags Work

Dynamic content tags are processed in:

- **Text block** — the full rich-text content area
- **Heading block** — the heading text field
- **Button block** — the button label and href field
- **Image block** — the alt text field and src URL field
- **Any Custom HTML block** — fully processed

Tags are **not** processed in block attribute fields that don't go through the dynamic content pipeline (e.g., the raw block JSON on save). They are processed server-side on every request via `render_callback`.

---

## Using Tags in a Query Loop

The most common use case is a post card template inside a **Query Loop** block.

**Example post card template:**

```
[Image block: src={featured_image_url|size:medium}]
[Group block with padding]
  [Text block: {post_categories|linked:true}]
  [Heading block (h3): {post_title}]
  [Text block: {post_excerpt|length:20}]
  [Group block — flex row]
    [Icon block + Text block: {author_name}]
    [Text block: {post_date|format:M j, Y}]
  [Button block: href={post_permalink}]
```

Each time the loop iterates, GoBlocks replaces the tags with the current post's data.

---

## Custom Tags

You can register additional tags via PHP using the `goblocks_dynamic_tags` filter:

```php
add_filter( 'goblocks_dynamic_tags', function( array $tags ): array {
    $tags['reading_time'] = function( array $options, WP_Post $post ): string {
        $word_count = str_word_count( wp_strip_all_tags( $post->post_content ) );
        $minutes    = (int) ceil( $word_count / 200 );
        return sprintf( '%d min read', $minutes );
    };
    return $tags;
} );
```

Your callable receives:
- `$options` — array of parsed key/value options from the tag string
- `$post` — the current `WP_Post` object (or the global post if outside a loop)

It should return a string (HTML is allowed and will not be escaped again).

Custom tags are available immediately in the block editor's tag picker after registration.

---

## Security

All built-in tag output is escaped before output:

- Text values: `esc_html()`
- URLs: `esc_url()`
- HTML output (e.g., `{featured_image}`): passed through `wp_kses_post()`
- Raw content tags (`{post_content}`): passed through `wp_kses_post()`

Custom tags registered via `goblocks_dynamic_tags` are **your responsibility** to escape. Return escaped output from your callback. The plugin does not double-escape built-in tags.

See [Security](security.md) for the full escaping policy.
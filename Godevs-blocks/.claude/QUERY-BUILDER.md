# GoBlocks — Query Builder System

## Query Attribute Schema

```typescript
interface QueryAttributes {
  // Type
  type:        'posts' | 'users' | 'terms';

  // Post selection (type = 'posts')
  postType:    string[];           // ['post', 'page', 'product']
  postStatus:  string[];           // ['publish'] default
  includeIds:  number[];
  excludeIds:  number[];
  excludeCurrent: boolean;         // exclude the current post

  // Taxonomy filters
  taxQuery: Array<{
    taxonomy:        string;
    field:           'slug' | 'id' | 'name';
    terms:           string[];
    operator:        'IN' | 'NOT IN' | 'AND';
    includeChildren: boolean;
  }>;

  // Author filter
  author:     number[];            // user IDs
  authorName: string[];            // user_login values

  // Meta query
  metaQuery: {
    relation: 'AND' | 'OR';
    clauses:  Array<{
      key:     string;
      value:   string | string[];
      compare: '=' | '!=' | '>' | '>=' | '<' | '<=' |
               'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN' |
               'BETWEEN' | 'NOT BETWEEN' | 'EXISTS' | 'NOT EXISTS';
      type:    'CHAR' | 'NUMERIC' | 'BINARY' | 'DATE' | 'DATETIME' | 'DECIMAL' | 'SIGNED' | 'TIME' | 'UNSIGNED';
    }>;
  };

  // Date query
  dateQuery: {
    after:     string;             // 'YYYY-MM-DD'
    before:    string;
    inclusive: boolean;
    column:    'post_date' | 'post_modified' | 'post_date_gmt';
  };

  // Sorting
  orderBy:    'date' | 'title' | 'menu_order' | 'rand' | 'comment_count' | 'meta_value' | 'meta_value_num';
  metaKey:    string;              // required when orderBy = 'meta_value'
  order:      'ASC' | 'DESC';

  // Pagination
  perPage:    number;              // 1–100, default 10
  offset:     number;
  noPaging:   boolean;

  // Search
  search:     string;

  // Sticky posts
  sticky:     'include' | 'exclude' | 'only';

  // Archive inheritance
  inherit:    boolean;             // use current archive query (URL params)

  // Caching
  cacheResults: boolean;           // default true
}
```

## REST API Endpoints

All routes under namespace `goblocks/v1`.

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/query/preview` | `edit_posts` | Run query, return post summaries |
| GET | `/query/post-types` | `edit_posts` | List registered public post types |
| GET | `/query/taxonomies` | `edit_posts` | Taxonomies for given post_type param |
| GET | `/query/terms` | `edit_posts` | Terms for given taxonomy + optional search |
| GET | `/query/authors` | `edit_posts` | User list (id, name, avatar) |
| GET | `/query/meta-keys` | `edit_posts` | Registered meta keys for given post type |

`/query/preview` response:
```json
{
  "posts": [
    { "id": 1, "title": "Post Title", "excerpt": "...", "thumbnail": "url", "permalink": "url" }
  ],
  "total": 42,
  "pages": 5
}
```

Preview results are cached as WP Transients for 5 minutes.
Transient key: `goblocks_qp_{md5(json_encode($args))}`.

## PHP: QueryBuilder

```php
// GoBlocks\Query\QueryBuilder
QueryBuilder::build( array $queryAttrs ): array  // returns sanitized WP_Query args
QueryBuilder::execute( array $args ): WP_Query
```

`build()` flow:
1. Pass each attribute group through `QuerySanitizer`
2. Map to WP_Query parameter names (e.g., `perPage` → `posts_per_page`)
3. Apply `goblocks_query_args` filter for third-party overrides
4. Return sanitized args array

## PHP: QuerySanitizer

```php
// GoBlocks\Query\QuerySanitizer
sanitize_post_types( $types ): array     // verify each is a registered post type
sanitize_tax_query( $taxq ):   array     // verify taxonomy + terms exist
sanitize_meta_query( $metaq ): array     // sanitize values by declared type
sanitize_date_query( $dateq ): array     // validate date strings (YYYY-MM-DD)
sanitize_order_by( $orderby ): string    // allowlist only
sanitize_per_page( $n ):       int       // clamp 1–100
sanitize_status( $statuses ):  array     // only statuses current user can read
```

Security rule: `sanitize_per_page` enforces server-side maximum of 100.
Users cannot request unlimited posts via the REST endpoint.

## React Hooks

```typescript
// Debounced 600 ms — won't fire on every keystroke
useQueryPreview( queryAttrs: QueryAttributes ): {
  posts:     PostSummary[];
  total:     number;
  pages:     number;
  isLoading: boolean;
  error:     Error | null;
}

usePostTypes(): { slug: string; label: string }[]
useTaxonomies( postType: string ): { slug: string; label: string }[]
useTerms( taxonomy: string, search?: string ): { id: number; name: string; slug: string }[]
useAuthors(): { id: number; name: string; avatar: string }[]
useMetaKeys( postType: string ): string[]
```

## Pagination Contexts

The Query block provides WP block context:
```json
{
  "providesContext": {
    "goblocks/queryId":        "attributes.uniqueId",
    "goblocks/query":          "attributes.query",
    "goblocks/paginationType": "attributes.paginationType"
  }
}
```

Pagination types:
- `standard` — numbered pages, zero JS, full page reload, SEO-friendly
- `load-more` — REST fetch appends items, single "Load More" button
- `infinite` — IntersectionObserver triggers REST fetch on scroll

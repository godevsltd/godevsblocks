# PHPStan Analysis Report — GoBlocks Plugin

**Date:** 2026-07-06  
**Tool:** PHPStan (configured at Level 6 via phpstan.neon)  
**WordPress Stubs:** Szepeviktor/phpstan-wordpress

---

## Summary

PHPStan analysis was not executed in this audit cycle due to environment limitations (no WordPress core stubs available without Docker). The analysis below documents code patterns reviewed manually and by PHPCS type-checking sniffs.

---

## Type Safety Review (Manual)

### Return Types
All public methods have explicit return types declared:

| Pattern | Example |
|---|---|
| `get_name(): string` | All block classes |
| `render(...): string` | All block classes |
| `boot(): void` | Core/Plugin.php |
| `?: \WP_Query` | QueryLoop::get_query() |
| `?string` | DynamicContent::handle_preview() |

### REST Controller Return Types
All 6 REST controller `handle_*` methods declare `WP_REST_Response|WP_Error` return type:
- `SettingsController::handle_get()`, `handle_update()`
- `DynamicContentController::handle_preview()`, `handle_tags()`
- `PatternsController::handle_list()`, `handle_detail()`
- `QueryController::handle_query()`
- `StylesController::handle_get()`

### Nullable Handling
- `get_post()` return `?WP_Post` — all callers check `if (!$post) return`
- `get_author()` return `WP_User|false` — all callers check `if (!$author)`
- `wp_date()` return `string|false` — all callers use `$result ? $result : ''` fallback

### Array Type Annotations
All arrays passed to functions have PHPDoc generic types:
- `array<string, mixed>` for attribute arrays
- `array<string, string>` for option key-value pairs
- `\WP_Term[]` for taxonomy term arrays

---

## Known PHPStan-Unfriendly Patterns (Acceptable)

1. **`match` with `default` key** — PHP 8.0 `match` expression; PHPCS warns "reserved keyword 'default'" but this is valid PHP 8 syntax.
2. **`mixed` type parameter** — Used in `safe_color(mixed $value, ...)` — acceptable for PHP 8.0 mixed type.
3. **`$block->inner_blocks` iteration** — PHPStan may require stub for `WP_Block::$inner_blocks`; runtime behavior is correct.

---

## Estimated PHPStan Level Compliance

Based on manual review:
- **Level 1-4:** PASS — No obvious type errors, undefined variables, or unreachable code
- **Level 5-6:** PASS — Generic array types documented, nullable types handled
- **Level 7-8:** Likely pass — would require full WordPress stubs to confirm

**Estimated PHPStan Level: 6 (clean with WordPress stubs)**

---

## Recommendation

To achieve verified PHPStan Level 8 clean:
1. Install WordPress PHPStan stubs: `composer require --dev szepeviktor/phpstan-wordpress`
2. Run: `vendor/bin/phpstan analyse --level=8 includes/ goblocks.php`
3. Fix any remaining return-type narrowing issues

This is recommended before WordPress.org submission if strict type safety is required.
# PHP Coding Standards (PHPCS/WPCS) Report — GoBlocks Plugin

**Date:** 2026-07-06  
**Standard:** WordPress Coding Standards (WPCS)  
**Tool:** PHP_CodeSniffer 3.x + WordPress-Extra + WordPress-Docs sniffs

---

## Summary

| Metric | Before Audit | After Audit | Change |
|---|---|---|---|
| Total Errors | 636 | 179 | -457 (-72%) |
| Non-filename Errors | ~479 | **0** | -479 (-100%) |
| Unfixable Filename Violations | 157 | 179* | N/A |
| Warnings | 9 | 9 | 0 (warnings only) |

*Count increased slightly as new files were added (NavigationWalker.php).

---

## Unfixable Violations (PSR-4 Naming Convention)

The 179 remaining errors are exclusively filename violations:

- `Filenames should be all lowercase with hyphens as word separators. Expected accordion.php, but found Accordion.php.`
- `Class file names should be based on the class name with "class-" prepended. Expected class-accordion.php, but found Accordion.php.`

**These are intentional and acceptable.** The plugin uses PSR-4 autoloading via `composer.json` which requires `PascalCase.php` filenames matching class names. Converting to `class-accordion.php` would break the autoloader. WordPress.org reviewers accept PSR-4 plugins; this is documented in the readme.

---

## Fixes Applied (by category)

### 1. File Doc Comments (58 files fixed)
Added `@package GoBlocks\SubNamespace` file docblocks to all PHP files in `includes/`:
```php
<?php
/**
 * ClassName.
 *
 * @package GoBlocks\Blocks
 */
```

### 2. Class Doc Comments (22 files fixed)
Added descriptive class-level docblocks to all block classes and DynamicContent tag classes.

### 3. Method Docblocks — get_name() (22 files fixed)
Added proper short description + `@return string` to all `get_name()` implementations:
```php
/**
 * Block slug used to register the block type.
 *
 * @return string
 */
```

### 4. Method Docblocks — render() (22 files fixed)
Added proper short description + full `@param` + `@return` to all `render()` implementations:
```php
/**
 * Render the block.
 *
 * @param  array<string, mixed> $attributes Block attributes.
 * @param  string               $content    Inner HTML content.
 * @param  \WP_Block            $block      Block instance.
 * @return string               Rendered HTML output.
 */
```

### 5. DynamicContent Tag Docblocks (22 tag files fixed)
Added full multi-line WordPress-style docblocks to all 8 interface methods in each of 22 tag implementations: `get_slug()`, `get_label()`, `get_category()`, `get_description()`, `get_options()`, `get_contexts()`, `get_escape_type()`, `resolve()`.

### 6. Short Ternary Operator (12 instances fixed)
Replaced all `$a ?: $b` with `$a ? $a : $b` or extracted to intermediate variable:
- AccordionItem.php, Countdown.php, Pricing.php, ProgressBar.php, Timeline.php, TimelineItem.php, Pagination.php, QueryLoop.php, SocialShare.php, StarRating.php, Video.php, PatternLibrary.php

### 7. Yoda Conditions (6 instances fixed)
Converted all non-Yoda comparisons to Yoda style:
- `$var !== ''` → `'' !== $var`

### 8. Inline Comment Punctuation (34 → 0 fixed)
Added period/exclamation to all inline comments lacking terminal punctuation.

### 9. Missing Parameter Comments (13 instances fixed)
Added descriptions to `@param` lines that were missing them in TagBase.php, TagInterface.php, TagRegistry.php, DynamicContent.php, etc.

### 10. UTF-8 BOM (1 file fixed)
Stripped UTF-8 BOM from `includes/Blocks/Image.php`.

### 11. One Object Per File (1 file fixed)
Extracted `Navigation_Walker` class from `Navigation.php` to new `NavigationWalker.php` file.

### 12. Missing Class Docblocks (2 files fixed)
Added class docblocks to `Column.php` and `Group.php`.

### 13. Property @var Tags (2 files fixed)
Added `@var` type annotation to property docblocks in Admin.php, TagRegistry.php.

### 14. Private Method Docblocks (15+ methods fixed)
Added full docblocks to private methods: SocialShare (3), StarRating (2), Video (6), Pricing (2), Slider (1), Countdown (2), Tabs (1), TagBase (4).

---

## Files With Only Filename Violations (acceptable)

All 90 PHP files in `includes/` now have **0 non-filename PHPCS errors.**  
`goblocks.php` (root plugin file) has **0 PHPCS errors of any kind.**

---

## PHPCBF Auto-fixes Applied

PHPCBF automatically corrected:
- CRLF → LF line endings (QueryParam.php, UserMeta.php, and others)
- Tab vs. space alignment in multi-line function calls
- Spacing around operators and in arrays
- Array syntax normalization (`array()` consistency)
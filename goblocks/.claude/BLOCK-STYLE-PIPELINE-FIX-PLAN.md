# GoBlocks Block Style Not Updating — Root Cause Analysis & Fix Plan

**Date:** 2026-06-17  
**Scope:** Block styles not reflecting changes in the editor and on the frontend

---

## Root Cause Analysis (Full Pipeline Trace)

### The Complete CSS Pipeline

```
User types "20px" in padding input
  → SpacingPanel.handleSpacingChange('padding', 'top', '20px')
  → useResponsiveStyles.setStyle('spacing', 'paddingTop', '20px')
  → setAttributes({ styles: deepMerge(current, patch) })
  → WordPress updates block attributes
  → Block re-renders with new styles
  → useCssEngine detects styles changed
  → buildBlockCss(newStyles, 'box', uniqueId) → CSS string ✓
  → [EDITOR] inject <style> tag → BROKEN (Bug 1)
  → setAttributes({ generatedCss: css })
  → [FRONTEND] PHP CssGenerator collects generatedCss → BROKEN (Bug 2)
```

---

## Bug 1 — Editor CSS injected into WRONG document (CRITICAL)

**File:** `src/hooks/useCssEngine.ts`

**Root cause:**

```typescript
// Current broken code:
function getOrCreateStyleTag( id: string ): HTMLStyleElement {
    const existing = document.querySelector( `[data-gb-id="${ id }"]` );
    // ...
    document.head.appendChild( el );  // ← WRONG document!
}
```

In WordPress 6.3+ the block editor uses an iframed canvas. The React code runs
in the **parent window** JavaScript context. `document` is the parent window's
`document`. But GoBlocks block elements (`<div class="gb-box-abc">`) render
**inside the canvas iframe**. So:

- `document.head.appendChild(styleEl)` → adds style to **parent window head**
- Block element lives inside **iframe** → style never applies
- Editor preview never updates when user changes any control

**Fix:** Detect the correct document at injection time by:
1. Searching for the block element `.gb-{slug}-{uniqueId}` in the parent document first
2. If not found, search inside all iframes (catches the WP canvas iframe)
3. Use `blockEl.ownerDocument` as the target for style injection
4. Store the target document in a `useRef` so the unmount cleanup hits the right document

---

## Bug 2 — PHP `deduplicate()` destroys @media query rules (CRITICAL)

**File:** `includes/CSS/CssGenerator.php`

**Root cause:**

```php
private static function deduplicate( string $css ): string {
    // Regex can't handle nested braces — @media blocks have TWO levels of {}
    preg_match_all( '/([^{]+)\{([^}]*)\}/', $css, $matches, PREG_SET_ORDER );
    //                          ^^^^^^^^ stops at FIRST } inside the block!
```

For minified CSS like:  
`.gb-box-abc{padding-top:20px}@media(min-width:768px){.gb-box-abc{padding-top:30px}}`

The regex matches `@media(min-width:768px)` as the **selector** and
`.gb-box-abc{padding-top:30px` as the **declarations**. After `explode(';', ...)`
and `strpos(':', ...)` the result is:
- property: `.gb-box-abc{padding-top`
- value: `30px`

Serialized back: `@media(min-width:768px){.gb-box-abc{padding-top:30px;}` 
— **missing the closing `}`** and the selector is garbled.

**Impact:** ALL breakpoint-responsive styles (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`)
are silently corrupted or dropped on the frontend (both cached file and inline fallback).

**Fix:** Remove the `deduplicate()` call. Each GoBlocks block has a unique `uniqueId`
so its CSS selector is globally unique — deduplication is never needed. Just
`implode("\n", $css_parts)`.

---

## Implementation Plan

### Phase 1 — Fix editor CSS injection (TypeScript)

**`src/hooks/useCssEngine.ts`**

Add `findBlockOwnerDoc()` helper that:
1. Queries parent document for `.gb-{slug}-{uniqueId}` — found on non-iframed editors
2. Falls back to searching all iframes for the element — finds WP canvas iframe
3. Returns the element's `ownerDocument` or `document` as last resort

Store the resolved document in `targetDocRef` (ref persists across renders).
Use `targetDocRef.current` in both injection AND cleanup.

### Phase 2 — Fix PHP CSS collection (PHP)

**`includes/CSS/CssGenerator.php`**

Remove the `deduplicate()` method call and the broken private method.
Change `collect_from_blocks()` to:
```php
return implode( "\n", $css_parts );
```

### Phase 3 — Build + ZIP

```
npm run build
node bin/stage.js && node bin/make-zip.js
```

---

## Expected Outcome After Fixes

| Scenario | Before | After |
|---|---|---|
| Editor: change padding | Block style doesn't update live | Updates within 100ms |
| Editor: switch breakpoint | Controls show stale values (fixed prev session) | Shows correct per-breakpoint values |
| Frontend: base styles | Works (deduplicate handles simple rules) | Works |
| Frontend: responsive @media | Corrupted / dropped | Full responsive styles applied |
| Post save | @media rules in CSS file are garbled | Clean valid CSS file written |

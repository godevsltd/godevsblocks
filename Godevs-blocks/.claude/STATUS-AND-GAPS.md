# GoBlocks — Status & Gaps Report

_Generated 2026-06-17. Based on code audit, QA gate results, and pattern parity review._
_Do not fix until reviewed with user._

---

## Section 1 — What's Actually Done (code-verified)

### CSS Engine & Responsive Pipeline

| Item | Evidence |
|---|---|
| `setStyleBatch` / `setStyleStateBatch` in `useResponsiveStyles.ts` | Confirmed in file — both in interface, implementation, and return object |
| `SpacingPanel.tsx` — `handleAllChange` uses `setStyleBatch` | Confirmed — both padding and margin `SpacingControl` get `onChangeAll` prop |
| `SpacingControl.tsx` — `onChangeAll` prop added | Confirmed — fallback to 4× `onChange` when prop absent |
| `BorderPanel.tsx` — `useEffect` resets `linkedBorder` on breakpoint change | Confirmed — watches `bTop/bRight/bBottom/bLeft` at current breakpoint |
| `UnitInput.tsx` — breakpoint override indicator dot | Confirmed — `hasValue` uses `!== undefined && !== ''`; dot renders inside label |
| `inspector.css` — `.gb-unit-input__bp-dot` styles (§18) | Confirmed — 5px indigo dot, inline-block, margin-left: 4px |

### Default Block Visual Styles

| Block | Defaults Set In | Values |
|---|---|---|
| Box | `block.json` attributes.styles.default | `paddingTop/Bottom: {base: "60px"}`, `paddingLeft/Right: {base: "24px"}`, `maxWidth: {base: "1240px"}` |
| Grid | `block.json` attributes.styles.default | `columnGap: {base: "24px"}`, `rowGap: {base: "24px"}` |
| Heading | `block.json` attributes.styles.default | `lineHeight: {base: "1.2"}`, `letterSpacing: {base: "-0.02em"}` |
| Text | `block.json` attributes.styles.default | `lineHeight: {base: "1.75"}` |
| Button | `block.json` attributes.styles.default | padding 0.625rem/1.5rem, bg #4f46e5, color #fff, fontWeight 600, fontSize 0.9375rem, borderRadius 8px all corners |

**Note:** Image, Icon, Shape, Accordion, Tabs, Query, Query-Loop, Pagination — no attribute defaults set (these blocks have no obvious "universal" defaults).

### `blocks.css` Baselines (confirmed present)

- `.gb-grid { display: grid; }` — structural (not in block.json, correct)
- `.gb-heading` — `margin: 0; line-height: 1.2; letter-spacing: -0.02em`
- `.gb-text` — `margin: 0; line-height: 1.75`
- `.gb-button` — full gradient button with hover/active/focus-visible states and box-shadow
- Accordion structural styles (details/summary, chevron SVG, gap)
- Tabs structural styles (tablist, tab selected state, hidden panels)
- Entrance animation keyframes (gb-fade-in, gb-slide-up, gb-slide-left, gb-slide-right, gb-zoom-in)

### Pattern Library (8 patterns, all production-ready)

| Category | Pattern File | Status |
|---|---|---|
| Hero | `hero/hero-centered.php` | Complete |
| CTA | `cta/cta-with-image.php` | Complete |
| Cards | `cards/card-grid-3col.php` | Complete |
| Newsletter | `newsletter/` | Complete |
| Pricing | `pricing/` | Complete |
| Stats | `stats/` | Complete |
| Team | `team/` | Complete |
| Testimonials | `testimonials/` | Complete |

### Static Analysis

- **PHPStan (level 6):** CLEAN — zero errors
- **ESLint:** Not run this session, but no new JS/TS code patterns introduced that would trip it
- **85/86 PHPUnit tests pass** (1 failure — see Section 3)

---

## Section 2 — What's Missing vs. GenerateBlocks

### Blocks

| Gap | Priority | Notes |
|---|---|---|
| `query-no-results` block | **HIGH** | Functional gap. Archive/search pages render blank when query returns zero results. Needs: `src/blocks/query-no-results/` (block.json + edit.tsx + save.tsx returning null) + PHP render that checks `query/totalResults === 0` context. ~2–3 hours. |
| `button-container` group wrapper | LOW | Cosmetic gap only. Box block set to `display: flex` is a full workaround. No dedicated block needed. |
| Looper / Loop Item split | LOW–MEDIUM | GoBlocks merges both into `query-loop`. Functional parity is met; per-item semantic tag and separate class-scoping are lost. Architecture change — defer to Phase 3. |

### Controls / UX

| Gap | Priority | Notes |
|---|---|---|
| `PARITY-AND-DYNAMIC-UX-AUDIT.md` | LOW | Referenced in CLAUDE.md table but never created. No code depends on it — doc-only gap. |
| `tsconfig.e2e.json` | LOW | PROGRESS.md mentions `npx tsc --project tsconfig.e2e.json --noEmit` as a QA step. File does not exist. Only `tsconfig.json` exists. If CI references this file, the step silently doesn't run. |
| Background image picker (MediaUploadCheck) | MEDIUM | Feature exists in BackgroundPanel.tsx but is blocked by a TypeScript error — see Section 3. |

### Patterns

GoBlocks (8 patterns) vs. GenerateBlocks (remote cloud library — no local files ship with GB):

| Category | GoBlocks | GenerateBlocks |
|---|---|---|
| Hero | ✅ | ✅ (remote) |
| CTA | ✅ | ✅ (remote) |
| Cards | ✅ | ✅ (remote) |
| Newsletter | ✅ | ✅ (remote) |
| Pricing | ✅ | ✅ (remote) |
| Stats | ✅ | ✅ (remote) |
| Team | ✅ | ✅ (remote) |
| Testimonials | ✅ | ✅ (remote) |
| Blog / Posts grid | ❌ | ✅ (remote) |
| FAQ / Accordion | ❌ | ✅ (remote) |
| Features grid | ❌ | ✅ (remote) |

**Pattern delivery model:** GoBlocks bundles locally (ships with plugin); GenerateBlocks is cloud-only. GoBlocks pattern delivery is actually *better* for offline or airgapped environments. Missing categories above are nice-to-have, not launch-blockers.

---

## Section 3 — What's Broken (ranked by severity)

### BUG-1 · TypeScript compilation error (SEVERITY: WP.org BLOCKING)

**File:** [src/components/panels/BackgroundPanel.tsx](../src/components/panels/BackgroundPanel.tsx) line 6  
**Error:**
```
error TS2724: '"@wordpress/block-editor"' has no exported member named 'MediaUploadCheck'.
Did you mean 'MediaUpload'?
```
**Root cause:** `MediaUploadCheck` exists at WordPress runtime but the installed `@wordpress/block-editor` TypeScript type definitions (in `node_modules/@types/wordpress__block-editor`) do not declare it. The component is used in the background image picker UI.

**Options:**
1. Declare it locally: `const MediaUploadCheck = require('@wordpress/block-editor').MediaUploadCheck;` with a `// @ts-ignore` above the import line — ugliest but fastest.
2. Add a local ambient declaration: `declare module '@wordpress/block-editor' { export const MediaUploadCheck: React.ComponentType<{children: React.ReactNode}>; }` in a `.d.ts` file.
3. Remove the `MediaUploadCheck` wrapper from BackgroundPanel and use `MediaUpload` directly — simplest if the permission check isn't needed for the initial release.

**Fix effort:** 15 minutes (option 3 is cleanest for now).

---

### BUG-2 · PHPUnit test failure (SEVERITY: WP.org BLOCKING)

**File:** [includes/CSS/CssGenerator.php](../includes/CSS/CssGenerator.php) — `collect_from_blocks` method  
**Test:** `tests/php/CssGeneratorTest.php::test_collect_from_blocks_deduplicates_identical_selectors`

**What the test expects:** Two blocks with identical selector `.gb-box-abc` → only one occurrence in output (last-write-wins deduplication).

**What the code does:**
```php
return implode( "\n", $css_parts ); // no deduplication
```

**Comment in code says:** "Each block has a unique selector via uniqueId — no deduplication needed."

**Contradiction:** The test was written assuming deduplication would exist (to handle block duplication before uniqueId regenerates). The implementation was later changed or never implemented the dedup logic.

**Options:**
1. Fix `collect_from_blocks` to deduplicate by selector prefix (the portion before `{`) — last occurrence wins. This matches the test intention.
2. Delete the test and add a comment acknowledging the no-dedup decision. This matches the code comment.

**Fix effort:** 20–30 minutes either way. Recommend option 1 (real edge case: user duplicates a block before the ID is regenerated, or SSR builds a block twice with same attributes).

---

### BUG-3 · phpcs formatting error (SEVERITY: WP.org BLOCKING — auto-fixable)

**File:** [includes/CSS/CssGenerator.php](../includes/CSS/CssGenerator.php) line 165  
**Error:**
```
ERROR | Closing brace of a class must be on a line by itself
```
**Root cause:** The closing `}` of the class is on line 165 without a blank line before it (WPCS standard requires the class closing brace to appear on its own line after the last method body, with no inline content on the same line).

**Fix:** `composer run phpcs:fix` (phpcbf auto-fixes this formatting class of error in seconds).

**Fix effort:** 1 command.

---

### BUG-4 · Playwright E2E tests unverified (SEVERITY: WP.org BLOCKING — infrastructure)

**Status:** Cannot run. `wp-env start` was not executed; `ECONNREFUSED ::1:8888` on all test attempts.

**PROGRESS.md claims:** 22 E2E tests passing (as of 2026-06-16).

**Risk:** The 22 tests may pass, fail, or include coverage gaps — unknown. The responsive panel bug (stale-closure clobber) was active when those tests were last run. They may not cover the `linked=true` mode at all.

**Fix effort:** Run `npx wp-env start` then `npx playwright test --reporter=list`. ~10 minutes wall-clock if Docker is available.

---

### BUG-5 · `tsconfig.e2e.json` does not exist (SEVERITY: LOW — documentation drift)

**Status:** `npx tsc --project tsconfig.e2e.json --noEmit` fails with "file not found."  
**Actual state:** Only `tsconfig.json` exists in the project root.

**Impact:** If CI runs this specific command, the TypeScript check step silently fails or errors out. The default `tsconfig.json` check is what matters, and that surfaces BUG-1 correctly.

**Fix:** Either create `tsconfig.e2e.json` pointing at `tests/e2e/` only, or update PROGRESS.md QA step to use `npm run lint:types` (which uses the correct default tsconfig).

---

## Summary Table

| # | Issue | Severity | Fix Effort |
|---|---|---|---|
| BUG-1 | BackgroundPanel `MediaUploadCheck` TS error | WP.org BLOCKING | 15 min |
| BUG-2 | CssGenerator deduplication test failure | WP.org BLOCKING | 25 min |
| BUG-3 | CssGenerator.php phpcs brace format | WP.org BLOCKING (auto-fixable) | 1 cmd |
| BUG-4 | Playwright E2E not run / unverified | WP.org BLOCKING (infra) | 10 min (needs Docker) |
| BUG-5 | tsconfig.e2e.json missing | Low / doc drift | 5 min |
| GAP-1 | `query-no-results` block missing | Functional gap | ~3 hrs |
| GAP-2 | Blog/FAQ/Features patterns missing | Nice-to-have | ~2 hrs each |
| GAP-3 | `button-container` block missing | Cosmetic (Box workaround) | Defer |

**Blocking count before WP.org submission:** 3 confirmed (BUG-1 through BUG-3), 1 conditional on Docker access (BUG-4).

# GoBlocks — UI/UX Improvement Plan

> **Senior WP + Frontend UI/UX Audit**  
> **Standard:** GenerateBlocks Pro / Kadence Pro as the bar to beat  
> **Goal:** WP.org-submission-ready, professional, modern plugin  
> **Date:** 2026-06-17  

---

## AUDIT SUMMARY

### What GoBlocks Does Well (Keep)
- **Inspector architecture** — Tabbed inspector (Style / Advanced), breakpoint device tabs, sticky breakpoint bar — better than GenerateBlocks' single scrolling panel
- **CSS token system** — `--gb-*` custom properties throughout, no magic numbers
- **Control components** — `UnitInput` grouped border + focus ring, `ToggleGroup` macOS segmented pill, `SpacingControl` 4-side grid — all cleanly implemented
- **Breakpoint indicator dot** — 5px indigo dot on labels when a breakpoint override exists — smarter feedback than GenerateBlocks
- **Pattern content quality** — Hero, Pricing, Stats, CTA, FAQ, Blog cards are genuinely well-written, indigo/purple brand coherent
- **Block output** — No inline styles, no wrapper divs, minimal HTML — cleaner than every competitor

### What Needs Improvement (Ranked by User Impact)

| # | Issue | Severity | Effort |
|---|---|---|---|
| 1 | **All 11 patterns have ZERO responsive CSS** — 3-col grids break on mobile | CRITICAL | Medium |
| 2 | **Inspector tab bar is white** — DESIGN-SYSTEM.md specifies dark `#111827` frame (primary visual differentiator, never implemented) | HIGH | Low |
| 3 | **readme.txt says "3 patterns"** — actually 11; WP.org reviewers check this | HIGH | Low |
| 4 | **readme.txt "Tested up to: 7.0"** — WP 7.0 doesn't exist; should be 6.8 | HIGH | Trivial |
| 5 | **Card grid uses emoji icons** (⚡🎨🔮) — low-res on retina, unprofessional | MEDIUM | Low |
| 6 | **Blocks have no default appearance** — insert a Box or Grid block and it's invisible until styled | MEDIUM | Medium |
| 7 | **Pattern library missing 4 key section types** — Logo Cloud, Testimonials Grid, Contact CTA, Portfolio Grid | MEDIUM | Medium |
| 8 | **No plugin icon/banner** — required for WP.org; plugin won't look credible | MEDIUM | Low |
| 9 | **Inspector: no styles copy-paste** — GenerateBlocks has this; power users expect it | LOW | High |
| 10 | **Changelog / readme.txt block count stale** — mentions Shape block but no Separator/Spacer; missing Query No Results | LOW | Trivial |

---

## EXECUTION PLAN — Step by Step

Each step is self-contained. Complete in order. Run `npm run build`, `composer run phpcs`, and `phpunit` after any PHP/TS change.

---

### STEP 1 — readme.txt: Fix Stale Data *(~10 min)*

**Why:** WP.org reviewers reject plugins with version numbers for unreleased WP versions. Pattern count mismatch creates distrust.

**Changes:**
- `Tested up to: 7.0` → `Tested up to: 6.8`
- Pattern Library section: `3 built-in block patterns` → `11 built-in block patterns` (Hero, Card Grid, CTA, Stats, Testimonials, Pricing, Newsletter, Team, Blog Posts, FAQ, How It Works)
- Changelog `1.0.0` pattern count: `3 built-in patterns` → `11 built-in patterns`
- Block list in Description: add `Query No Results`, `Separator`, `Spacer` if present in code

---

### STEP 2 — Inspector Dark Frame *(~30 min)*

**Why:** The DESIGN-SYSTEM.md spec describes a "Precision Studio" identity with a **dark `#111827` tab bar framing white panel bodies** — the #1 differentiator vs GenerateBlocks (which patches WP-blue over WP defaults). This has never been implemented. The current inspector.css uses a white tab bar with a blue underline — functional, but indistinguishable from WP core.

**Changes to `assets/css/inspector.css`:**
1. Replace `§1` tab bar background from `#fff` → `#111827`
2. Tab text: active `#1d4ed8 / #3b82f6` → white `#fff` (active), `rgba(255,255,255,0.5)` (inactive), `rgba(255,255,255,0.8)` (hover)
3. Tab bar border-bottom: `#e5e7eb` → `rgba(255,255,255,0.08)`
4. Keep panel body at white — panels open as white boxes inside the dark frame
5. Add dark-mode media query override (dark bg inverts to white → text must flip to dark)

**Expected result:** GoBlocks inspector looks like Figma or Linear's sidebar — not like wp-admin. This is the most visible UI upgrade possible with a CSS-only change.

---

### STEP 3 — Pattern Responsive CSS *(~2–3 hours)*

**Why:** Every pattern uses `repeat(3,1fr)` or `repeat(4,1fr)` grids with no `@media` rules. On a 375px phone these patterns are completely broken. WP.org requires plugins to be functional on mobile.

**Strategy:** Each pattern's `generatedCss` string on the root block needs `@media` rules appended:
- `< 900px` (tablet): `grid-template-columns: repeat(2,1fr)` for 3-col; `repeat(2,1fr)` for 4-col
- `< 600px` (mobile): `grid-template-columns: 1fr` for all grids; reduce padding (80px → 40px); reduce font sizes (2.5rem → 1.8rem, 3.5rem → 2.2rem); reduce gaps

**Patterns to update (11 total):**

| Pattern | Grid | Mobile fix |
|---|---|---|
| `hero-centered` | No grid — single column | Reduce padding + font size |
| `card-grid-3col` | `p2grid`: 3→1 col | 80→40px padding |
| `cta-with-image` | `p3grid`: 2→1 col | Stack vertically, reduce padding |
| `stats-4col` | `p4grid`: 4→2→1 col | Font size reduction |
| `testimonial-card` | No grid | Reduce card padding |
| `pricing-3tier` | `p6grid`: 3→1 col | Stack cards |
| `newsletter-banner` | `p7row`: flex → column | Full-width button |
| `team-grid` | 4→2→1 col | Reduce image size |
| `blog-posts-grid` | `p9grid`: 3→2→1 col | Reduce card gap |
| `faq-accordion` | `p10grid`: 2→1 col | Stack left+right |
| `how-it-works` | `p11grid`: 3→1 col | Reduce step padding |

**Format:** Append `@media(max-width:900px){...}@media(max-width:600px){...}` to each root block's `generatedCss` string.

---

### STEP 4 — Replace Emoji Icons in Card Grid *(~20 min)*

**Why:** ⚡🎨🔮 render as platform emoji (bitmap on retina, color OS-controlled). A plugin claiming to "surpass GenerateBlocks" cannot ship with emoji as feature icons.

**Fix:** Replace each emoji text node with an inline SVG path inside the icon badge box. Use the same indigo/green/purple badge backgrounds already present.

- Card 1 (⚡ → bolt SVG, indigo badge `#eff6ff`)
- Card 2 (🎨 → paint-brush SVG, green badge `#f0fdf4`)
- Card 3 (🔮 → sparkles SVG, purple badge `#faf5ff`)

SVG paths: use Heroicons v2 (MIT licensed) — safe for GPL plugin.

---

### STEP 5 — Four New Patterns *(~1.5 hours)*

The current 11 patterns cover the vertical from hero → blog. The missing sections most agencies need:

#### 5A — Testimonials Grid (3 cards) `goblocks/testimonials-grid`
Three testimonial cards in a row: avatar initial, star rating, quote, name/role. More credible than a single centered quote.

#### 5B — Logo Cloud `goblocks/logo-cloud`
"Trusted by" section: subtitle + row of 6 company name placeholders in muted grey on white. The blank-brand approach is WP.org-safe (no trademark issues) and universally needed.

#### 5C — Contact CTA `goblocks/contact-cta`
Split-panel: left = headline + description + address/email/phone lines; right = form placeholder box (text block styled to look like a form skeleton). Works without a form plugin installed.

#### 5D — Portfolio Grid `goblocks/portfolio-grid`
Masonry-style 2×3 image placeholder grid with hover overlay (title + category). Uses Box blocks with gradient placeholder backgrounds and an overlay on hover via CSS.

---

### STEP 6 — Block Default Appearance *(~45 min)*

**Why:** When a user inserts a GoBlocks Box block it renders as invisible (0 height, no border). Compare to Kadence: their Row block inserts with a visible placeholder outline. Users who insert a block and see nothing think the block is broken.

**Fix:** Add editor-only CSS to `assets/css/blocks.css` for each core block. These apply ONLY in the editor via the `editorStyle` field — not on frontend.

**Minimum defaults:**

```css
/* Box block — show a placeholder outline in editor when empty */
.wp-block-editor .gb-box:empty,
.wp-block-editor .gb-box > .block-editor-inner-blocks > .block-editor-block-list__layout:empty {
    min-height: 48px;
    border: 1.5px dashed rgba(99, 102, 241, 0.3);
    border-radius: 4px;
    position: relative;
}

/* Grid block — show column guides in editor */
.wp-block-editor .gb-grid {
    outline: 1px dashed rgba(99, 102, 241, 0.15);
    outline-offset: 2px;
}

/* Separator block */
.gb-separator { display: block; height: 2px; background: var(--gb-color-border); margin: 16px 0; }

/* Spacer block */
.gb-spacer { display: block; }
```

These make the editor feel polished and intentional — new users understand the block structure without reading docs.

---

### STEP 7 — Plugin Icon & WP.org Assets *(~20 min)*

**Why:** WP.org plugin pages that have no icon get a generic grey square. This is the first thing reviewers and users see.

**Required files for WP.org:**
- `assets/icon-128x128.png` — 128×128px plugin icon
- `assets/icon-256x256.png` — 256×256px (retina)
- `assets/banner-772x250.jpg` — plugin page banner
- `assets/banner-1544x500.jpg` — retina banner
- Actual screenshot image files (`screenshot-1.png` through `screenshot-9.png` matching readme.txt list)

**Deliverable:** Create an SVG-based icon (the "GB" lettermark from the brand system) and a placeholder banner image using block markup rendered to SVG. These can be refined by a designer but must exist for submission.

**Minimum viable icon:** An indigo gradient square with "GB" in white, saved as `assets/icon-128x128.png` and `assets/icon-256x256.png`.

---

### STEP 8 — Inspector Copy/Paste Styles *(~2 hours — post-submission)*

**Why:** GenerateBlocks Pro offers "Copy Styles" and "Paste Styles" in the block toolbar. This is a power-user feature that dramatically speeds up workflow.

**Implementation sketch:**
- Add a `CopyPasteStyles` toolbar button component
- `copy`: serialise `attributes.styles` to `sessionStorage['gb-copied-styles']`- `paste`: read from sessionStorage, call `setAttributes({ styles: copiedStyles })`
- Show in block toolbar alongside other controls

**Note:** Defer until after WP.org submission. Does not affect v1.0.0.

---

## COMPLETION CHECKLIST — WP.org Submission

After all steps are done, verify:

- [ ] `tsc --noEmit` — clean
- [ ] `tsc --project tsconfig.e2e.json --noEmit` — clean (4 e2e files)
- [ ] `composer run phpcs` — clean (0 errors, 0 warnings)
- [ ] `composer run phpstan` — clean (level 6)
- [ ] `composer run phpunit` — 86/86 passing
- [ ] `npm run build` — successful (no webpack errors)
- [ ] `readme.txt` "Tested up to" is a released WP version
- [ ] `readme.txt` pattern count matches actual pattern count
- [ ] `readme.txt` stable tag matches `goblocks.php` version constant
- [ ] All 11 patterns render correctly on 375px mobile (no horizontal scroll)
- [ ] Plugin icon exists at `assets/icon-128x128.png`
- [ ] Plugin zip < 10MB (WP.org limit)
- [ ] No `console.log`, `var_dump`, or debug output in any file
- [ ] No hardcoded URLs in PHP (must use `home_url()`, `plugin_url()` etc.)
- [ ] No calls to deprecated WP functions
- [ ] License header on all PHP files (GPLv2+)
- [ ] `.gitignore` excludes `node_modules`, `vendor`, build artifacts
- [ ] `PROGRESS.md` and `.claude/` docs do NOT ship in the plugin zip (add to `.distignore`)

---

## DESIGN COMPARISON: GoBlocks vs GenerateBlocks

| Capability | GenerateBlocks | GoBlocks (current) | GoBlocks (after plan) |
|---|---|---|---|
| Inspector layout | Single scroll panel | Tabbed + breakpoint | Tabbed + breakpoint (✓) |
| Inspector visual identity | WP-blue on WP-white | White tabs, blue underline | **Dark frame + white panels** |
| Breakpoint indicator | None | Indigo dot on label (✓) | Indigo dot on label (✓) |
| Control density | Comfortable | Tight / professional | Tight / professional (✓) |
| Pattern count | 30+ | 11 | 15 |
| Pattern responsive | Yes | **No (broken)** | **Yes (fixed)** |
| Pattern icon quality | SVG | **Emoji** (card grid) | SVG (fixed) |
| Block default appearance | Visible placeholder | Invisible | Editor outline (fixed) |
| Copy/paste styles | Pro only | No | Deferred to v1.1 |
| CSS output | Inline + file | File only (better) | File only (✓) |
| Frontend JS | Small | Zero for layout (better) | Zero for layout (✓) |

---

*Plan authored: 2026-06-17*  
*Execute steps in order. Each step is independently verifiable. Mark done in PROGRESS.md after each.*

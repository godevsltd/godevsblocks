# Block Parity: GoBlocks vs GenerateBlocks

_Step 1 output — 2026-06-16. Do not edit; regenerate from source audit._

## Block Comparison Table

| Block Name | GB Dir | GoBlocks Dir | Status |
|---|---|---|---|
| Container / Box | `element` (modern) + `container` (legacy) | `box` | ✅ Complete |
| Text | `text` | `text` | ✅ Complete |
| Headline / Heading | `headline` (legacy) | `heading` | ✅ Complete |
| Button | `button` (legacy) | `button` | ✅ Complete |
| **Buttons (group wrapper)** | `button-container` (legacy) | ❌ none | ❌ Missing |
| Grid | `grid` (legacy) | `grid` | ✅ Complete |
| Image (legacy) | `image` (legacy) | `image` | ✅ Complete |
| Image / Media (modern) | `media` | `image` | ✅ Complete |
| Shape Divider | `shape` | `shape` | ✅ Complete |
| Query | `query` | `query` | ✅ Complete |
| Query Loop (legacy) | `query-loop` (legacy) | `query-loop` | ✅ Complete |
| Looper (modern container) | `looper` | merged into `query-loop` | ⚠️ Partial |
| Loop Item (modern template) | `loop-item` | merged into `query-loop` | ⚠️ Partial |
| **No Results** | `query-no-results` | ❌ none | ❌ **Missing** |
| Page Numbers / Pagination | `query-page-numbers` | `pagination` | ⚠️ Partial |
| Icon | ❌ none | `icon` | ✅ GoBlocks-only |
| Accordion | ❌ none | `accordion` + `accordion-item` | ✅ GoBlocks-only |
| Tabs | ❌ none | `tabs` + `tab-panel` | ✅ GoBlocks-only |
| Modal | ❌ none | `modal` (scaffolded, P2) | 🔧 Planned |
| Pricing Table | ❌ none | `pricing` (scaffolded, P2) | 🔧 Planned |
| Slider | ❌ none | `slider` (scaffolded, P2) | 🔧 Planned |
| Timeline | ❌ none | `timeline` (scaffolded, P2) | 🔧 Planned |

## Gap Analysis

### ❌ query-no-results (Priority: HIGH)

GB's `query-no-results` block renders inside a Query block when the query returns
zero posts. It has no attributes — just an innerBlocks template for the editor to
populate with a "Nothing found" message, CTA, or search form.

GoBlocks has no equivalent. Users building archive / search pages currently have no
way to surface an empty-state in the editor. This is a genuine functional gap, not
a cosmetic one: without it, a zero-result query renders blank with no user feedback.

**What to port:**
- `src/blocks/query-no-results/` — block.json + edit.tsx + save.tsx (returns null)
- `includes/Blocks/QueryNoResults.php` — dynamic render that outputs only when
  `$block->context['goblocks/query/totalResults'] === 0`
- The Query block's render callback must pass `totalResults` into context.

### ❌ button-container (Priority: LOW)

GB's `button-container` is a flex wrapper whose only purpose is grouping buttons with
shared gap and alignment. GoBlocks users can already achieve this with a `box` block
set to `display: flex`, so this is a quality-of-life gap, not a functional one.

No dedicated block needed unless user research shows high friction. Document the
Box workaround in the Pattern Library instead.

### ⚠️ Looper / Loop Item split (Priority: MEDIUM — defer to Phase 3+)

GB separates the Looper (query executor container) from Loop Item (per-post template
wrapper, supports tag: `article` / `li` / `a`). GoBlocks merges both into `query-loop`.

The merged approach works but makes the per-item semantic tag inaccessible and blocks
future features like separate Looper-level classes vs. Loop Item classes. This is an
attribute-schema change — flag for Phase 3 architecture review, not a quick port.

### ⚠️ query-page-numbers vs. pagination (Priority: LOW)

GoBlocks `pagination` is richer (standard / load-more / infinite-scroll modes). GB's
`query-page-numbers` only does standard numeric pagination with a `midSize` attribute.
GoBlocks is ahead here. No action needed.

## Recommendation

Port `query-no-results` as the only genuinely missing block. Add it after Step 3
review. All other gaps are either covered by existing blocks, GoBlocks advantages,
or deferred-to-later architecture decisions.

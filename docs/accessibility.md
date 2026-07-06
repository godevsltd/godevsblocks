# Accessibility

GoBlocks targets **WCAG 2.1 Level AA** compliance across all blocks. This page documents the accessibility features built into each interactive block and the general principles applied throughout.

---

## Design Principles

### Semantic HTML First

GoBlocks generates semantic HTML by default:

- **Group** block lets you choose the wrapping element: `div`, `section`, `article`, `aside`, `header`, `footer`, or `main`.
- **Heading** block outputs `<h1>` through `<h6>` — never a styled `<div>`.
- **Button** block outputs `<a>` for links and `<button>` for actions.
- **Accordion** uses native `<details>/<summary>` — browser-native keyboard handling, no JS required.
- **Separator** outputs `<hr>` with the correct ARIA role.

### No Reliance on Color Alone

Block variants (Alert, Progress Bar) that convey meaning through color also include an icon or text label indicating the type.

### Focus Visibility

All interactive elements have visible focus indicators. GoBlocks's CSS does not suppress `:focus` styles — `outline` is never set to `none` without an equivalent `:focus-visible` replacement.

### Reduced Motion

GoBlocks respects the `prefers-reduced-motion` media query. All CSS animations and JavaScript-driven animations (Counter, Progress Bar, Countdown, Flip Card) are disabled or reduced when the user has requested reduced motion in their OS settings.

```css
@media (prefers-reduced-motion: reduce) {
  .gb-counter,
  .gb-progress-bar,
  .gb-flip-card {
    animation: none;
    transition: none;
  }
}
```

---

## Block-by-Block Accessibility

### Tabs (`goblocks/tabs`)

Implements the [ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

| Attribute / Behavior | Value |
|---|---|
| Tab list | `role="tablist"` |
| Each tab | `role="tab"`, `aria-selected="true/false"`, `aria-controls="{panelId}"`, `tabindex="0/-1"` |
| Each panel | `role="tabpanel"`, `aria-labelledby="{tabId}"`, `tabindex="0"` |
| Arrow Left / Right | Moves focus between tabs |
| Home | Moves focus to first tab |
| End | Moves focus to last tab |
| Enter / Space | Activates the focused tab |

### Accordion (`goblocks/accordion`)

Uses native `<details>/<summary>` elements, which have built-in ARIA semantics in all modern browsers:

- `<details>` maps to `role="group"` with `aria-expanded`
- `<summary>` maps to `role="button"`
- Enter/Space toggles the disclosure from `<summary>`
- No additional ARIA attributes required

When **FAQ Schema** is enabled, `<script type="application/ld+json">` is output with `FAQPage`, `Question`, and `Answer` types — this is invisible to screen readers and does not affect the ARIA structure.

### Modal (`goblocks/modal`)

Implements the [ARIA Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

| Attribute / Behavior | Value |
|---|---|
| Dialog element | `<dialog>`, `aria-modal="true"`, `aria-labelledby="{headingId}"` |
| Focus management | Focus moves to the first focusable element inside the dialog on open |
| Focus trap | Tab and Shift+Tab cycle only within the dialog while open |
| Escape | Closes the dialog and returns focus to the trigger button |
| Backdrop click | Closes the dialog |
| Trigger button | `aria-haspopup="dialog"`, `aria-controls="{dialogId}"` |

### Navigation (`goblocks/navigation`)

| Attribute / Behavior | Value |
|---|---|
| Nav element | `<nav>`, `aria-label="Main navigation"` (customizable) |
| Submenus | `aria-haspopup="true"`, `aria-expanded="false/true"` on toggle |
| Mobile toggle button | `aria-controls="{menuId}"`, `aria-expanded="false/true"` |
| Skip link | Renders a "Skip to content" link as the first focusable element in the page (when block is first in template) |

### Slider (`goblocks/slider`)

| Attribute / Behavior | Value |
|---|---|
| Slider container | `role="region"`, `aria-label="Slider"` (customizable) |
| Previous/Next buttons | `aria-label="Previous slide"`, `aria-label="Next slide"` |
| Dot indicators | `role="tablist"`, each dot is `role="tab"` with `aria-label="Slide N"` |
| Autoplay pause on focus | Autoplay pauses when keyboard focus enters the slider |
| Pause on hover | Autoplay pauses on mouse hover |

### Counter (`goblocks/counter`)

The counter outputs a `<span>` with `aria-live="polite"` and `aria-atomic="true"`, so screen readers announce the final value when the animation completes (rather than reading every intermediate number).

### Progress Bar (`goblocks/progress-bar`)

```html
<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" aria-label="Completion: 75%">
```

### Alert (`goblocks/alert`)

| Variant | ARIA role |
|---|---|
| Info | `role="note"` |
| Success | `role="status"` |
| Warning | `role="note"` |
| Error | `role="alert"` (assertive live region) |

The Error variant uses `role="alert"` (assertive), which announces immediately. Other variants use `role="note"` (polite). Dismissible alerts remove the element from the DOM on close — no lingering ghost node.

### Flip Card (`goblocks/flip-card`)

The flip card renders with a visible toggle button for keyboard users. The front and back are both in the DOM, with the hidden face set to `aria-hidden="true"` so screen readers don't read both sides simultaneously.

### Video (`goblocks/video`)

The lazy facade renders as a `<button>` with `aria-label="Play video"`. Activating it (Enter or Space) loads and plays the video. The iframe, once loaded, receives `title="Video player"`.

### Icon (`goblocks/icon`)

When the Icon block is used purely decoratively, it outputs `aria-hidden="true"`. When an ARIA label is set in the Inspector, it outputs `role="img"` and `aria-label="{your_label}"`.

### Image (`goblocks/image`)

Alt text is required in the Inspector (not optional). Empty alt (`alt=""`) is available for decorative images that should be skipped by screen readers.

### Button (`goblocks/button`)

If the button has no visible text (icon-only button), an ARIA label field is required in the Inspector before the block validates.

---

## Color Contrast

GoBlocks's default design token palette is tested against WCAG 2.1 AA minimum contrast ratios:

- Normal text: ≥ 4.5:1
- Large text (18pt+ or 14pt+ bold): ≥ 3:1
- UI components and focus indicators: ≥ 3:1

When you override colors using the block Inspector or Global Styles, GoBlocks displays a contrast ratio indicator in the color picker to help you maintain accessible color combinations.

---

## Skip Links

When a **Navigation** block is placed at the very start of a page template (as it typically is in a Header template part), GoBlocks renders a visually hidden "Skip to main content" link as the first focusable element. This link becomes visible on focus and jumps to the `<main>` element (or the first element with `id="main"` if no `<main>` is present).

---

## Keyboard Navigation Summary

| Block | Keys |
|---|---|
| Tabs | Arrow Left/Right, Home, End, Enter, Space |
| Accordion | Enter, Space (native `<details>`) |
| Modal | Tab (trapped), Shift+Tab, Escape |
| Navigation | Tab, Arrow keys (submenu), Escape (close submenu) |
| Slider | Arrow Left/Right (between slides) |
| Flip Card | Enter, Space (toggle) |
| Video facade | Enter, Space |

---

## Testing Recommendations

Before deploying, test with:

- **Screen reader + keyboard only**: [NVDA](https://www.nvaccess.org/) (Windows) or [VoiceOver](https://support.apple.com/guide/voiceover/welcome/mac) (macOS/iOS)
- **Keyboard only**: Tab through the page, verify focus order is logical and focus ring is always visible
- **axe DevTools browser extension**: catches 57% of WCAG issues automatically
- **Contrast checker**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) for custom colors
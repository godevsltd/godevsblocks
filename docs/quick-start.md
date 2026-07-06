# Quick Start

Get GoBlocks working on your site in under five minutes.

---

## Step 1 — Activate the Plugin

If you have not installed GoBlocks yet, see [Installation](installation.md). Once installed, click **Activate** from the Plugins screen.

---

## Step 2 — Open the Block Editor

Open any post or page for editing. You can also open the **Site Editor** (Appearance → Editor) if you are using a Full Site Editing theme.

---

## Step 3 — Find GoBlocks Blocks

Click the **+** button (block inserter) in the top-left toolbar or in any empty block area. Scroll to the **GoBlocks** category, or type the block name in the search field.

**Tip:** Type `gb` in the block inserter search to filter all GoBlocks blocks instantly.

---

## Step 4 — Insert Your First Block

### Start with a Pattern (Fastest)

Patterns give you a complete, styled section in one click.

1. In the block inserter, switch to the **Patterns** tab.
2. Browse or search the **GoBlocks** category.
3. Click any pattern to insert it into the page.
4. Replace the placeholder text and images with your own content.

Available pattern types: Hero, Features, Cards, Pricing, FAQ, Stats, CTA, Blog, Portfolio, Team, Testimonials, Newsletter, Contact, Logos, and more.

### Start from a Blank Block

Insert a **Group** block (the primary layout container):

1. Click **+** and search for `Group`.
2. Insert it. You will see an empty container with a **+** in the center.
3. Click the **+** to add child blocks — for example, a **Heading** and a **Text** block.
4. Use the right-hand **Inspector** panel to adjust spacing, background, border, and layout.

---

## Step 5 — Customize with the Inspector

Every GoBlocks block has an **Inspector** panel (right sidebar) with these sections:

| Section | What it controls |
|---|---|
| **Styles** | Background, border, padding, margin, border-radius, shadow |
| **Typography** | Font family, size, weight, line height, color |
| **Layout** | Flexbox or grid, direction, alignment, gap |
| **Responsive** | Per-breakpoint overrides for any property |
| **Advanced** | Custom CSS class, HTML attributes, animation |

---

## Step 6 — Set Up Global Styles (Optional)

Global Styles let you define a color palette and typography presets that apply to every GoBlocks block on your site.

1. In the WordPress admin, go to **GoBlocks → Global Styles**.
2. Add your brand colors to the **Color Palette** — each color becomes a `--gb-color-{slug}` token available in every block's color picker.
3. Define typography presets for headings and body text.
4. Click **Save**.

---

## Step 7 — Configure Settings (Optional)

Go to **GoBlocks → Settings** to adjust:

- **Container width** — the maximum width of contained blocks (default: 1200px)
- **CSS Print Method** — `file` (recommended) or `inline`
- **Breakpoints** — pixel values for the 7 responsive breakpoints
- **Dark Mode** — enable CSS dark mode tokens

See [Settings](settings.md) for the full reference.

---

## Next Steps

| Goal | Where to go |
|---|---|
| Learn about all 36 blocks | [Blocks Reference](blocks.md) |
| Use responsive controls | [Responsive Controls](responsive-controls.md) |
| Show dynamic post data | [Dynamic Content](dynamic-content.md) |
| Use in the Site Editor | [Full Site Editing](fse.md) |
| Extend with code | [Developer Guide](developer/guide.md) |
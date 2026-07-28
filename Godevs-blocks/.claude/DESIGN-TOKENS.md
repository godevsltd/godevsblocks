# GoBlocks — Design Token Reference

## Naming Convention

```
--gb-{category}-{scale-or-name}[-{state}]

Rules:
  • Always prefixed with --gb-
  • Category: color | text | space | weight | leading | tracking
              radius | shadow | z | container | font
  • Scale: numeric (1-96) OR semantic (xs/sm/md/lg/xl/2xl/3xl)
  • State suffix: -hover | -active | -focus | -disabled
  • Primitives: --gb-primitive-{hue}-{shade} — NEVER used in markup directly
  • Component scope: --gb-{block}-{property}  e.g. --gb-btn-bg
  • No camelCase — hyphens only
```

## Three-Tier Token Architecture

```
Tier 1 — Primitive  (raw values, never used in markup)
  --gb-primitive-blue-600: #2563eb

Tier 2 — Semantic   (meaningful aliases, used in components)
  --gb-color-primary: var(--gb-primitive-blue-600)

Tier 3 — Component  (scoped per block, user-overrideable)
  --gb-btn-bg: var(--gb-color-primary)
```

## Color Tokens

### Semantic Palette (output to :root)
```css
/* Brand */
--gb-color-primary:          #2563eb
--gb-color-primary-hover:    #1d4ed8
--gb-color-primary-light:    #eff6ff
--gb-color-secondary:        #374151
--gb-color-secondary-hover:  #1f2937
--gb-color-accent:           #3b82f6

/* Surfaces */
--gb-color-surface:          #ffffff
--gb-color-surface-raised:   #f9fafb
--gb-color-surface-overlay:  #f3f4f6
--gb-color-surface-inverse:  #111827

/* Text */
--gb-color-text:             #111827
--gb-color-text-muted:       #6b7280
--gb-color-text-inverse:     #ffffff
--gb-color-text-on-primary:  #ffffff

/* Borders */
--gb-color-border:           #e5e7eb
--gb-color-border-strong:    #9ca3af
--gb-color-border-focus:     #3b82f6

/* Feedback */
--gb-color-success:          #16a34a
--gb-color-warning:          #d97706
--gb-color-danger:           #dc2626
--gb-color-info:             #0284c7
```

### Dark Mode Override (both prefers-color-scheme and .gb-dark-mode class)
```css
--gb-color-surface:          #111827
--gb-color-surface-raised:   #1f2937
--gb-color-surface-overlay:  #374151
--gb-color-text:             #f9fafb
--gb-color-text-muted:       #9ca3af
--gb-color-border:           #374151
```

## Typography Tokens

### Font Families
```css
--gb-font-sans:     system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--gb-font-serif:    Georgia, 'Times New Roman', serif
--gb-font-mono:     'Fira Code', Consolas, monospace
--gb-font-heading:  var(--gb-font-sans)
--gb-font-body:     var(--gb-font-sans)
```

### Font Size Scale (Major Third 1.25× ratio)
```css
--gb-text-2xs:  0.625rem   /*  10px */
--gb-text-xs:   0.75rem    /*  12px */
--gb-text-sm:   0.875rem   /*  14px */
--gb-text-base: 1rem       /*  16px */
--gb-text-lg:   1.125rem   /*  18px */
--gb-text-xl:   1.25rem    /*  20px */
--gb-text-2xl:  1.5rem     /*  24px */
--gb-text-3xl:  1.875rem   /*  30px */
--gb-text-4xl:  2.25rem    /*  36px */
--gb-text-5xl:  3rem       /*  48px */
--gb-text-6xl:  3.75rem    /*  60px */
--gb-text-7xl:  4.5rem     /*  72px */
--gb-text-8xl:  6rem       /*  96px */
--gb-text-9xl:  8rem       /* 128px */
```

### Font Weight
```css
--gb-weight-thin:       100
--gb-weight-extralight: 200
--gb-weight-light:      300
--gb-weight-normal:     400
--gb-weight-medium:     500
--gb-weight-semibold:   600
--gb-weight-bold:       700
--gb-weight-extrabold:  800
--gb-weight-black:      900
```

### Line Height
```css
--gb-leading-none:    1
--gb-leading-tight:   1.25
--gb-leading-snug:    1.375
--gb-leading-normal:  1.5
--gb-leading-relaxed: 1.625
--gb-leading-loose:   2
```

### Letter Spacing
```css
--gb-tracking-tighter: -0.05em
--gb-tracking-tight:   -0.025em
--gb-tracking-normal:   0em
--gb-tracking-wide:     0.025em
--gb-tracking-wider:    0.05em
--gb-tracking-widest:   0.1em
```

## Spacing Tokens (4px base grid)

```css
--gb-space-0:    0
--gb-space-px:   1px
--gb-space-0-5:  0.125rem   /*  2px */
--gb-space-1:    0.25rem    /*  4px */
--gb-space-1-5:  0.375rem   /*  6px */
--gb-space-2:    0.5rem     /*  8px */
--gb-space-2-5:  0.625rem   /* 10px */
--gb-space-3:    0.75rem    /* 12px */
--gb-space-3-5:  0.875rem   /* 14px */
--gb-space-4:    1rem       /* 16px */
--gb-space-5:    1.25rem    /* 20px */
--gb-space-6:    1.5rem     /* 24px */
--gb-space-7:    1.75rem    /* 28px */
--gb-space-8:    2rem       /* 32px */
--gb-space-9:    2.25rem    /* 36px */
--gb-space-10:   2.5rem     /* 40px */
--gb-space-12:   3rem       /* 48px */
--gb-space-14:   3.5rem     /* 56px */
--gb-space-16:   4rem       /* 64px */
--gb-space-20:   5rem       /* 80px */
--gb-space-24:   6rem       /* 96px */
--gb-space-32:   8rem       /* 128px */
--gb-space-40:   10rem      /* 160px */
--gb-space-48:   12rem      /* 192px */
--gb-space-56:   14rem      /* 224px */
--gb-space-64:   16rem      /* 256px */

/* Semantic aliases */
--gb-space-xs:   var(--gb-space-2)     /*  8px */
--gb-space-sm:   var(--gb-space-4)     /* 16px */
--gb-space-md:   var(--gb-space-6)     /* 24px */
--gb-space-lg:   var(--gb-space-10)    /* 40px */
--gb-space-xl:   var(--gb-space-16)    /* 64px */
--gb-space-2xl:  var(--gb-space-24)    /* 96px */
--gb-space-3xl:  var(--gb-space-32)    /* 128px */
```

## Border Radius Tokens

```css
--gb-radius-none:  0
--gb-radius-sm:    0.125rem  /*  2px */
--gb-radius-base:  0.25rem   /*  4px */
--gb-radius-md:    0.375rem  /*  6px */
--gb-radius-lg:    0.5rem    /*  8px */
--gb-radius-xl:    0.75rem   /* 12px */
--gb-radius-2xl:   1rem      /* 16px */
--gb-radius-3xl:   1.5rem    /* 24px */
--gb-radius-full:  9999px
```

## Shadow Tokens

```css
--gb-shadow-none:  none
--gb-shadow-xs:    0 1px 2px 0 rgb(0 0 0 / 0.05)
--gb-shadow-sm:    0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
--gb-shadow-md:    0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--gb-shadow-lg:    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--gb-shadow-xl:    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
--gb-shadow-2xl:   0 25px 50px -12px rgb(0 0 0 / 0.25)
--gb-shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05)
```

## Z-Index Tokens

```css
--gb-z-0:    0
--gb-z-10:   10      /* floating elements */
--gb-z-20:   20      /* sticky headers */
--gb-z-30:   30      /* dropdowns */
--gb-z-40:   40      /* tooltips */
--gb-z-50:   50      /* modals */
--gb-z-60:   60      /* popovers over modals */
--gb-z-70:   70      /* toasts/notifications */
--gb-z-max:  9999    /* critical overlays */
```

## Container Width Tokens

```css
--gb-container-xs:    320px
--gb-container-sm:    576px
--gb-container-md:    768px
--gb-container-lg:    1024px
--gb-container-xl:    1280px
--gb-container-2xl:   1440px
--gb-container-3xl:   1600px
--gb-container-full:  100%
--gb-container-site:  var(--gb-container-xl)   /* user-configurable */
```

## Breakpoints

```
xs:   480px   (min-width)  phones landscape
sm:   640px   (min-width)  large phones
md:   768px   (min-width)  tablets
lg:   1024px  (min-width)  laptops
xl:   1280px  (min-width)  desktops
2xl:  1536px  (min-width)  wide screens
```

Strategy: **mobile-first** (`min-width` media queries).
Breakpoint values are user-configurable in plugin settings (stored in `goblocks_settings`).
The CSS engine reads breakpoints from `window.goblocksEditor.breakpoints` (localized via `wp_localize_script`).

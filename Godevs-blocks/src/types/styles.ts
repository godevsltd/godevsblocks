/**
 * GoBlocks — Block Style Type System
 *
 * All block styling flows through the nested `styles` attribute object.
 * Each property value is a ResponsiveValue — a map of breakpoint/state keys
 * to CSS value strings.
 *
 * See .claude/ATTRIBUTE-SCHEMA.md for full documentation.
 */

// ── Core responsive value types ───────────────────────────────────────────

/** Breakpoint keys — mobile-first (min-width media queries). */
export type Breakpoint = 'base' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Pseudo-state keys — generate :hover, :focus, :active, ::before, ::after selectors. */
export type PseudoState = 'hover' | 'focus' | 'active' | 'before' | 'after';

/** Combined key type for all responsive + state variants. */
export type ValueKey = Breakpoint | PseudoState;

/**
 * A CSS property value that can vary per breakpoint and pseudo-state.
 *
 * At least `base` should be present for any meaningful value, but this
 * is not enforced at the type level to allow partial updates via setStyle().
 *
 * All values are strings — numbers must include units: "20px" not 20.
 */
export type ResponsiveValue = Partial< Record< ValueKey, string > >;

// ── Style category interfaces ─────────────────────────────────────────────

export interface SpacingStyles {
	paddingTop?: ResponsiveValue;
	paddingRight?: ResponsiveValue;
	paddingBottom?: ResponsiveValue;
	paddingLeft?: ResponsiveValue;
	marginTop?: ResponsiveValue;
	marginRight?: ResponsiveValue;
	marginBottom?: ResponsiveValue;
	marginLeft?: ResponsiveValue;
	gap?: ResponsiveValue;
	columnGap?: ResponsiveValue;
	rowGap?: ResponsiveValue;
}

export interface TypographyStyles {
	fontFamily?: ResponsiveValue;
	fontSize?: ResponsiveValue;
	fontWeight?: ResponsiveValue;
	fontStyle?: ResponsiveValue;
	lineHeight?: ResponsiveValue;
	letterSpacing?: ResponsiveValue;
	textTransform?: ResponsiveValue;
	textDecoration?: ResponsiveValue;
	textAlign?: ResponsiveValue;
	color?: ResponsiveValue;
	textShadow?: ResponsiveValue;
}

export interface LayoutStyles {
	display?: ResponsiveValue;
	flexDirection?: ResponsiveValue;
	flexWrap?: ResponsiveValue;
	alignItems?: ResponsiveValue;
	justifyContent?: ResponsiveValue;
	alignContent?: ResponsiveValue;
	flexGrow?: ResponsiveValue;
	flexShrink?: ResponsiveValue;
	flexBasis?: ResponsiveValue;
	gridTemplateColumns?: ResponsiveValue;
	gridTemplateRows?: ResponsiveValue;
	gridColumn?: ResponsiveValue;
	gridRow?: ResponsiveValue;
	overflow?: ResponsiveValue;
	overflowX?: ResponsiveValue;
	overflowY?: ResponsiveValue;
}

export interface SizingStyles {
	width?: ResponsiveValue;
	minWidth?: ResponsiveValue;
	maxWidth?: ResponsiveValue;
	height?: ResponsiveValue;
	minHeight?: ResponsiveValue;
	maxHeight?: ResponsiveValue;
	aspectRatio?: ResponsiveValue;
	objectFit?: ResponsiveValue;
	objectPosition?: ResponsiveValue;
}

export interface BorderStyles {
	borderTopWidth?: ResponsiveValue;
	borderTopStyle?: ResponsiveValue;
	borderTopColor?: ResponsiveValue;
	borderRightWidth?: ResponsiveValue;
	borderRightStyle?: ResponsiveValue;
	borderRightColor?: ResponsiveValue;
	borderBottomWidth?: ResponsiveValue;
	borderBottomStyle?: ResponsiveValue;
	borderBottomColor?: ResponsiveValue;
	borderLeftWidth?: ResponsiveValue;
	borderLeftStyle?: ResponsiveValue;
	borderLeftColor?: ResponsiveValue;
	borderTopLeftRadius?: ResponsiveValue;
	borderTopRightRadius?: ResponsiveValue;
	borderBottomRightRadius?: ResponsiveValue;
	borderBottomLeftRadius?: ResponsiveValue;
	outline?: ResponsiveValue;
	outlineOffset?: ResponsiveValue;
}

export interface BackgroundStyles {
	backgroundColor?: ResponsiveValue;
	backgroundImage?: ResponsiveValue;
	backgroundSize?: ResponsiveValue;
	backgroundPosition?: ResponsiveValue;
	backgroundRepeat?: ResponsiveValue;
	backgroundAttachment?: ResponsiveValue;
	gradient?: ResponsiveValue;
	overlayColor?: ResponsiveValue;
	overlayOpacity?: ResponsiveValue;
}

export interface EffectsStyles {
	opacity?: ResponsiveValue;
	boxShadow?: ResponsiveValue;
	transform?: ResponsiveValue;
	transition?: ResponsiveValue;
	filter?: ResponsiveValue;
	backdropFilter?: ResponsiveValue;
	mixBlendMode?: ResponsiveValue;
	cursor?: ResponsiveValue;
}

export interface PositionStyles {
	position?: ResponsiveValue;
	top?: ResponsiveValue;
	right?: ResponsiveValue;
	bottom?: ResponsiveValue;
	left?: ResponsiveValue;
	zIndex?: ResponsiveValue;
}

/**
 * Per-block CSS custom properties (CSS variables).
 *
 * Keys must be CSS custom property names starting with `--`.
 * Values are responsive — each breakpoint emits the variable on the root element.
 *
 * @example
 *   styles.variables = { '--gb-tabs-active-color': { base: '#4f46e5' } }
 *   // → .gb-tabs-abc123 { --gb-tabs-active-color: #4f46e5; }
 */
export type CssVariablesStyles = Record< string, ResponsiveValue >;

/**
 * The complete `styles` attribute object.
 * All categories are optional — omitted categories produce no CSS.
 */
export interface BlockStyles {
	spacing?: SpacingStyles;
	typography?: TypographyStyles;
	layout?: LayoutStyles;
	sizing?: SizingStyles;
	border?: BorderStyles;
	background?: BackgroundStyles;
	effects?: EffectsStyles;
	position?: PositionStyles;
	variables?: CssVariablesStyles;
}

/** All category names as a union type. */
export type StyleCategory = keyof BlockStyles;

/** Map of CSS property name → property key within a category. */
export type StylePropertyOf< C extends StyleCategory > = keyof NonNullable<
	BlockStyles[ C ]
>;

// ── Breakpoint config ─────────────────────────────────────────────────────

/**
 * Breakpoint configuration loaded from plugin settings.
 * Record of breakpoint key → min-width in pixels.
 */
export type BreakpointConfig = Record< Exclude< Breakpoint, 'base' >, number >;

/** Default breakpoint config — overridden by plugin settings. */
export const DEFAULT_BREAKPOINTS: BreakpointConfig = {
	xs: 480,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	'2xl': 1536,
} as const;

/** Ordered breakpoints from smallest to largest (excludes 'base'). */
export const BREAKPOINT_ORDER: ReadonlyArray< Exclude< Breakpoint, 'base' > > =
	[ 'xs', 'sm', 'md', 'lg', 'xl', '2xl' ] as const;

/** All pseudo-state keys. */
export const PSEUDO_STATES: ReadonlyArray< PseudoState > = [
	'hover',
	'focus',
	'active',
	'before',
	'after',
] as const;

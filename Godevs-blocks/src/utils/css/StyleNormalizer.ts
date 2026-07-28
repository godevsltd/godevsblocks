/**
 * StyleNormalizer — Pipeline Stage 1
 *
 * Receives raw `attributes.styles`, strips empty/invalid values, and returns
 * a clean BlockStyles object ready for rule building.
 *
 * Responsibilities:
 *  - Remove empty string values from every ResponsiveValue
 *  - Remove empty property objects after stripping
 *  - Remove empty category objects after stripping
 *  - Validate CSS values (rejects obvious junk; passes through var(), keywords)
 *  - Extract overlay declarations into a synthetic `_overlay` side-channel
 *    (consumed by RuleBuilder to emit ::before rules)
 */

import type {
	BlockStyles,
	SpacingStyles,
	TypographyStyles,
	LayoutStyles,
	SizingStyles,
	BorderStyles,
	BackgroundStyles,
	EffectsStyles,
	PositionStyles,
	CssVariablesStyles,
	Breakpoint,
	PseudoState,
} from '../../types/styles';

// ── Types ─────────────────────────────────────────────────────────────────

type ValueKey = Breakpoint | PseudoState;
type ResponsiveMap = Partial< Record< ValueKey, string > >;
type CategoryMap = Record< string, ResponsiveMap >;

export interface NormalizedStyles {
	/** Clean BlockStyles with empty values removed. */
	styles: BlockStyles;
	/**
	 * Overlay declarations extracted from `background.overlayColor` and
	 * `background.overlayOpacity`. Keyed as ResponsiveValue maps so the
	 * RuleBuilder can emit them as ::before CSS rules.
	 */
	overlay: {
		color: ResponsiveMap;
		opacity: ResponsiveMap;
	};
}

// ── CSS value validation ──────────────────────────────────────────────────

// Reject HTML-injection chars (<>"`) but allow single quotes — valid in CSS
// for font-family names ('Open Sans') and url() background images.
const REJECT_PATTERN = /[<>"]/;

/**
 * Basic CSS value guard — rejects values that contain characters that
 * cannot appear in valid CSS (which would indicate injection attempts or
 * garbage data). Passes through everything else; full sanitization happens
 * server-side in PHP.
 * @param value
 */
function isValidCssValue( value: string ): boolean {
	if ( '' === value ) {
		return false;
	}
	return ! REJECT_PATTERN.test( value );
}

// ── Core normalizer ───────────────────────────────────────────────────────

function normalizeResponsiveMap( map: unknown ): ResponsiveMap {
	if ( ! map || 'object' !== typeof map || Array.isArray( map ) ) {
		return {};
	}

	const out: ResponsiveMap = {};
	for ( const [ key, value ] of Object.entries(
		map as Record< string, unknown >
	) ) {
		if ( 'string' === typeof value && isValidCssValue( value ) ) {
			out[ key as ValueKey ] = value;
		}
	}
	return out;
}

function normalizeCategoryMap( category: unknown ): CategoryMap {
	if (
		! category ||
		'object' !== typeof category ||
		Array.isArray( category )
	) {
		return {};
	}

	const out: CategoryMap = {};
	for ( const [ prop, responsive ] of Object.entries(
		category as Record< string, unknown >
	) ) {
		const normalized = normalizeResponsiveMap( responsive );
		if ( Object.keys( normalized ).length > 0 ) {
			out[ prop ] = normalized;
		}
	}
	return out;
}

// ── Overlay extractor ─────────────────────────────────────────────────────

function extractOverlay( background: CategoryMap ): {
	color: ResponsiveMap;
	opacity: ResponsiveMap;
	cleaned: CategoryMap;
} {
	const { overlayColor, overlayOpacity, ...rest } = background;
	return {
		color: overlayColor ?? {},
		opacity: overlayOpacity ?? {},
		cleaned: rest,
	};
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Normalize raw `attributes.styles` into a clean, validated structure.
 *
 * Callers: `RuleBuilder.build()` calls this internally, so blocks rarely
 * need to call it directly.
 * @param raw
 */
export function normalizeStyles( raw: BlockStyles ): NormalizedStyles {
	const spacing = normalizeCategoryMap(
		raw.spacing
	) as Partial< SpacingStyles >;
	const typography = normalizeCategoryMap(
		raw.typography
	) as Partial< TypographyStyles >;
	const layout = normalizeCategoryMap(
		raw.layout
	) as Partial< LayoutStyles >;
	const sizing = normalizeCategoryMap(
		raw.sizing
	) as Partial< SizingStyles >;
	const border = normalizeCategoryMap(
		raw.border
	) as Partial< BorderStyles >;
	const effects = normalizeCategoryMap(
		raw.effects
	) as Partial< EffectsStyles >;
	const position = normalizeCategoryMap(
		raw.position
	) as Partial< PositionStyles >;

	const backgroundRaw = normalizeCategoryMap( raw.background );
	const {
		color,
		opacity,
		cleaned: background,
	} = extractOverlay( backgroundRaw );

	const variables = normalizeCategoryMap( raw.variables );

	const styles: BlockStyles = {};
	if ( Object.keys( spacing ).length ) {
		styles.spacing = spacing as SpacingStyles;
	}
	if ( Object.keys( typography ).length ) {
		styles.typography = typography as TypographyStyles;
	}
	if ( Object.keys( layout ).length ) {
		styles.layout = layout as LayoutStyles;
	}
	if ( Object.keys( sizing ).length ) {
		styles.sizing = sizing as SizingStyles;
	}
	if ( Object.keys( border ).length ) {
		styles.border = border as BorderStyles;
	}
	if ( Object.keys( background ).length ) {
		styles.background = background as BackgroundStyles;
	}
	if ( Object.keys( effects ).length ) {
		styles.effects = effects as EffectsStyles;
	}
	if ( Object.keys( position ).length ) {
		styles.position = position as PositionStyles;
	}
	if ( Object.keys( variables ).length ) {
		styles.variables = variables as CssVariablesStyles;
	}

	return {
		styles,
		overlay: { color, opacity },
	};
}

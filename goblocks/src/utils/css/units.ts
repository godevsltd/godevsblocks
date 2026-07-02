/**
 * CSS unit parsing and normalization utilities.
 */

// ── Known unit types ──────────────────────────────────────────────────────

export type CssUnit =
	| 'px'
	| 'rem'
	| 'em'
	| '%'
	| 'vw'
	| 'vh'
	| 'svh'
	| 'dvh'
	| 'vmin'
	| 'vmax'
	| 'ch'
	| 'ex'
	| 'fr'
	| 'deg'
	| 'turn'
	| 'ms'
	| 's'
	| ''; // unitless (line-height, opacity, z-index, font-weight)

/** CSS value keywords that should be passed through unchanged. */
const CSS_KEYWORDS = new Set( [
	'auto',
	'none',
	'inherit',
	'initial',
	'unset',
	'revert',
	'normal',
	'bold',
	'italic',
	'underline',
	'line-through',
	'uppercase',
	'lowercase',
	'capitalize',
	'left',
	'right',
	'center',
	'justify',
	'flex',
	'block',
	'inline',
	'inline-block',
	'grid',
	'inline-flex',
	'inline-grid',
	'relative',
	'absolute',
	'fixed',
	'sticky',
	'static',
	'hidden',
	'visible',
	'scroll',
	'cover',
	'contain',
	'solid',
	'dashed',
	'dotted',
	'double',
	'transparent',
	'currentcolor',
	'row',
	'column',
	'row-reverse',
	'column-reverse',
	'wrap',
	'nowrap',
	'wrap-reverse',
	'stretch',
	'baseline',
	'flex-start',
	'flex-end',
	'space-between',
	'space-around',
	'space-evenly',
	'0',
] );

/** Default units per CSS property name. */
const PROPERTY_UNITS: Record< string, CssUnit > = {
	paddingTop: 'px',
	paddingRight: 'px',
	paddingBottom: 'px',
	paddingLeft: 'px',
	marginTop: 'px',
	marginRight: 'px',
	marginBottom: 'px',
	marginLeft: 'px',
	gap: 'px',
	columnGap: 'px',
	rowGap: 'px',
	width: 'px',
	minWidth: 'px',
	maxWidth: 'px',
	height: 'px',
	minHeight: 'px',
	maxHeight: 'px',
	borderTopWidth: 'px',
	borderRightWidth: 'px',
	borderBottomWidth: 'px',
	borderLeftWidth: 'px',
	borderTopLeftRadius: 'px',
	borderTopRightRadius: 'px',
	borderBottomRightRadius: 'px',
	borderBottomLeftRadius: 'px',
	top: 'px',
	right: 'px',
	bottom: 'px',
	left: 'px',
	fontSize: 'rem',
	lineHeight: '', // unitless
	fontWeight: '', // unitless
	letterSpacing: 'em',
	opacity: '', // unitless 0–1
	zIndex: '', // unitless integer
	flexGrow: '', // unitless
	flexShrink: '', // unitless
	order: '', // unitless integer
	columns: '', // CSS multi-column count, unitless
	aspectRatio: '', // e.g. 16/9, no unit
	columnCount: '', // unitless integer
};

// ── Parsed value ──────────────────────────────────────────────────────────

export interface ParsedCssValue {
	number: number;
	unit: CssUnit;
	raw: string;
}

/**
 * Parse a CSS value string into its numeric and unit parts.
 * Returns null for keywords and var() references.
 * @param value
 */
export function parseValue( value: string ): ParsedCssValue | null {
	value = value.trim();

	if ( ! value || CSS_KEYWORDS.has( value.toLowerCase() ) ) {
		return null;
	}

	if ( value.startsWith( 'var(' ) ) {
		return null;
	}

	const match =
		/^(-?[\d.]+)(px|rem|em|%|vw|vh|svh|dvh|vmin|vmax|ch|ex|fr|deg|turn|ms|s)?$/.exec(
			value
		);

	if ( ! match ) {
		return null;
	}

	return {
		number: parseFloat( match[ 1 ] ?? '0' ),
		unit: ( match[ 2 ] ?? '' ) as CssUnit,
		raw: value,
	};
}

/**
 * Add a unit to a bare number string, using the property's default unit.
 * If the value already has a unit, a keyword, or is a var(), returns as-is.
 *
 * @param value
 * @param property
 * @example
 * withUnit('20', 'paddingTop')      → '20px'
 * withUnit('1.5', 'lineHeight')     → '1.5'  (unitless)
 * withUnit('auto', 'marginLeft')    → 'auto'
 * withUnit('20px', 'paddingTop')    → '20px' (already has unit)
 */
export function withUnit( value: string, property?: string ): string {
	value = value.trim();

	if ( ! value ) {
		return value;
	}

	// Pass through keywords, var(), and gradient functions.
	if (
		CSS_KEYWORDS.has( value.toLowerCase() ) ||
		value.startsWith( 'var(' ) ||
		value.includes( 'gradient(' )
	) {
		return value;
	}

	const parsed = parseValue( value );

	// Already has a unit — return as-is.
	if ( parsed && '' !== parsed.unit ) {
		return value;
	}

	// Bare number — append default unit for the property.
	if ( parsed && '' === parsed.unit ) {
		if ( '0' === value || '0' === String( parsed.number ) ) {
			return '0';
		}
		const defaultUnit =
			( property ? PROPERTY_UNITS[ property ] : undefined ) ?? 'px';
		return defaultUnit ? value + defaultUnit : value;
	}

	return value;
}

/**
 * Strip units from a CSS value, returning just the numeric string.
 *
 * @param value
 * @example
 * stripUnit('20px')  → '20'
 * stripUnit('1.5rem') → '1.5'
 */
export function stripUnit( value: string ): string {
	const parsed = parseValue( value );
	return parsed ? String( parsed.number ) : value;
}

/**
 * Convert a value to the target unit.
 *
 * Basic conversions only — px↔rem (assumes 16px root), px↔em requires context.
 * @param value
 * @param toUnit
 * @param rootFontSize
 */
export function convertUnit(
	value: string,
	toUnit: CssUnit,
	rootFontSize = 16
): string {
	const parsed = parseValue( value );

	if ( ! parsed ) {
		return value;
	}
	if ( parsed.unit === toUnit ) {
		return value;
	}

	let px = parsed.number;

	// Convert from source to px.
	if ( parsed.unit === 'rem' ) {
		px = parsed.number * rootFontSize;
	}
	if ( parsed.unit === 'em' ) {
		px = parsed.number * rootFontSize;
	}

	// Convert from px to target.
	let result = px;
	if ( toUnit === 'rem' ) {
		result = px / rootFontSize;
	}
	if ( toUnit === 'em' ) {
		result = px / rootFontSize;
	}

	// Round to 4 decimal places.
	const rounded = Math.round( result * 10000 ) / 10000;
	return `${ rounded }${ toUnit }`;
}

/**
 * Return the default unit for a given CSS property name.
 * @param property
 */
export function getDefaultUnit( property: string ): CssUnit {
	return PROPERTY_UNITS[ property ] ?? 'px';
}

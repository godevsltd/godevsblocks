/**
 * CSS shorthand expansion utilities.
 *
 * GoBlocks attribute schema always uses longhand properties.
 * These utilities expand any shorthand values that may arrive from
 * legacy attributes or external sources.
 */

// ── Shorthand expansion maps ──────────────────────────────────────────────

/**
 * Expand a 1–4 value shorthand into top/right/bottom/left values.
 * Follows CSS box-model shorthand rules.
 *
 * @param shorthand
 * @example
 * expandBoxShorthand('10px')           → ['10px','10px','10px','10px']
 * expandBoxShorthand('10px 20px')      → ['10px','20px','10px','20px']
 * expandBoxShorthand('10px 20px 5px')  → ['10px','20px','5px','20px']
 * expandBoxShorthand('1px 2px 3px 4px') → ['1px','2px','3px','4px']
 */
export function expandBoxShorthand(
	shorthand: string
): [ string, string, string, string ] {
	const parts = shorthand.trim().split( /\s+/ );

	switch ( parts.length ) {
		case 1:
			return [ parts[ 0 ]!, parts[ 0 ]!, parts[ 0 ]!, parts[ 0 ]! ];
		case 2:
			return [ parts[ 0 ]!, parts[ 1 ]!, parts[ 0 ]!, parts[ 1 ]! ];
		case 3:
			return [ parts[ 0 ]!, parts[ 1 ]!, parts[ 2 ]!, parts[ 1 ]! ];
		case 4:
			return [ parts[ 0 ]!, parts[ 1 ]!, parts[ 2 ]!, parts[ 3 ]! ];
		default:
			return [ shorthand, shorthand, shorthand, shorthand ];
	}
}

/**
 * Expand a padding shorthand into longhand properties.
 * @param value
 */
export function expandPadding( value: string ): Record< string, string > {
	const [ top, right, bottom, left ] = expandBoxShorthand( value );
	return {
		paddingTop: top,
		paddingRight: right,
		paddingBottom: bottom,
		paddingLeft: left,
	};
}

/**
 * Expand a margin shorthand into longhand properties.
 * @param value
 */
export function expandMargin( value: string ): Record< string, string > {
	const [ top, right, bottom, left ] = expandBoxShorthand( value );
	return {
		marginTop: top,
		marginRight: right,
		marginBottom: bottom,
		marginLeft: left,
	};
}

/**
 * Expand a border-radius shorthand (1–4 values) into per-corner longhand.
 *
 * Corners: top-left, top-right, bottom-right, bottom-left
 * @param value
 */
export function expandBorderRadius( value: string ): Record< string, string > {
	const parts = value.trim().split( /\s+/ );

	let tl: string, tr: string, br: string, bl: string;

	switch ( parts.length ) {
		case 1:
			tl = tr = br = bl = parts[ 0 ]!;
			break;
		case 2:
			tl = br = parts[ 0 ]!;
			tr = bl = parts[ 1 ]!;
			break;
		case 3:
			tl = parts[ 0 ]!;
			tr = bl = parts[ 1 ]!;
			br = parts[ 2 ]!;
			break;
		case 4:
			tl = parts[ 0 ]!;
			tr = parts[ 1 ]!;
			br = parts[ 2 ]!;
			bl = parts[ 3 ]!;
			break;
		default:
			tl = tr = br = bl = value;
	}

	return {
		borderTopLeftRadius: tl,
		borderTopRightRadius: tr,
		borderBottomRightRadius: br,
		borderBottomLeftRadius: bl,
	};
}

/**
 * Expand a border shorthand (width style color) into component parts.
 * Applied uniformly to all four sides.
 *
 * @param value
 * @example
 * expandBorder('1px solid #e5e7eb')
 *   → { borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: '#e5e7eb', ... }
 */
export function expandBorder( value: string ): Record< string, string > {
	const parts = value.trim().split( /\s+/ );
	const width = parts[ 0 ] ?? '0';
	const style = parts[ 1 ] ?? 'solid';
	const color = parts[ 2 ] ?? 'transparent';

	const sides = [ 'Top', 'Right', 'Bottom', 'Left' ] as const;
	const out: Record< string, string > = {};

	for ( const side of sides ) {
		out[ `border${ side }Width` ] = width;
		out[ `border${ side }Style` ] = style;
		out[ `border${ side }Color` ] = color;
	}

	return out;
}

/**
 * Map CSS property names from shorthand to longhand equivalents.
 * Used when receiving legacy attribute data.
 */
export const SHORTHAND_TO_LONGHAND: Record<
	string,
	( v: string ) => Record< string, string >
> = {
	padding: expandPadding,
	margin: expandMargin,
	borderRadius: expandBorderRadius,
	border: expandBorder,
};

/**
 * Expand any shorthand CSS property names in a flat record to longhand.
 * Pass-through for properties with no known expansion.
 * @param properties
 */
export function expandShorthands(
	properties: Record< string, string >
): Record< string, string > {
	const out: Record< string, string > = {};

	for ( const [ prop, value ] of Object.entries( properties ) ) {
		const expander = SHORTHAND_TO_LONGHAND[ prop ];

		if ( expander ) {
			Object.assign( out, expander( value ) );
		} else {
			out[ prop ] = value;
		}
	}

	return out;
}

/**
 * Color manipulation utilities.
 *
 * Lightweight helpers for the GoBlocks color picker controls.
 * No external dependency — all pure string/math operations.
 * For complex palette generation, use the colord package.
 */

// ── Types ─────────────────────────────────────────────────────────────────

export interface RgbColor {
	r: number; // 0–255
	g: number;
	b: number;
	a: number; // 0–1
}

// ── Parsers ───────────────────────────────────────────────────────────────

/**
 * Parse a 3- or 6-digit hex color (#RGB or #RRGGBB) to RgbColor.
 * @param hex
 */
export function parseHex( hex: string ): RgbColor | null {
	hex = hex.trim().replace( /^#/, '' );

	if ( 3 === hex.length ) {
		hex = hex
			.split( '' )
			.map( ( c ) => c + c )
			.join( '' );
	}

	if ( 6 !== hex.length && 8 !== hex.length ) {
		return null;
	}

	const r = parseInt( hex.slice( 0, 2 ), 16 );
	const g = parseInt( hex.slice( 2, 4 ), 16 );
	const b = parseInt( hex.slice( 4, 6 ), 16 );
	const a = 8 === hex.length ? parseInt( hex.slice( 6, 8 ), 16 ) / 255 : 1;

	if ( isNaN( r ) || isNaN( g ) || isNaN( b ) ) {
		return null;
	}

	return { r, g, b, a };
}

/**
 * Parse rgb() or rgba() string to RgbColor.
 * @param value
 */
export function parseRgb( value: string ): RgbColor | null {
	const match =
		/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/.exec(
			value
		);
	if ( ! match ) {
		return null;
	}

	return {
		r: parseFloat( match[ 1 ] ?? '0' ),
		g: parseFloat( match[ 2 ] ?? '0' ),
		b: parseFloat( match[ 3 ] ?? '0' ),
		a: match[ 4 ] !== undefined ? parseFloat( match[ 4 ] ) : 1,
	};
}

/**
 * Parse any supported CSS color string to RgbColor. Returns null for unsupported formats.
 * @param value
 */
export function parseColor( value: string ): RgbColor | null {
	value = value.trim();
	if ( value.startsWith( '#' ) ) {
		return parseHex( value );
	}
	if ( value.startsWith( 'rgb' ) ) {
		return parseRgb( value );
	}
	return null;
}

// ── Converters ────────────────────────────────────────────────────────────

/**
 * Convert RgbColor to a hex string (#RRGGBB or #RRGGBBAA).
 * @param color
 */
export function toHex( color: RgbColor ): string {
	const hex = ( n: number ) =>
		Math.round( n ).toString( 16 ).padStart( 2, '0' );
	const base = `#${ hex( color.r ) }${ hex( color.g ) }${ hex( color.b ) }`;
	return color.a < 1 ? base + hex( color.a * 255 ) : base;
}

/**
 * Convert RgbColor to an rgba() string.
 * @param color
 */
export function toRgba( color: RgbColor ): string {
	const { r, g, b, a } = color;
	const round = ( n: number ) => Math.round( n );
	return a < 1
		? `rgba(${ round( r ) }, ${ round( g ) }, ${ round( b ) }, ${ a })`
		: `rgb(${ round( r ) }, ${ round( g ) }, ${ round( b ) })`;
}

// ── Manipulation ──────────────────────────────────────────────────────────

/**
 * Clamp a number to [min, max].
 * @param n
 * @param min
 * @param max
 */
function clamp( n: number, min: number, max: number ): number {
	return Math.min( max, Math.max( min, n ) );
}

/**
 * Mix two CSS color strings by weight (0 = color1, 1 = color2).
 * @param color1
 * @param color2
 * @param weight
 */
export function mixColors(
	color1: string,
	color2: string,
	weight = 0.5
): string | null {
	const c1 = parseColor( color1 );
	const c2 = parseColor( color2 );
	if ( ! c1 || ! c2 ) {
		return null;
	}

	const w = clamp( weight, 0, 1 );
	const mixed: RgbColor = {
		r: c1.r + ( c2.r - c1.r ) * w,
		g: c1.g + ( c2.g - c1.g ) * w,
		b: c1.b + ( c2.b - c1.b ) * w,
		a: c1.a + ( c2.a - c1.a ) * w,
	};

	return toRgba( mixed );
}

/**
 * Apply alpha (opacity) to a CSS color string.
 * @param color
 * @param alpha
 */
export function withAlpha( color: string, alpha: number ): string | null {
	const parsed = parseColor( color );
	if ( ! parsed ) {
		return null;
	}
	return toRgba( { ...parsed, a: clamp( alpha, 0, 1 ) } );
}

// ── Contrast / Luminance ──────────────────────────────────────────────────

/**
 * Calculate relative luminance per WCAG 2.1.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @param color
 */
export function getLuminance( color: RgbColor ): number {
	const channel = ( c: number ) => {
		const sRgb = c / 255;
		return sRgb <= 0.03928
			? sRgb / 12.92
			: Math.pow( ( sRgb + 0.055 ) / 1.055, 2.4 );
	};
	return (
		0.2126 * channel( color.r ) +
		0.7152 * channel( color.g ) +
		0.0722 * channel( color.b )
	);
}

/**
 * Calculate WCAG contrast ratio between two colors.
 * Returns a value between 1 (no contrast) and 21 (max contrast).
 * @param color1
 * @param color2
 */
export function getContrastRatio(
	color1: string,
	color2: string
): number | null {
	const c1 = parseColor( color1 );
	const c2 = parseColor( color2 );
	if ( ! c1 || ! c2 ) {
		return null;
	}

	const l1 = getLuminance( c1 );
	const l2 = getLuminance( c2 );
	const lighter = Math.max( l1, l2 );
	const darker = Math.min( l1, l2 );

	return ( lighter + 0.05 ) / ( darker + 0.05 );
}

/**
 * Determine whether black or white provides better contrast against a background.
 * Useful for auto-coloring text labels on colored backgrounds.
 * @param background
 */
export function getReadableTextColor(
	background: string
): '#000000' | '#ffffff' {
	const bg = parseColor( background );
	if ( ! bg ) {
		return '#000000';
	}
	return getLuminance( bg ) > 0.179 ? '#000000' : '#ffffff';
}

// ── CSS variable helpers ──────────────────────────────────────────────────

/**
 * Wrap a raw CSS color value to use a CSS variable with a fallback.
 *
 * @param varName
 * @param fallback
 * @example
 * asCssVar('--gb-color-brand', '#3b82f6') → 'var(--gb-color-brand, #3b82f6)'
 */
export function asCssVar( varName: string, fallback?: string ): string {
	return fallback ? `var(${ varName }, ${ fallback })` : `var(${ varName })`;
}

/**
 * Check if a CSS value is a var() reference.
 * @param value
 */
export function isCssVar( value: string ): boolean {
	return value.trim().startsWith( 'var(' );
}

/**
 * Check if a value is a valid CSS color (hex, rgb, var, keywords).
 * @param value
 */
export function isValidCssColor( value: string ): boolean {
	if ( ! value ) {
		return false;
	}
	value = value.trim().toLowerCase();
	if ( isCssVar( value ) ) {
		return true;
	}
	if (
		[
			'transparent',
			'inherit',
			'currentcolor',
			'initial',
			'unset',
		].includes( value )
	) {
		return true;
	}
	return null !== parseColor( value );
}

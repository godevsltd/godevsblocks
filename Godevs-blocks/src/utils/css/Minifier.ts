/**
 * Minifier — Pipeline Stage 6
 *
 * Strips all unnecessary whitespace and characters from a CSS string to
 * minimize the payload stored in `attributes.generatedCss` and written
 * to the per-post CSS file.
 *
 * Rules (from CSS-ENGINE.md):
 *  - Strip all comments
 *  - Collapse multiple spaces/newlines to single space
 *  - Remove spaces around :, {, }
 *  - Remove trailing semicolon before }
 *  - Remove leading zeros: 0.5em → .5em
 *  - Remove units from zero values: 0px → 0
 */

/**
 * Minify a CSS string.
 *
 * Input is expected to be valid CSS — no structural validation is performed.
 * Malformed CSS in → malformed CSS out (just smaller).
 * @param css
 */
export function minify( css: string ): string {
	if ( ! css ) {
		return '';
	}

	return (
		css
			// 1. Strip /* */ comments.
			.replace( /\/\*[\s\S]*?\*\//g, '' )

			// 2. Collapse whitespace (tabs, newlines, multiple spaces) to a single space.
			.replace( /\s+/g, ' ' )

			// 3. Remove spaces around structural characters.
			.replace( /\s*([{};:,>~+])\s*/g, '$1' )

			// 4. Restore a single space after : inside @media queries and selectors.
			//    Without this, `@media (min-width:768px)` stays correct but
			//    `color: red` becomes `color:red` which is still valid CSS.

			// 5. Remove trailing semicolons before closing brace.
			.replace( /;}/g, '}' )

			// 6. Remove leading zero from decimal values (0.5rem → .5rem).
			.replace( /([^a-z])0(\.\d)/gi, '$1$2' )

			// 7. Remove units from zero values (0px → 0, 0rem → 0, 0% → 0).
			//    Does not strip unitless 0 again (already 0).
			.replace(
				/\b0(px|rem|em|%|vw|vh|svh|dvh|vmin|vmax|ch|ex|fr|deg|turn|ms|s)\b/g,
				'0'
			)

			// 8. Trim leading/trailing whitespace.
			.trim()
	);
}

/**
 * Estimate the byte savings from minification.
 * Utility for debugging; not used in production pipeline.
 * @param original
 * @param minified
 */
export function minificationStats(
	original: string,
	minified: string
): {
	originalBytes: number;
	minifiedBytes: number;
	savedBytes: number;
	savedPercent: number;
} {
	const originalBytes = new TextEncoder().encode( original ).length;
	const minifiedBytes = new TextEncoder().encode( minified ).length;
	const savedBytes = originalBytes - minifiedBytes;
	const savedPercent =
		originalBytes > 0
			? Math.round( ( savedBytes / originalBytes ) * 100 )
			: 0;

	return { originalBytes, minifiedBytes, savedBytes, savedPercent };
}

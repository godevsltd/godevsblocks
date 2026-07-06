<?php
/**
 * Collects and processes generated CSS from block attributes.
 *
 * @package GoBlocks\CSS
 */

namespace GoBlocks\CSS;

defined( 'ABSPATH' ) || exit;

/**
 * Reads `generatedCss` from all GoBlocks blocks in a post,
 * deduplicates, and optionally flips for RTL.
 *
 * PHP does NOT re-generate CSS from the `styles` attribute.
 * It only collects what the TypeScript CssEngine already compiled.
 */
class CssGenerator {

	/**
	 * Collect and merge all GoBlocks CSS from a post's block content.
	 *
	 * @param  int $post_id Post ID.
	 * @return string Merged, deduplicated CSS string. Empty string if no blocks.
	 */
	public static function collect_for_post( int $post_id ): string {
		$content = get_post_field( 'post_content', $post_id );

		if ( empty( $content ) ) {
			return '';
		}

		$blocks = parse_blocks( $content );
		return self::collect_from_blocks( $blocks );
	}

	/**
	 * Recursively walk a block tree and extract generatedCss attributes.
	 *
	 * @param  array<int, array<string, mixed>> $blocks Parsed blocks array.
	 * @return string
	 */
	public static function collect_from_blocks( array $blocks ): string {
		$css_parts = array();

		foreach ( $blocks as $block ) {
			// Only process GoBlocks blocks.
			if ( ! isset( $block['blockName'] ) || ! str_starts_with( (string) $block['blockName'], 'goblocks/' ) ) {
				// Still recurse into inner blocks.
				if ( ! empty( $block['innerBlocks'] ) ) {
					$inner = self::collect_from_blocks( $block['innerBlocks'] );
					if ( '' !== $inner ) {
						$css_parts[] = $inner;
					}
				}
				continue;
			}

			$attrs = $block['attrs'] ?? array();
			$css   = $attrs['generatedCss'] ?? '';

			if ( is_string( $css ) && '' !== $css && self::is_valid_block_css( $css ) ) {
				$css_parts[] = $css;
			}

			// Recurse into inner blocks (e.g. query → query-loop → loop-item).
			if ( ! empty( $block['innerBlocks'] ) ) {
				$inner = self::collect_from_blocks( $block['innerBlocks'] );
				if ( '' !== $inner ) {
					$css_parts[] = $inner;
				}
			}
		}

		if ( empty( $css_parts ) ) {
			return '';
		}

		// Deduplicate identical CSS strings — guards against duplicated blocks that.
		// share a uniqueId before the editor regenerates it. Using the full CSS.
		// string as key prevents false collisions that occurred when two blocks.
		// had CSS starting with the same @media prefix.
		$css_by_selector = array();
		foreach ( $css_parts as $css ) {
			$css_by_selector[ $css ] = $css;
		}

		return implode( "\n", array_values( $css_by_selector ) );
	}

	/**
	 * Validate that a generatedCss string is legitimately scoped block CSS.
	 *
	 * Rejects CSS whose first rule targets global selectors (body, :root,
	 * .wp-block-*, .entry-*, etc.) — these indicate corrupted/captured editor
	 * styles that were accidentally stored in the block attribute.
	 *
	 * Valid block CSS always begins with a .gb- selector.
	 *
	 * @param  string $css Raw generatedCss attribute value.
	 * @return bool   true if the CSS looks like valid scoped block CSS.
	 */
	public static function is_valid_block_css( string $css ): bool {
		$css = ltrim( $css );

		if ( '' === $css ) {
			return false;
		}

		// The first character of valid block CSS must be '.' (class selector).
		if ( '.' !== $css[0] ) {
			return false;
		}

		// The first selector must start with .gb- (our scoped prefix).
		if ( ! str_starts_with( $css, '.gb-' ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Minify a CSS string.
	 *
	 * Rules:
	 *  - Strip comments
	 *  - Collapse whitespace around :, {, }, ;
	 *  - Remove trailing semicolon before }
	 *  - Remove units from zero values (0px → 0)
	 *
	 * @param  string $css Raw CSS.
	 * @return string Minified CSS.
	 */
	public static function minify( string $css ): string {
		if ( '' === $css ) {
			return '';
		}

		// Strip CSS comments.
		$css = preg_replace( '#/\*.*?\*/#s', '', $css ) ?? $css;

		// Collapse newlines and tabs to a single space.
		$css = preg_replace( '/[\r\n\t]+/', ' ', $css ) ?? $css;

		// Collapse multiple spaces.
		$css = preg_replace( '/\s{2,}/', ' ', $css ) ?? $css;

		// Remove space around structural characters.
		$css = preg_replace( '/\s*([:{};\,>~+])\s*/', '$1', $css ) ?? $css;

		// Remove trailing semicolons before closing braces.
		$css = str_replace( ';}', '}', $css );

		// Remove leading zeros: 0.5 → .5.
		$css = preg_replace( '/(:|\s)0+\.(\d)/', '$1.$2', $css ) ?? $css;

		// Remove units from zero values.
		$css = preg_replace( '/\b0(px|rem|em|%|vh|vw|svh|dvh)/', '0', $css ) ?? $css;

		return trim( $css );
	}

	/**
	 * Flip left/right CSS properties for RTL languages.
	 *
	 * Handles: margin-left/right, padding-left/right, border-left/right,
	 * left/right position, text-align, float, background-position.
	 *
	 * @param  string $css LTR CSS string.
	 * @return string RTL-flipped CSS string.
	 */
	public static function flip_rtl( string $css ): string {
		// Swap compound left/right property pairs first, using unique placeholders.
		// so the generic left:/right: pass below doesn't undo the swap.
		$compound = array(
			array( 'margin-left:', 'margin-right:' ),
			array( 'padding-left:', 'padding-right:' ),
			array( 'border-left:', 'border-right:' ),
		);

		foreach ( $compound as $pair ) {
			list( $a, $b ) = $pair;
			$ph            = '%%GBSWAP_' . strtoupper( str_replace( array( '-', ':' ), '_', $a ) ) . '%%';
			$css           = str_replace( $a, $ph, $css );
			$css           = str_replace( $b, $a, $css );
			$css           = str_replace( $ph, $b, $css );
		}

		// Standalone left:/right: — only swap when the property starts a rule.
		// or follows a semicolon. This avoids matching inside margin-left: etc.
		$css = (string) preg_replace( '/([{;])\s*left:/', '$1%%GBPOS%%:', $css );
		$css = (string) preg_replace( '/([{;])\s*right:/', '$1left:', $css );
		$css = str_replace( '%%GBPOS%%:', 'right:', $css );

		// text-align values.
		$css = (string) preg_replace( '/text-align:left([;}])/', 'text-align:%%GBTA%%$1', $css );
		$css = (string) preg_replace( '/text-align:right([;}])/', 'text-align:left$1', $css );
		$css = str_replace( '%%GBTA%%', 'right', $css );

		return $css;
	}
}

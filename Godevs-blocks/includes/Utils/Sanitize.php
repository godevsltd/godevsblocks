<?php
/**
 * Sanitize.
 *
 * @package GoBlocks\Utils
 */

namespace GoBlocks\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Utility sanitizers for GoBlocks-specific data types.
 *
 * Used at input boundaries throughout the plugin.
 */
final class Sanitize {

	/**
	 * Sanitize a CSS color value.
	 *
	 * Accepts hex, rgb(), rgba(), hsl(), hsla(), and var(--*) references.
	 *
	 * @param  mixed $value Raw value.
	 * @return string Sanitized color, or empty string if invalid.
	 */
	public static function css_color( $value ): string {
		$value = trim( (string) $value );

		if ( '' === $value ) {
			return '';
		}

		// Hex color: #rgb, #rgba, #rrggbb, #rrggbbaa (3, 4, 6, or 8 hex digits).
		if ( preg_match( '/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3}([0-9a-fA-F]{2})?)?$/', $value ) ) {
			return strtolower( $value );
		}

		// CSS variable reference: var(--some-name).
		if ( preg_match( '/^var\(--[\w-]+\)$/', $value ) ) {
			return $value;
		}

		// rgb() / rgba() / hsl() / hsla() — numbers, commas, spaces, slashes, dots, %.
		if ( preg_match( '/^(?:rgba?|hsla?)\([\d\s,.\/%]+\)$/i', $value ) ) {
			return $value;
		}

		return '';
	}

	/**
	 * Sanitize a CSS dimension / unit value (e.g., "16px", "1.5em", "100%").
	 *
	 * Also accepts unitless numbers and var(--*) references.
	 *
	 * @param  mixed $value Raw value.
	 * @return string Sanitized value, or empty string if invalid.
	 */
	public static function css_value( $value ): string {
		$value = trim( (string) $value );

		if ( '' === $value ) {
			return '';
		}

		// Number with optional CSS unit.
		if ( preg_match( '/^-?[\d.]+(px|em|rem|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc|fr|deg|rad|turn|s|ms)?$/', $value ) ) {
			return $value;
		}

		// CSS variable reference.
		if ( preg_match( '/^var\(--[\w-]+\)$/', $value ) ) {
			return $value;
		}

		return '';
	}

	/**
	 * Sanitize multiple space-separated HTML class names.
	 *
	 * @param  mixed $value Raw value.
	 * @return string Sanitized class string.
	 */
	public static function html_classes( $value ): string {
		return implode(
			' ',
			array_filter(
				array_map(
					'sanitize_html_class',
					explode( ' ', (string) $value )
				)
			)
		);
	}

	/**
	 * Sanitize a block unique ID.
	 *
	 * A unique ID is a short alphanumeric + hyphen string generated in the editor
	 * (e.g. "ab1c2d"). Strips anything that isn't a–z, 0–9, or a hyphen.
	 *
	 * @param  string $id Raw uniqueId attribute value.
	 * @return string Sanitized ID (lowercase, max 32 chars).
	 */
	public static function unique_id( string $id ): string {
		$clean = preg_replace( '/[^a-z0-9\-]/', '', strtolower( $id ) ) ?? '';
		return substr( $clean, 0, 32 );
	}

	/**
	 * Sanitize an HTML tag name against a known-safe allowlist.
	 *
	 * @param  string $tag     Raw tag name from block attributes.
	 * @param  string $fallback Fallback tag if the provided value is not allowed.
	 * @return string Allowed tag name.
	 */
	public static function tag_name( string $tag, string $fallback = 'div' ): string {
		$allowed = array(
			'div',
			'section',
			'article',
			'header',
			'footer',
			'main',
			'aside',
			'nav',
			'figure',
			'figcaption',
			'blockquote',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'p',
			'span',
			'a',
			'button',
			'ul',
			'ol',
			'li',
		);

		$tag = strtolower( trim( $tag ) );
		return in_array( $tag, $allowed, true ) ? $tag : $fallback;
	}

	/**
	 * Sanitize an array of CSS class name strings.
	 *
	 * @param  string[] $classes Raw class array from block attributes.
	 * @return string[] Sanitized class strings (empty values removed).
	 */
	public static function css_class_array( array $classes ): array {
		return array_values(
			array_filter(
				array_map( 'sanitize_html_class', $classes )
			)
		);
	}
}

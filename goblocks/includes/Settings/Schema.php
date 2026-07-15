<?php
/**
 * Settings schema — type definitions and validation.
 *
 * @package GoBlocks\Settings
 */

namespace GoBlocks\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Declares the type, constraints, and sanitizer for every plugin setting.
 *
 * Schema format per key:
 *   type        string   'integer' | 'string' | 'boolean' | 'array' | 'object'
 *   default     mixed    Fallback value (same as Defaults::get())
 *   enum        string[] Allowed string values (optional)
 *   min         int      Minimum integer value (optional)
 *   max         int      Maximum integer value (optional)
 *   sanitize    callable Optional custom sanitizer. Called with ($value, $schema).
 */
final class Schema {

	/**
	 * Return the full schema definition.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public static function get(): array {
		return array(
			'container_width'      => array(
				'type'    => 'integer',
				'default' => 1200,
				'min'     => 320,
				'max'     => 3840,
			),
			'css_print_method'     => array(
				'type'    => 'string',
				'default' => 'file',
				'enum'    => array( 'file', 'inline' ),
			),
			'breakpoints'          => array(
				'type'     => 'object',
				'default'  => Defaults::get()['breakpoints'],
				'sanitize' => array( self::class, 'sanitize_breakpoints' ),
			),
			'sync_responsive'      => array(
				'type'    => 'boolean',
				'default' => true,
			),
			'disable_google_fonts' => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'enable_dark_mode'     => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'global_color_palette' => array(
				'type'     => 'array',
				'default'  => array(),
				'sanitize' => array( self::class, 'sanitize_color_palette' ),
			),
			'global_typography'    => array(
				'type'     => 'array',
				'default'  => array(),
				'sanitize' => array( self::class, 'sanitize_typography_presets' ),
			),
		);
	}

	/**
	 * Validate and sanitize an incoming settings payload.
	 *
	 * Only keys defined in the schema are processed; unknown keys are stripped.
	 * Returns a WP_Error if any value fails validation.
	 *
	 * @param  array<string, mixed> $data Incoming data (partial update supported).
	 * @return array<string, mixed>|\WP_Error Sanitized subset on success; WP_Error on failure.
	 */
	public static function validate( array $data ): array|\WP_Error {
		$schema   = self::get();
		$defaults = Defaults::get();
		$output   = array();

		foreach ( $data as $key => $value ) {
			if ( ! isset( $schema[ $key ] ) ) {
				// Unknown key — silently ignore.
				continue;
			}

			$def = $schema[ $key ];

			// Custom sanitizer takes priority.
			if ( isset( $def['sanitize'] ) && is_callable( $def['sanitize'] ) ) {
				$output[ $key ] = call_user_func( $def['sanitize'], $value );
				continue;
			}

			$sanitized = self::sanitize_by_type( $value, $def );

			if ( is_wp_error( $sanitized ) ) {
				return $sanitized;
			}

			$output[ $key ] = $sanitized;
		}

		return $output;
	}

	/**
	 * Sanitize a single value according to its type definition.
	 *
	 * @param  mixed                $value Raw value.
	 * @param  array<string, mixed> $def   Schema definition for this key.
	 * @return mixed|\WP_Error
	 */
	private static function sanitize_by_type( mixed $value, array $def ): mixed {
		switch ( $def['type'] ) {
			case 'integer':
				$int = (int) $value;
				if ( isset( $def['min'] ) && $int < $def['min'] ) {
					return new \WP_Error( 'goblocks_settings_range', esc_html__( 'Value below minimum.', 'godevs-block-library' ) );
				}
				if ( isset( $def['max'] ) && $int > $def['max'] ) {
					return new \WP_Error( 'goblocks_settings_range', esc_html__( 'Value above maximum.', 'godevs-block-library' ) );
				}
				return $int;

			case 'string':
				$str = sanitize_text_field( (string) $value );
				if ( isset( $def['enum'] ) && ! in_array( $str, $def['enum'], true ) ) {
					return new \WP_Error( 'goblocks_settings_enum', esc_html__( 'Invalid option value.', 'godevs-block-library' ) );
				}
				return $str;

			case 'boolean':
				if ( is_bool( $value ) ) {
					return $value;
				}
				return in_array( $value, array( true, 1, '1', 'true', 'yes' ), true );

			case 'array':
			case 'object':
				return is_array( $value ) ? $value : $def['default'];

			default:
				return $def['default'];
		}
	}

	/**
	 * Sanitize the breakpoints object.
	 * Each key must be xs|sm|md|lg|xl|2xl; each value an integer 320–3840.
	 *
	 * @param  mixed $value Raw breakpoints.
	 * @return array<string, int>
	 */
	private static function sanitize_breakpoints( mixed $value ): array {
		if ( ! is_array( $value ) ) {
			return Defaults::get()['breakpoints'];
		}

		$allowed = array( 'xs', 'sm', 'md', 'lg', 'xl', '2xl' );
		$out     = array();

		foreach ( $allowed as $key ) {
			if ( isset( $value[ $key ] ) ) {
				$out[ $key ] = max( 320, min( 3840, (int) $value[ $key ] ) );
			} else {
				$defaults    = Defaults::get()['breakpoints'];
				$out[ $key ] = $defaults[ $key ];
			}
		}

		return $out;
	}

	/**
	 * Sanitize the global color palette array.
	 * Each entry: { slug: string, name: string, color: string }
	 *
	 * @param  mixed $value Raw palette.
	 * @return array<int, array<string, string>>
	 */
	private static function sanitize_color_palette( mixed $value ): array {
		if ( ! is_array( $value ) ) {
			return array();
		}

		$out = array();

		foreach ( $value as $entry ) {
			if ( ! is_array( $entry ) ) {
				continue;
			}
			$slug  = sanitize_key( $entry['slug'] ?? '' );
			$name  = sanitize_text_field( $entry['name'] ?? '' );
			$color = \GoBlocks\Utils\Sanitize::css_color( $entry['color'] ?? '' );

			if ( '' === $slug || '' === $color ) {
				continue;
			}

			$out[] = compact( 'slug', 'name', 'color' );
		}

		return $out;
	}

	/**
	 * Sanitize global typography presets.
	 * Each entry: { slug, label, fontFamily, fontSize, fontWeight, lineHeight }
	 *
	 * @param  mixed $value Raw presets.
	 * @return array<int, array<string, string>>
	 */
	private static function sanitize_typography_presets( mixed $value ): array {
		if ( ! is_array( $value ) ) {
			return array();
		}

		$out = array();

		foreach ( $value as $entry ) {
			if ( ! is_array( $entry ) ) {
				continue;
			}
			$slug = sanitize_key( $entry['slug'] ?? '' );
			if ( '' === $slug ) {
				continue;
			}
			$out[] = array(
				'slug'       => $slug,
				'label'      => sanitize_text_field( $entry['label'] ?? '' ),
				'fontFamily' => sanitize_text_field( $entry['fontFamily'] ?? '' ),
				'fontSize'   => \GoBlocks\Utils\Sanitize::css_value( $entry['fontSize'] ?? '' ),
				'fontWeight' => \GoBlocks\Utils\Sanitize::css_value( $entry['fontWeight'] ?? '' ),
				'lineHeight' => \GoBlocks\Utils\Sanitize::css_value( $entry['lineHeight'] ?? '' ),
			);
		}

		return $out;
	}
}

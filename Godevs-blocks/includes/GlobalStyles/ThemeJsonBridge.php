<?php
/**
 * Theme Json Bridge.
 *
 * @package GoBlocks\GlobalStyles
 */

namespace GoBlocks\GlobalStyles;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Settings\SettingsStore;

/**
 * Bridges GoBlocks global styles into the WordPress theme.json pipeline.
 *
 * Merges the plugin-defined color palette into the block editor's native
 * color picker, so GoBlocks colors appear alongside theme-defined colors.
 * Requires WordPress 6.1+ (WP_Theme_JSON_Data available since 6.1).
 */
class ThemeJsonBridge {

	/**
	 * Boot the bridge.
	 *
	 * @return void
	 */
	public static function boot(): void {
		add_filter( 'wp_theme_json_data_theme', array( self::class, 'inject_color_palette' ) );
	}

	/**
	 * Merge GoBlocks color palette entries into the active theme.json data.
	 *
	 * Appends after any theme-defined palette entries so theme colors come first.
	 *
	 * @param  \WP_Theme_JSON_Data $theme_json Current theme.json data object.
	 * @return \WP_Theme_JSON_Data
	 */
	public static function inject_color_palette( \WP_Theme_JSON_Data $theme_json ): \WP_Theme_JSON_Data {
		$raw_palette = SettingsStore::get( 'global_color_palette', array() );

		if ( ! is_array( $raw_palette ) || empty( $raw_palette ) ) {
			return $theme_json;
		}

		$entries = array();
		foreach ( $raw_palette as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$slug  = sanitize_title( $item['slug'] ?? '' );
			$color = sanitize_hex_color( $item['color'] ?? '' ) ?? '';
			$name  = sanitize_text_field( $item['name'] ?? '' );

			if ( ! $slug || ! $color ) {
				continue;
			}

			$entries[] = array(
				'slug'  => $slug,
				'name'  => $name ? $name : $slug,
				'color' => $color,
			);
		}

		if ( empty( $entries ) ) {
			return $theme_json;
		}

		// Preserve the existing theme palette; GoBlocks colors go at the end.
		$data             = $theme_json->get_data();
		$existing_palette = $data['settings']['color']['palette'] ?? array();
		$existing_palette = is_array( $existing_palette ) ? $existing_palette : array();

		$theme_json->update_with(
			array(
				'version'  => 2,
				'settings' => array(
					'color' => array(
						'palette' => array_merge( $existing_palette, $entries ),
					),
				),
			)
		);

		return $theme_json;
	}
}

<?php
/**
 * Settings Store.
 *
 * @package GoBlocks\Settings
 */

namespace GoBlocks\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Persists GoBlocks plugin settings to wp_options.
 *
 * All reads merge saved data with Defaults so missing keys are always filled in.
 * All writes pass through Schema::validate() before touching the database.
 */
final class SettingsStore {

	private const OPTION_NAME = 'goblocks_settings';

	/**
	 * Return all settings, merged with defaults.
	 *
	 * @return array<string, mixed>
	 */
	public static function all(): array {
		$saved = get_option( self::OPTION_NAME, array() );
		return array_merge( Defaults::get(), is_array( $saved ) ? $saved : array() );
	}

	/**
	 * Return a single setting value.
	 *
	 * @param  string $key      Setting key.
	 * @param  mixed  $fallback Fallback when key is absent.
	 * @return mixed
	 */
	public static function get( string $key, $fallback = null ) {
		$all = self::all();
		return array_key_exists( $key, $all ) ? $all[ $key ] : $fallback;
	}

	/**
	 * Merge and persist an incoming partial settings payload.
	 *
	 * Only keys declared in Schema::get() are accepted; unknown keys are discarded.
	 *
	 * @param  array<string, mixed> $data Incoming data (partial updates supported).
	 * @return true|\WP_Error True on success; WP_Error when validation fails.
	 */
	public static function save( array $data ): bool|\WP_Error {
		$validated = Schema::validate( $data );

		if ( is_wp_error( $validated ) ) {
			return $validated;
		}

		$merged = array_merge( self::all(), $validated );

		update_option( self::OPTION_NAME, $merged, false );

		return true;
	}

	/**
	 * Return a settings object formatted for the block editor via wp_localize_script().
	 *
	 * Keys must match the GoblocksEditorGlobals TypeScript interface in
	 * src/types/block.ts — both flat camelCase keys AND the nested 'settings' bag.
	 *
	 * @return array<string, mixed>
	 */
	public static function for_editor(): array {
		$all = self::all();

		return array(
			// Nested bag kept for backwards compat with any TS that reads settings.*.
			'settings'           => $all,

			// Flat camelCase keys that TypeScript reads directly from window.goblocksEditor.
			'breakpoints'        => (array) ( $all['breakpoints'] ?? Defaults::get()['breakpoints'] ),
			'containerWidth'     => absint( $all['container_width'] ?? 1200 ),
			'syncResponsive'     => (bool) ( $all['sync_responsive'] ?? true ),
			'disableGoogleFonts' => (bool) ( $all['disable_google_fonts'] ?? false ),
			'enableDarkMode'     => (bool) ( $all['enable_dark_mode'] ?? false ),
			'globalColorPalette' => (array) ( $all['global_color_palette'] ?? array() ),
			'globalTypography'   => (array) ( $all['global_typography'] ?? array() ),
			'cssPrintMethod'     => in_array( $all['css_print_method'] ?? 'file', array( 'file', 'inline' ), true )
				? $all['css_print_method']
				: 'file',

			// Auth / REST context.
			'nonce'              => wp_create_nonce( 'wp_rest' ),
			'restUrl'            => rest_url(),
			'version'            => defined( 'GOBLOCKS_VERSION' ) ? GOBLOCKS_VERSION : '',
		);
	}

	/**
	 * Reset all settings to their default values.
	 *
	 * @return void
	 */
	public static function reset(): void {
		update_option( self::OPTION_NAME, Defaults::get(), false );
	}
}

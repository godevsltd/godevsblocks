<?php
namespace GoBlocks\GlobalStyles;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Settings\SettingsStore;

/**
 * Outputs GoBlocks global token overrides to the frontend and block editor,
 * and registers the Global Styles admin panel submenu page.
 *
 * Token overrides are written as a :root {} block injected into <head>.
 * This lets user-defined palette colors and container width override the
 * defaults from assets/css/tokens.css without touching that file.
 */
class GlobalStyles {

	/**
	 * Boot the subsystem.
	 *
	 * @return void
	 */
	public static function boot(): void {
		add_action( 'wp_head', array( self::class, 'output_frontend_css' ), 5 );
		add_action( 'enqueue_block_editor_assets', array( self::class, 'output_editor_css' ) );
		// admin_menu registration is handled centrally by Admin::register_all_menus()
		// to guarantee the parent page exists before this submenu is added.
		add_action( 'admin_enqueue_scripts', array( self::class, 'enqueue_admin_assets' ) );
	}

	// ── Admin page ────────────────────────────────────────────────────────────

	/**
	 * Register the Global Styles submenu under the GoBlocks top-level menu.
	 *
	 * @return void
	 */
	public static function add_submenu_page(): void {
		add_submenu_page(
			'goblocks-settings',
			__( 'GoBlocks — Global Styles', 'goblocks' ),
			__( 'Global Styles', 'goblocks' ),
			'manage_options',
			'goblocks-global-styles',
			array( self::class, 'render_page' )
		);
	}

	/**
	 * Render the admin page shell.
	 *
	 * The React SPA mounts into #goblocks-global-styles-root.
	 *
	 * @return void
	 */
	public static function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'goblocks' ) );
		}

		echo '<div id="goblocks-global-styles-root" class="gb-global-styles-root"></div>';
	}

	/**
	 * Enqueue the Global Styles admin assets — only on the Global Styles page.
	 *
	 * Hook suffix for a submenu under 'goblocks-settings' with slug
	 * 'goblocks-global-styles' is 'goblocks_page_goblocks-global-styles'.
	 *
	 * @param string $hook_suffix Current admin page hook.
	 * @return void
	 */
	public static function enqueue_admin_assets( string $hook_suffix ): void {
		if ( 'goblocks_page_goblocks-global-styles' !== $hook_suffix ) {
			return;
		}

		$asset_file = GOBLOCKS_BUILD_DIR . 'global-styles.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'goblocks-global-styles',
			GOBLOCKS_BUILD_URL . 'global-styles.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'goblocks-tokens',
			GOBLOCKS_URL . 'assets/css/tokens.css',
			array(),
			GOBLOCKS_VERSION
		);

		wp_enqueue_style(
			'goblocks-admin',
			GOBLOCKS_URL . 'assets/css/admin.css',
			array( 'goblocks-tokens' ),
			GOBLOCKS_VERSION
		);

		wp_enqueue_style(
			'goblocks-global-styles-page',
			GOBLOCKS_URL . 'assets/css/global-styles.css',
			array( 'goblocks-admin' ),
			GOBLOCKS_VERSION
		);

		if ( file_exists( GOBLOCKS_BUILD_DIR . 'global-styles.css' ) ) {
			wp_enqueue_style(
				'goblocks-global-styles-style',
				GOBLOCKS_BUILD_URL . 'global-styles.css',
				array( 'goblocks-global-styles-page' ),
				$asset['version']
			);
		}

		wp_set_script_translations( 'goblocks-global-styles', 'goblocks', GOBLOCKS_DIR . 'languages' );

		wp_localize_script(
			'goblocks-global-styles',
			'goblocksGlobalStyles',
			array(
				'settings' => SettingsStore::all(),
				'nonce'    => wp_create_nonce( 'wp_rest' ),
				'restUrl'  => rest_url(),
				'version'  => GOBLOCKS_VERSION,
			)
		);
	}

	// ── CSS output ────────────────────────────────────────────────────────────

	/**
	 * Output token override CSS in <head> on the frontend (priority 5,
	 * before theme stylesheets so themes can override if needed).
	 *
	 * @return void
	 */
	public static function output_frontend_css(): void {
		$css = self::build_token_css();
		if ( '' === $css ) {
			return;
		}
		// All values are sanitized in build_token_css() — safe to echo.
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo "\n<style id=\"goblocks-global-styles\">\n" . $css . "\n</style>\n";
	}

	/**
	 * Append token override CSS as an inline style in the block editor.
	 *
	 * Attaches to the 'goblocks-tokens' handle registered by EditorAssets.
	 *
	 * @return void
	 */
	public static function output_editor_css(): void {
		$css = self::build_token_css();
		if ( '' === $css ) {
			return;
		}
		wp_add_inline_style( 'goblocks-tokens', $css );
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

	/**
	 * Build a :root {} block with user-defined CSS custom property overrides.
	 *
	 * Only sanitized values are included — no raw user input reaches the output.
	 *
	 * @return string CSS string, or empty string when nothing to override.
	 */
	private static function build_token_css(): string {
		$settings = SettingsStore::all();
		$lines    = array();

		// Site container width (always output so --gb-container-site is always set).
		$width   = absint( $settings['container_width'] ?? 1200 );
		$lines[] = '--gb-container-site:' . $width . 'px';

		// User color palette → --gb-color-{slug}: {value}.
		$palette = $settings['global_color_palette'] ?? array();
		if ( is_array( $palette ) ) {
			foreach ( $palette as $entry ) {
				if ( ! is_array( $entry ) ) {
					continue;
				}
				$slug  = sanitize_title( $entry['slug'] ?? '' );
				$color = self::sanitize_color( (string) ( $entry['color'] ?? '' ) );
				if ( $slug && $color ) {
					$lines[] = '--gb-color-' . $slug . ':' . $color;
				}
			}
		}

		return ':root{' . implode( ';', $lines ) . '}';
	}

	/**
	 * Sanitize a CSS color value.
	 *
	 * Accepts: 3/4/6/8-digit hex, rgb/rgba(), hsl/hsla(), CSS named colors.
	 *
	 * @param  string $color Raw color string.
	 * @return string Sanitized value, or empty string if invalid.
	 */
	private static function sanitize_color( string $color ): string {
		$color = trim( $color );

		// Hex colors (#rgb, #rgba, #rrggbb, #rrggbbaa).
		$hex = sanitize_hex_color( $color );
		if ( null !== $hex ) {
			return $hex;
		}

		// rgb/rgba/hsl/hsla with numeric args (spaces, digits, commas, slashes, %, periods).
		if ( 1 === preg_match( '/^(?:rgba?|hsla?)\([\d\s,.\/%]+\)$/i', $color ) ) {
			return $color;
		}

		// Named CSS colors (alpha characters only, 2–30 chars).
		if ( 1 === preg_match( '/^[a-zA-Z]{2,30}$/', $color ) ) {
			return strtolower( $color );
		}

		return '';
	}
}

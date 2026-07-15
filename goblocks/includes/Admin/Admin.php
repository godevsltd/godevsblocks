<?php
/**
 * Admin.
 *
 * @package GoBlocks\Admin
 */

namespace GoBlocks\Admin;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Utils\Singleton;
use GoBlocks\Settings\SettingsStore;
use GoBlocks\GlobalStyles\GlobalStyles;
use GoBlocks\Patterns\PatternLibrary;

/**
 * Admin area controller.
 *
 * Registers the GoBlocks settings menu page and enqueues assets for it.
 * All methods that read from the screen or hook into admin actions are
 * guarded to run only in the WP admin.
 */
class Admin extends Singleton {

	/**
	 * Admin page hook suffix returned by add_menu_page().
	 *
	 * @var string
	 */
	private string $page_hook = '';

	/**
	 * Register admin hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// Single callback registers parent + all submenus in guaranteed order.
		// Splitting across separate hooks risks the parent not existing in.
		// $admin_page_hooks when a submenu calls get_plugin_page_hookname().
		add_action( 'admin_menu', array( $this, 'register_all_menus' ), 9 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Register the top-level menu then all submenus in a single callback.
	 *
	 * Must stay in one function: WordPress populates $admin_page_hooks
	 * inside add_menu_page(), which add_submenu_page() reads to compute
	 * the correct hook suffix. Splitting across separate hook callbacks
	 * (even with priorities) can cause the suffix to be wrong if another
	 * plugin fires in between.
	 *
	 * @return void
	 */
	public function register_all_menus(): void {
		// 1. Top-level page — populates $admin_page_hooks['goblocks-settings'].
		$this->page_hook = add_menu_page(
			__( 'GoDevs Block Library Settings', 'godevs-block-library' ),
			__( 'GoDevs Block Library', 'godevs-block-library' ),
			'manage_options',
			'goblocks-settings',
			array( $this, 'render_settings_page' ),
			'dashicons-block-default',
			80
		);

		// 2. Submenus — parent now exists so hook names compute correctly.
		GlobalStyles::add_submenu_page();
		PatternLibrary::add_submenu_page();
	}

	/**
	 * Enqueue settings page JS/CSS only on the GoBlocks admin page.
	 *
	 * @param string $hook_suffix The current admin page hook suffix.
	 * @return void
	 */
	public function enqueue_assets( string $hook_suffix ): void {
		if ( $hook_suffix !== $this->page_hook ) {
			return;
		}

		$asset_file = GOBLOCKS_BUILD_DIR . 'settings.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'goblocks-settings',
			GOBLOCKS_BUILD_URL . 'settings.js',
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
			'goblocks-settings-style',
			GOBLOCKS_BUILD_URL . 'settings.css',
			array( 'goblocks-admin' ),
			$asset['version']
		);

		wp_set_script_translations(
			'goblocks-settings',
			'godevs-block-library',
			GOBLOCKS_DIR . 'languages'
		);

		// Localise settings page data.
		wp_localize_script(
			'goblocks-settings',
			'goblocksSettings',
			$this->get_settings_data()
		);
	}

	/**
	 * Render the settings page HTML shell.
	 * The React SPA mounts into #goblocks-settings-root.
	 *
	 * @return void
	 */
	public function render_settings_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'godevs-block-library' ) );
		}

		echo '<div id="goblocks-settings-root" class="gb-settings-root"></div>';
	}

	/**
	 * Build the data object localised to the settings page script.
	 *
	 * @return array<string, mixed>
	 */
	private function get_settings_data(): array {
		return array(
			'settings' => SettingsStore::all(),
			'nonce'    => wp_create_nonce( 'wp_rest' ),
			'restUrl'  => rest_url(),
			'version'  => GOBLOCKS_VERSION,
			'adminUrl' => admin_url(),
		);
	}
}

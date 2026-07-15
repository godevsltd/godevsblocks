<?php
/**
 * Editor Assets.
 *
 * @package GoBlocks\Admin
 */

namespace GoBlocks\Admin;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Utils\Singleton;
use GoBlocks\Settings\SettingsStore;

/**
 * Enqueues GoBlocks assets in the block editor.
 *
 * - Registers the editor JS bundle (registers blocks + editor UI extensions)
 * - Localises `window.goblocksEditor` with settings + REST nonce
 * - Enqueues editor styles
 * - Registers front-end CSS (tokens + admin)
 */
class EditorAssets extends Singleton {

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ) );
	}

	/**
	 * Enqueue editor-only JS and CSS (inside the Gutenberg editor iframe).
	 *
	 * @return void
	 */
	public function enqueue_editor_assets(): void {
		$asset_file = GOBLOCKS_BUILD_DIR . 'editor.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'goblocks-editor',
			GOBLOCKS_BUILD_URL . 'editor.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_set_script_translations(
			'goblocks-editor',
			'godevs-block-library',
			GOBLOCKS_DIR . 'languages'
		);

		// Localise data consumed by TypeScript via window.goblocksEditor.
		wp_localize_script(
			'goblocks-editor',
			'goblocksEditor',
			$this->get_editor_data()
		);

		if ( file_exists( GOBLOCKS_BUILD_DIR . 'editor.css' ) ) {
			wp_enqueue_style(
				'goblocks-editor-style',
				GOBLOCKS_BUILD_URL . 'editor.css',
				array( 'wp-edit-blocks' ),
				$asset['version']
			);
		}

		wp_enqueue_style(
			'goblocks-inspector',
			GOBLOCKS_URL . 'assets/css/inspector.css',
			array( 'goblocks-tokens', 'wp-edit-blocks' ),
			GOBLOCKS_VERSION
		);
	}

	/**
	 * Enqueue assets shared between editor and front-end (design tokens CSS).
	 *
	 * @return void
	 */
	public function enqueue_block_assets(): void {
		wp_enqueue_style(
			'goblocks-tokens',
			GOBLOCKS_URL . 'assets/css/tokens.css',
			array(),
			GOBLOCKS_VERSION
		);

		wp_enqueue_style(
			'goblocks-blocks',
			GOBLOCKS_URL . 'assets/css/blocks.css',
			array( 'goblocks-tokens' ),
			GOBLOCKS_VERSION
		);
	}

	/**
	 * Build the `goblocksEditor` localisation object.
	 *
	 * @return array<string, mixed>
	 */
	private function get_editor_data(): array {
		return SettingsStore::for_editor();
	}
}

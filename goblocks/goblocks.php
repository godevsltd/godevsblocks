<?php
/**
 * Plugin Name:       GoBlocks
 * Plugin URI:        https://godevs.net/goblocks
 * Description:       A lightweight, responsive block library for WordPress with 36 production-ready blocks, FSE support, dynamic content tags, and a real design token system.
 * Version:           1.0.0
 * Author:            godevs
 * Author URI:        https://godevs.net/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       goblocks
 * Domain Path:       /languages
 * Requires at least: 6.5
 * Requires PHP:      8.0
 * Tested up to:      7.0
 * Network:           true
 *
 * @package GoBlocks
 */

defined( 'ABSPATH' ) || exit;

// ── Plugin constants ────────────────────────────────────────────────────────

/** Plugin version — bump on every release. */
define( 'GOBLOCKS_VERSION', '1.0.0' );

/** Absolute path to the plugin directory (trailing slash). */
define( 'GOBLOCKS_DIR', plugin_dir_path( __FILE__ ) );

/** Public URL to the plugin directory (trailing slash). */
define( 'GOBLOCKS_URL', plugin_dir_url( __FILE__ ) );

/** Absolute path to the compiled build directory (trailing slash). */
define( 'GOBLOCKS_BUILD_DIR', GOBLOCKS_DIR . 'build/' );

/** Public URL to the compiled build directory (trailing slash). */
define( 'GOBLOCKS_BUILD_URL', GOBLOCKS_URL . 'build/' );

// ── Autoloader ─────────────────────────────────────────────────────────────

if ( file_exists( GOBLOCKS_DIR . 'vendor/autoload.php' ) ) {
	// Dev environment: use Composer-generated autoloader.
	require_once GOBLOCKS_DIR . 'vendor/autoload.php';
} else {
	// Production (no vendor/): lightweight PSR-4 fallback for GoBlocks\ classes.
	spl_autoload_register(
		static function ( string $fqcn ): void {
			if ( 0 !== strpos( $fqcn, 'GoBlocks\\' ) ) {
				return;
			}
			$relative = substr( $fqcn, strlen( 'GoBlocks\\' ) );
			$file     = GOBLOCKS_DIR . 'includes/' . str_replace( '\\', '/', $relative ) . '.php';
			if ( file_exists( $file ) ) {
				require_once $file;
			}
		}
	);
}

// ── Bootstrap ──────────────────────────────────────────────────────────────

/**
 * Fire the plugin bootstrap on plugins_loaded so all WP functions are available
 * and other plugins have registered their hooks.
 */
add_action( 'plugins_loaded', 'goblocks_bootstrap' );

/**
 * Initialise the GoBlocks plugin.
 *
 * @return void
 */
function goblocks_bootstrap(): void {
	// Boot the plugin (requires Composer autoloader or manual require).
	if ( class_exists( 'GoBlocks\\Core\\Plugin' ) ) {
		GoBlocks\Core\Plugin::get_instance()->boot();
	}
}

// ── WP-Cron batch CSS regeneration ────────────────────────────────────────

add_action( 'goblocks_batch_css_regenerate', 'goblocks_batch_regenerate_css' );

/**
 * WP-Cron callback: regenerate CSS for published posts containing GoBlocks blocks.
 *
 * Processes 50 posts per run and stores a page cursor so large sites are never
 * loaded into memory all at once. The cursor resets automatically when all pages
 * have been processed.
 *
 * @return void
 */
function goblocks_batch_regenerate_css(): void {
	$per_page = 50;
	$page     = max( 1, (int) get_option( 'goblocks_css_regen_page', 1 ) );

	$posts = get_posts(
		array(
			'post_type'      => 'any',
			'post_status'    => 'publish',
			'posts_per_page' => $per_page,
			'paged'          => $page,
			'fields'         => 'ids',
		)
	);

	foreach ( $posts as $post_id ) {
		$post_id = absint( $post_id );
		$content = get_post_field( 'post_content', $post_id );

		// Only regenerate posts that contain GoBlocks blocks.
		if ( false === strpos( $content, '<!-- wp:goblocks/' ) ) {
			continue;
		}

		$css = GoBlocks\CSS\CssGenerator::collect_for_post( $post_id );

		if ( $css ) {
			$minified = GoBlocks\CSS\CssGenerator::minify( $css );
			if ( is_rtl() ) {
				$minified = GoBlocks\CSS\CssGenerator::flip_rtl( $minified );
			}
			GoBlocks\CSS\CssCache::write( $post_id, $minified );
		}
	}

	// Advance the cursor for the next cron run; reset when all pages are done.
	if ( count( $posts ) === $per_page ) {
		update_option( 'goblocks_css_regen_page', $page + 1, false );
	} else {
		delete_option( 'goblocks_css_regen_page' );
	}
}

// ── Activation / Deactivation hooks ────────────────────────────────────────

register_activation_hook( __FILE__, 'goblocks_activate' );
register_deactivation_hook( __FILE__, 'goblocks_deactivate' );

/**
 * Runs on plugin activation.
 *
 * Stores the current plugin version for future migration checks.
 *
 * @return void
 */
function goblocks_activate(): void {
	update_option( 'goblocks_version', GOBLOCKS_VERSION );

	// Ensure the CSS cache directory exists.
	$upload_dir = wp_upload_dir();
	$css_dir    = trailingslashit( $upload_dir['basedir'] ) . 'goblocks/';

	if ( ! is_dir( $css_dir ) ) {
		wp_mkdir_p( $css_dir );
	}

	// Schedule daily CSS batch regeneration if not already scheduled.
	if ( ! wp_next_scheduled( 'goblocks_batch_css_regenerate' ) ) {
		wp_schedule_event( time(), 'daily', 'goblocks_batch_css_regenerate' );
	}
}

/**
 * Runs on plugin deactivation.
 *
 * Does NOT delete data — that happens in uninstall.php.
 *
 * @return void
 */
function goblocks_deactivate(): void {
	// Flush rewrite rules in case any block added a rewrite slug.
	flush_rewrite_rules();

	// Remove the scheduled batch CSS regeneration and its page cursor.
	wp_clear_scheduled_hook( 'goblocks_batch_css_regenerate' );
	delete_option( 'goblocks_css_regen_page' );
}

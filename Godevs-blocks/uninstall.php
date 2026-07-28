<?php
/**
 * GoBlocks Uninstall Script
 *
 * Runs when the plugin is deleted via the WordPress admin.
 * Removes ALL data created by GoBlocks: options, user meta, cached CSS files.
 *
 * This file is intentionally kept simple. It does NOT use the autoloader
 * because Composer may not be available at uninstall time.
 *
 * @package GoBlocks
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

// ── Options ────────────────────────────────────────────────────────────────

delete_option( 'goblocks_settings' );
delete_option( 'goblocks_version' );

// Remove all per-post CSS fingerprint options.
global $wpdb;

// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query(
	$wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
		$wpdb->esc_like( 'goblocks_css_' ) . '%'
	)
);

// ── User Meta ──────────────────────────────────────────────────────────────

delete_metadata( 'user', 0, 'goblocks_onboarded', '', true );

// ── CSS Cache Files ────────────────────────────────────────────────────────

$goblocks_upload_dir = wp_upload_dir();
$goblocks_css_dir    = trailingslashit( $goblocks_upload_dir['basedir'] ) . 'goblocks/';

if ( is_dir( $goblocks_css_dir ) ) {
	// Initialize WP_Filesystem for safe file operations.
	if ( ! function_exists( 'WP_Filesystem' ) ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
	}
	global $wp_filesystem;
	WP_Filesystem();

	// Remove all CSS files.
	$goblocks_files = glob( $goblocks_css_dir . '*.css' );
	if ( is_array( $goblocks_files ) ) {
		foreach ( $goblocks_files as $goblocks_file ) {
			if ( is_file( $goblocks_file ) ) {
				$wp_filesystem->delete( $goblocks_file );
			}
		}
	}
	// Remove the directory only if it is now empty.
	if ( ! glob( $goblocks_css_dir . '*' ) ) {
		$wp_filesystem->rmdir( $goblocks_css_dir );
	}
}

// ── Multisite: repeat for each blog ───────────────────────────────────────

if ( is_multisite() ) {
	$goblocks_blog_ids = $wpdb->get_col( "SELECT blog_id FROM {$wpdb->blogs}" ); // phpcs:ignore

	foreach ( $goblocks_blog_ids as $goblocks_blog_id ) {
		switch_to_blog( (int) $goblocks_blog_id );

		delete_option( 'goblocks_settings' );
		delete_option( 'goblocks_version' );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
				$wpdb->esc_like( 'goblocks_css_' ) . '%'
			)
		);

		restore_current_blog();
	}
}

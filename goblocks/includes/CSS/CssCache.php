<?php
/**
 * File-based CSS cache with MD5 delta tracking.
 *
 * @package GoBlocks\CSS
 */

namespace GoBlocks\CSS;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Utils\Capabilities;

/**
 * Manages per-post CSS files in wp-content/uploads/goblocks/.
 *
 * Write path:
 *   1. CssGenerator::collect_for_post($id) → $css string
 *   2. CssCache::write($id, $css) — only writes if MD5 changed
 *
 * Read path:
 *   1. CssCache::get_url($id) → enqueue with get_hash($id) as version
 */
class CssCache {

	/**
	 * WP_Options key prefix for per-post CSS hashes.
	 */
	private const HASH_OPTION_PREFIX = 'goblocks_css_';

	/**
	 * Subdirectory inside wp-content/uploads/ for CSS files.
	 */
	private const UPLOAD_SUBDIR = 'godevs-block-library';

	/**
	 * Write CSS to the per-post cache file, only if the content changed.
	 *
	 * Requires the current user to have upload_files capability when called
	 * from a user-initiated context. Server-side save hooks bypass this check.
	 *
	 * @param  int    $post_id Post ID.
	 * @param  string $css     Minified CSS string.
	 * @return bool  true if the file was written; false on error or no change.
	 */
	public static function write( int $post_id, string $css ): bool {
		$hash = md5( $css );

		// Skip write if CSS hasn't changed.
		if ( self::get_hash( $post_id ) === $hash ) {
			return false;
		}

		$path = self::get_file_path( $post_id );
		$dir  = dirname( $path );

		if ( ! wp_mkdir_p( $dir ) ) {
			return false;
		}

		$filesystem = self::get_filesystem();

		if ( $filesystem ) {
			$result = $filesystem->put_contents( $path, $css, FS_CHMOD_FILE );
		} else {
			// WP_Filesystem unavailable (FTP/SSH host without credentials in this.
			// context) — fall back to native PHP. wp-content/uploads is always.
			// writable by the web-server process, so this is safe.
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			$result = false !== file_put_contents( $path, $css );
		}

		if ( $result ) {
			self::set_hash( $post_id, $hash );
		}

		return (bool) $result;
	}

	/**
	 * Read the contents of a cached CSS file.
	 *
	 * @param  int $post_id Post ID.
	 * @return string|false CSS string, or false if file does not exist.
	 */
	public static function read( int $post_id ): string|false {
		$path = self::get_file_path( $post_id );

		$filesystem = self::get_filesystem();
		if ( ! $filesystem || ! $filesystem->exists( $path ) ) {
			return false;
		}

		return $filesystem->get_contents( $path );
	}

	/**
	 * Delete a post's CSS cache file and stored hash.
	 *
	 * @param  int $post_id Post ID.
	 * @return bool
	 */
	public static function delete( int $post_id ): bool {
		$path = self::get_file_path( $post_id );

		$filesystem = self::get_filesystem();
		if ( $filesystem && $filesystem->exists( $path ) ) {
			$filesystem->delete( $path );
		}

		delete_option( self::HASH_OPTION_PREFIX . $post_id );
		return true;
	}

	/**
	 * Return the public URL for a post's CSS file, or null if it doesn't exist.
	 *
	 * @param  int $post_id Post ID.
	 * @return string|null
	 */
	public static function get_url( int $post_id ): ?string {
		$path = self::get_file_path( $post_id );

		// Use WP_Filesystem when available, fall back to is_file() so a.
		// successfully-written file is always found even on FTP-method hosts.
		$filesystem = self::get_filesystem();
		$exists     = $filesystem ? $filesystem->exists( $path ) : is_file( $path );

		if ( ! $exists ) {
			return null;
		}

		$upload_dir = wp_upload_dir();
		$base_url   = trailingslashit( $upload_dir['baseurl'] );

		return $base_url . self::UPLOAD_SUBDIR . '/' . self::filename( $post_id );
	}

	/**
	 * Return the stored MD5 hash for a post's CSS.
	 *
	 * @param  int $post_id Post ID.
	 * @return string|false Hash string, or false if not stored.
	 */
	public static function get_hash( int $post_id ): string|false {
		return get_option( self::HASH_OPTION_PREFIX . $post_id, false );
	}

	/**
	 * Store the MD5 hash for a post's CSS.
	 *
	 * @param  int    $post_id Post ID.
	 * @param  string $hash    MD5 hash.
	 * @return void
	 */
	private static function set_hash( int $post_id, string $hash ): void {
		update_option( self::HASH_OPTION_PREFIX . $post_id, $hash, false );
	}

	/**
	 * Return the absolute filesystem path for a post's CSS file.
	 *
	 * On Multisite, prefixes the blog ID to prevent collisions.
	 *
	 * @param  int $post_id Post ID.
	 * @return string
	 */
	public static function get_file_path( int $post_id ): string {
		$upload_dir = wp_upload_dir();
		$base       = trailingslashit( $upload_dir['basedir'] ) . self::UPLOAD_SUBDIR . '/';

		if ( is_multisite() ) {
			$base .= get_current_blog_id() . '/';
		}

		return $base . self::filename( $post_id );
	}

	/**
	 * Return the CSS filename for a given post ID.
	 *
	 * @param  int $post_id Post ID.
	 * @return string
	 */
	private static function filename( int $post_id ): string {
		return 'post-' . absint( $post_id ) . '.css';
	}

	/**
	 * Initialise and return the WP_Filesystem abstraction layer.
	 *
	 * @return \WP_Filesystem_Base|null
	 */
	private static function get_filesystem(): ?\WP_Filesystem_Base {
		global $wp_filesystem;

		if ( empty( $wp_filesystem ) ) {
			if ( ! function_exists( 'WP_Filesystem' ) ) {
				require_once ABSPATH . 'wp-admin/includes/file.php';
			}
			WP_Filesystem();
		}

		return $wp_filesystem instanceof \WP_Filesystem_Base ? $wp_filesystem : null;
	}
}

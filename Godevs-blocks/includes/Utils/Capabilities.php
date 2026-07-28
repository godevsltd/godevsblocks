<?php
/**
 * Capability constants used throughout GoBlocks.
 *
 * @package GoBlocks\Utils
 */

namespace GoBlocks\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Central registry of WordPress capability strings used by the plugin.
 *
 * Using named constants prevents typo-bugs and makes capability usage
 * grep-able across the codebase.
 */
final class Capabilities {

	/**
	 * Manage plugin settings (admin settings page, REST write endpoints).
	 * Equivalent to administrator role.
	 */
	public const MANAGE_SETTINGS = 'manage_options';

	/**
	 * Use the block editor / create/edit posts.
	 * Minimum capability for read-only REST endpoints (query preview, etc.).
	 */
	public const USE_BLOCKS = 'edit_posts';

	/**
	 * Upload files — required for writing CSS cache files to the uploads directory.
	 */
	public const UPLOAD_FILES = 'upload_files';

	/**
	 * Unfiltered HTML — gates raw SVG / custom CSS output.
	 * Only super-admins have this on Multisite.
	 */
	public const UNFILTERED_HTML = 'unfiltered_html';

	/**
	 * Manage network — Multisite-wide operations.
	 */
	public const MANAGE_NETWORK = 'manage_network';

	/**
	 * Check whether the current user can manage plugin settings.
	 *
	 * @return bool
	 */
	public static function can_manage_settings(): bool {
		return current_user_can( self::MANAGE_SETTINGS );
	}

	/**
	 * Check whether the current user can use blocks (minimum editor access).
	 *
	 * @return bool
	 */
	public static function can_use_blocks(): bool {
		return current_user_can( self::USE_BLOCKS );
	}

	/**
	 * Check whether the current user can write to the uploads directory.
	 *
	 * @return bool
	 */
	public static function can_upload_files(): bool {
		return current_user_can( self::UPLOAD_FILES );
	}

	/**
	 * Private constructor — this class is never instantiated.
	 */
	private function __construct() {}
}

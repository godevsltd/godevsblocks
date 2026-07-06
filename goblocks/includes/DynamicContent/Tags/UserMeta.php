<?php
/**
 * Resolves an arbitrary meta field for the currently logged-in user.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Exposes a single user meta field for the currently logged-in user.
 * TagSecurity enforces is_user_logged_in() before resolve() is called.
 */
class UserMeta extends TagBase {
	/** Public user meta keys that are safe to expose. */
	private const ALLOWED_KEYS = array(
		'nickname',
		'first_name',
		'last_name',
		'description',
		'billing_first_name',
		'billing_last_name',
		'billing_city',
		'billing_country',
	);

	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'user_meta'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Current User Meta', 'goblocks' ); }
	/**
	 * Group for the tag picker.
	 *
	 * @return string
	 */
	public function get_category(): string {
		return 'user'; }
	/**
	 * Short description for the tag picker tooltip.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return __( 'A meta field for the currently logged-in user.', 'goblocks' ); }
	/**
	 * Output escape type applied after resolve().
	 *
	 * @return string
	 */
	public function get_escape_type(): string {
		return 'html'; }
	/**
	 * Contexts in which this tag is valid.
	 *
	 * @return string[]
	 */
	public function get_contexts(): array {
		return array( 'any' ); }

	/**
	 * Declared option schema.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public function get_options(): array {
		return array(
			array(
				'key'         => 'key',
				'type'        => 'string',
				'default'     => 'first_name',
				'description' => __( 'User meta key.', 'goblocks' ),
			),
		);
	}

	/**
	 * Resolve the tag to a string for frontend output.
	 *
	 * @param  array<string, mixed>  $context Dynamic content context.
	 * @param  array<string, string> $options Parsed option key→value pairs.
	 * @return string Unescaped resolved value.
	 */
	public function resolve( array $context, array $options ): string {
		// TagSecurity already confirmed is_user_logged_in(); belt-and-braces.
		if ( ! is_user_logged_in() ) {
			return '';
		}

		$key = sanitize_key( $this->opt( 'key', $options ) );

		if ( ! in_array( $key, self::ALLOWED_KEYS, true ) ) {
			return '';
		}

		$user_id = get_current_user_id();
		return (string) get_user_meta( $user_id, $key, true );
	}
}

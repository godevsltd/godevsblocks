<?php
/**
 * Resolves the display name of the post author.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Resolves the display name of the post author.
 */
class AuthorName extends TagBase {
	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'author_name'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Author Name', 'goblocks' ); }
	/**
	 * Group for the tag picker.
	 *
	 * @return string
	 */
	public function get_category(): string {
		return 'author'; }
	/**
	 * Short description for the tag picker tooltip.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return __( 'The display name of the post author.', 'goblocks' ); }
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
				'key'         => 'format',
				'type'        => 'string',
				'default'     => 'display',
				'description' => __( 'Name format: display (default), first, last, login.', 'goblocks' ),
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
		$user = $this->get_author( $context );
		if ( ! $user ) {
			return '';
		}

		return match ( $this->opt( 'format', $options ) ) {
			'first'   => $user->first_name,
			'last'    => $user->last_name,
			'login'   => $user->user_login,
			default   => $user->display_name,
		};
	}
}

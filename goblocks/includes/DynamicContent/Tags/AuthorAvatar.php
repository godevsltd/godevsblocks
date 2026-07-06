<?php
/**
 * Resolves the Gravatar URL for the post author.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Resolves the Gravatar URL for the post author.
 */
class AuthorAvatar extends TagBase {
	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'author_avatar'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Author Avatar URL', 'goblocks' ); }
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
		return __( 'The Gravatar URL for the post author.', 'goblocks' ); }
	/**
	 * Output escape type applied after resolve().
	 *
	 * @return string
	 */
	public function get_escape_type(): string {
		return 'url'; }
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
				'key'         => 'size',
				'type'        => 'int',
				'default'     => 96,
				'description' => __( 'Avatar size in pixels.', 'goblocks' ),
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

		$size_opt = $this->opt( 'size', $options );
		$size     = absint( $size_opt ? $size_opt : 96 );
		$url      = get_avatar_url( $user->ID, array( 'size' => $size ) );
		return $url ? $url : '';
	}
}

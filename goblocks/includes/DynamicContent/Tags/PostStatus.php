<?php
/**
 * Resolves the post status of the current post.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Resolves the post status of the current post.
 */
class PostStatus extends TagBase {
	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'post_status'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Post Status', 'goblocks' ); }
	/**
	 * Group for the tag picker.
	 *
	 * @return string
	 */
	public function get_category(): string {
		return 'post'; }
	/**
	 * Short description for the tag picker tooltip.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return __( 'The status of the current post (publish, draft, etc.).', 'goblocks' ); }
	/**
	 * Declared option schema.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public function get_options(): array {
		return array(); }
	/**
	 * Contexts in which this tag is valid.
	 *
	 * @return string[]
	 */
	public function get_contexts(): array {
		return array( 'any' ); }
	/**
	 * Output escape type applied after resolve().
	 *
	 * @return string
	 */
	public function get_escape_type(): string {
		return 'html'; }

	/**
	 * Resolve the tag to a string for frontend output.
	 *
	 * @param  array<string, mixed>  $context Dynamic content context.
	 * @param  array<string, string> $options Parsed option key→value pairs.
	 * @return string Unescaped resolved value.
	 */
	public function resolve( array $context, array $options ): string {
		$post = $this->get_post( $context );
		return $post ? (string) $post->post_status : '';
	}
}

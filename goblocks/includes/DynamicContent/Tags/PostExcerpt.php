<?php
/**
 * Resolves the excerpt of the current post.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Resolves the excerpt of the current post.
 */
class PostExcerpt extends TagBase {
	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'post_excerpt'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Post Excerpt', 'goblocks' ); }
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
		return __( 'The post excerpt (auto-generated if not set).', 'goblocks' ); }
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
				'key'         => 'length',
				'type'        => 'int',
				'default'     => 55,
				'description' => __( 'Word limit (0 = no limit).', 'goblocks' ),
			),
			array(
				'key'         => 'more',
				'type'        => 'string',
				'default'     => '…',
				'description' => __( 'Trailing "more" text.', 'goblocks' ),
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
		$post = $this->get_post( $context );
		if ( ! $post ) {
			return '';
		}

		$length = absint( $this->opt( 'length', $options ) );
		$more   = $this->opt( 'more', $options );

		// Use explicit excerpt if set, otherwise generate from content.
		$trim_length = $length ? $length : 55;
		$text        = $post->post_excerpt ? $post->post_excerpt : wp_trim_words( strip_shortcodes( $post->post_content ), $trim_length, $more );

		if ( $length > 0 && ! $post->post_excerpt ) {
			return $text; // wp_trim_words already handled length.
		}

		if ( $length > 0 && $post->post_excerpt ) {
			return wp_trim_words( $text, $length, $more );
		}

		return $text;
	}
}

<?php
/**
 * Resolves the publish date of the current post.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Resolves the publish date of the current post.
 */
class PostDate extends TagBase {
	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'post_date'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Post Date', 'godevs-block-library' ); }
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
		return __( 'The publication date of the post.', 'godevs-block-library' ); }
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
				'default'     => '',
				'description' => __( 'PHP date format (blank = site default).', 'godevs-block-library' ),
			),
			array(
				'key'         => 'gmt',
				'type'        => 'bool',
				'default'     => 'false',
				'description' => __( 'Use GMT date.', 'godevs-block-library' ),
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

		$format    = $this->opt( 'format', $options );
		$use_gmt   = in_array( $this->opt( 'gmt', $options ), array( '1', 'true', 'yes' ), true );
		$timestamp = $use_gmt
			? strtotime( $post->post_date_gmt . ' UTC' )
			: strtotime( $post->post_date );

		return $this->format_date( $format, (int) $timestamp );
	}
}

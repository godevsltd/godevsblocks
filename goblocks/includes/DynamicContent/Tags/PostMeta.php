<?php
/**
 * Resolves a custom field value from the current post.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Resolves a custom field value from the current post.
 */
class PostMeta extends TagBase {
	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'post_meta'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Post Meta', 'godevs-block-library' ); }
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
		return __( 'A custom field value from the current post.', 'godevs-block-library' ); }
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
				'default'     => '',
				'description' => __( 'Meta key (required).', 'godevs-block-library' ),
			),
			array(
				'key'         => 'fallback',
				'type'        => 'string',
				'default'     => '',
				'description' => __( 'Value to show when meta is empty.', 'godevs-block-library' ),
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

		$key = sanitize_key( $this->opt( 'key', $options ) );
		if ( '' === $key ) {
			return '';
		}

		// Refuse to expose private (underscore-prefixed) meta to anonymous requests.
		if ( str_starts_with( $key, '_' ) && ! current_user_can( 'edit_post', $post->ID ) ) {
			return '';
		}

		$value = get_post_meta( $post->ID, $key, true );

		if ( is_array( $value ) || is_object( $value ) ) {
			return '';
		}

		$value = (string) $value;

		if ( '' === $value ) {
			return $this->opt( 'fallback', $options );
		}

		return $value;
	}
}

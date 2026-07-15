<?php
/**
 * Resolves the featured image URL for the current post.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Resolves the featured image URL for the current post.
 */
class FeaturedImage extends TagBase {
	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'featured_image'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Featured Image', 'godevs-block-library' ); }
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
		return __( 'A URL or attribute of the featured image.', 'godevs-block-library' ); }
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
				'type'        => 'string',
				'default'     => 'large',
				'description' => __( 'Image size slug.', 'godevs-block-library' ),
			),
			array(
				'key'         => 'attr',
				'type'        => 'string',
				'default'     => 'src',
				'description' => __( 'Attribute to return: src, alt, width, height, srcset.', 'godevs-block-library' ),
			),
		);
	}

	/**
	 * Output escape type applied after resolve().
	 *
	 * @return string
	 */
	public function get_escape_type(): string {
		// Escape type varies — we apply it manually in resolve() and return 'html'.
		// so TagRegistry doesn't double-escape.
		return 'raw';
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

		$thumb_id = get_post_thumbnail_id( $post );
		if ( ! $thumb_id ) {
			return '';
		}

		$size_opt = $this->opt( 'size', $options );
		$attr_opt = $this->opt( 'attr', $options );
		$size     = sanitize_key( $size_opt ? $size_opt : 'large' );
		$attr     = strtolower( sanitize_key( $attr_opt ? $attr_opt : 'src' ) );

		switch ( $attr ) {
			case 'src':
				$src = wp_get_attachment_image_url( $thumb_id, $size );
				return $src ? esc_url( $src ) : '';

			case 'alt':
				return esc_attr( get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) );

			case 'srcset':
				$srcset = wp_get_attachment_image_srcset( $thumb_id, $size );
				return $srcset ? esc_attr( $srcset ) : '';

			case 'width':
			case 'height':
				$meta = wp_get_attachment_metadata( $thumb_id );
				if ( $meta && isset( $meta[ $attr ] ) ) {
					return (string) absint( $meta[ $attr ] );
				}
				return '';

			default:
				return '';
		}
	}
}

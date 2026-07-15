<?php
/**
 * Resolves the archive URL of the first term assigned to the current post.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Resolves the archive URL of the first term assigned to the current post.
 */
class TermUrl extends TagBase {
	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'term_url'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Term URL', 'godevs-block-library' ); }
	/**
	 * Group for the tag picker.
	 *
	 * @return string
	 */
	public function get_category(): string {
		return 'term'; }
	/**
	 * Short description for the tag picker tooltip.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return __( 'The archive URL of a taxonomy term assigned to the post.', 'godevs-block-library' ); }
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
				'key'         => 'taxonomy',
				'type'        => 'string',
				'default'     => 'category',
				'description' => __( 'Taxonomy slug.', 'godevs-block-library' ),
			),
			array(
				'key'         => 'index',
				'type'        => 'int',
				'default'     => 0,
				'description' => __( 'Zero-based term index.', 'godevs-block-library' ),
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
		$tax_opt  = $this->opt( 'taxonomy', $options );
		$taxonomy = sanitize_key( $tax_opt ? $tax_opt : 'category' );
		$terms    = $this->get_terms_for_post( $context, $taxonomy );
		$index    = absint( $this->opt( 'index', $options ) );

		if ( ! isset( $terms[ $index ] ) ) {
			return '';
		}

		$url = get_term_link( $terms[ $index ] );
		return ( $url && ! is_wp_error( $url ) ) ? (string) $url : '';
	}
}

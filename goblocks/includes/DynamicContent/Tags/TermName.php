<?php
/**
 * Resolves the name of the first term assigned to the current post.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Resolves the name of the first term assigned to the current post.
 */
class TermName extends TagBase {
	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'term_name'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Term Name', 'goblocks' ); }
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
		return __( 'The name of a taxonomy term assigned to the post.', 'goblocks' ); }
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
				'key'         => 'taxonomy',
				'type'        => 'string',
				'default'     => 'category',
				'description' => __( 'Taxonomy slug.', 'goblocks' ),
			),
			array(
				'key'         => 'index',
				'type'        => 'int',
				'default'     => 0,
				'description' => __( 'Zero-based term index.', 'goblocks' ),
			),
			array(
				'key'         => 'separator',
				'type'        => 'string',
				'default'     => '',
				'description' => __( 'Join separator (empty = single term by index).', 'goblocks' ),
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
		if ( empty( $terms ) ) {
			return '';
		}

		$separator = $this->opt( 'separator', $options );

		if ( '' !== $separator ) {
			return implode( $separator, array_map( static fn( $t ) => $t->name, $terms ) );
		}

		$index = absint( $this->opt( 'index', $options ) );
		return isset( $terms[ $index ] ) ? $terms[ $index ]->name : '';
	}
}

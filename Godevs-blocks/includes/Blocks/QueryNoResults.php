<?php
/**
 * Query No Results.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * QueryNoResults block — PHP render callback.
 *
 * Renders its inner blocks only when the parent Query block's loop
 * returned zero posts. Reads the WP_Query stored by the QueryLoop
 * sibling block via QueryLoop::get_query().
 *
 * Must be placed inside a goblocks/query block (enforced by block.json ancestor).
 */
class QueryNoResults extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'query-no-results';
	}

	/**
	 * Render the No Results block.
	 *
	 * Returns inner block HTML only when the sibling QueryLoop ran a query
	 * that found zero posts. Returns empty string otherwise so there is
	 * no output when results exist.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @param  string               $content    Rendered inner blocks HTML.
	 * @param  \WP_Block            $block      Block instance with context.
	 * @return string
	 */
	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$query_id = sanitize_key( (string) ( $block->context['goblocks/queryId'] ?? '' ) );

		if ( ! $query_id ) {
			return '';
		}

		$query = QueryLoop::get_query( $query_id );

		if ( ! $query instanceof \WP_Query ) {
			return '';
		}

		if ( $query->found_posts > 0 ) {
			return '';
		}

		return '<div class="gb-query-no-results">' . $content . '</div>';
	}
}

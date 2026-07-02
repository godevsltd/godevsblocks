<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Query\QueryBuilder;

/**
 * QueryLoop block — PHP render callback.
 *
 * Runs the WP_Query and iterates through posts. For each post it renders
 * the inner block template with postId + postType context injected so
 * dynamic-content blocks can resolve post fields.
 *
 * The executed WP_Query is stored by queryId so the sibling Pagination
 * block can read total pages without running a second query.
 */
class QueryLoop extends BlockBase {

	/**
	 * Map of queryId → WP_Query for the current request render cycle.
	 *
	 * @var array<string, \WP_Query>
	 */
	private static array $queries = array();

	/**
	 * @return string
	 */
	public function get_name(): string {
		return 'query-loop';
	}

	/**
	 * Render the QueryLoop block.
	 *
	 * NOTE: $content is the inner block template rendered once by WordPress.
	 * We ignore it here and manually render $block->inner_blocks for each post
	 * to inject per-post context.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @param  string               $content    Single-pass inner block render (ignored).
	 * @param  \WP_Block            $block      Block instance with context.
	 * @return string
	 */
	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$query_id    = sanitize_key( (string) ( $block->context['goblocks/queryId'] ?? '' ) );
		$query_attrs = is_array( $block->context['goblocks/query'] ?? null )
			? $block->context['goblocks/query']
			: array();

		$inherit = ! empty( $query_attrs['inherit'] );

		// Build and run the query.
		$paged_var  = get_query_var( 'paged' );
		$page_var   = get_query_var( 'page' );
		$paged      = absint( $paged_var ? $paged_var : ( $page_var ? $page_var : 1 ) );
		$query_args = QueryBuilder::build( $query_attrs, $block );

		if ( ! $inherit ) {
			$query_args['paged'] = $paged;
		}

		$query = QueryBuilder::execute( $query_args );

		// Store for Pagination block (rendered after QueryLoop as a sibling).
		if ( $query_id ) {
			self::$queries[ $query_id ] = $query;
		}

		if ( ! $query->have_posts() ) {
			wp_reset_postdata();
			return '';
		}

		$unique_id   = $this->get_unique_id( $attributes );
		$block_class = $unique_id ? $this->get_block_class( $unique_id ) : '';
		$classes     = $this->build_class_string(
			$block_class ? $block_class : 'gb-query-loop',
			$this->get_global_classes( $attributes ),
			array( 'gb-query-loop' )
		);
		$html_attrs  = $this->build_html_attrs( $this->get_html_attributes( $attributes ) );

		$output = '';

		while ( $query->have_posts() ) {
			$query->the_post();

			$post_context = array(
				'postId'  => (int) get_the_ID(),
				'post_id' => (int) get_the_ID(),
				'postType' => (string) get_post_type(),
			);

			// Render the inner block template once per post with post context.
			foreach ( $block->inner_blocks as $inner_block ) {
				$output .= $inner_block->render( $post_context );
			}
		}

		wp_reset_postdata();

		return sprintf( '<div class="%s"%s>%s</div>', $classes, $html_attrs, $output );
	}

	/**
	 * Return the WP_Query run for a given query ID.
	 * Called by Pagination::render() to read max_num_pages.
	 *
	 * @param  string $query_id The goblocks/queryId context value.
	 * @return \WP_Query|null
	 */
	public static function get_query( string $query_id ): ?\WP_Query {
		return self::$queries[ $query_id ] ?? null;
	}
}

<?php
/**
 * Query Loop.
 *
 * @package GoBlocks\Blocks
 */

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
	 * Block slug used to register the block type.
	 *
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

		// ── Layout context ─────────────────────────────────────────────────────.

		$layout      = (array) ( $block->context['goblocks/layout'] ?? array() );
		$layout_type = (string) ( $layout['type'] ?? 'grid' );
		$layout_cols = max( 1, min( 4, (int) ( $layout['columns'] ?? 3 ) ) );

		// ── CSS classes ────────────────────────────────────────────────────────.

		$unique_id   = $this->get_unique_id( $attributes );
		$block_class = $unique_id ? $this->get_block_class( $unique_id ) : '';

		$layout_classes = array( 'gb-query-loop' );
		if ( 'list' === $layout_type ) {
			$layout_classes[] = 'gb-query-loop--list';
		} else {
			$layout_classes[] = 'gb-query-loop--grid';
			$layout_classes[] = 'gb-query-loop--cols-' . $layout_cols;
		}

		$classes    = $this->build_class_string(
			$block_class ? $block_class : 'gb-query-loop',
			$this->get_global_classes( $attributes ),
			$layout_classes
		);
		$html_attrs = $this->build_html_attrs( $this->get_html_attributes( $attributes ) );

		$output = '';

		// ── Per-post rendering ─────────────────────────────────────────────────.

		// Merge parent context with per-post data and create a fresh WP_Block.
		// per inner block so nested blocks (core/post-title, core/post-excerpt,.
		// etc.) receive postId correctly. WP_Block::render() accepts options, NOT.
		// context — context must be baked into the constructor, which is exactly.
		// how WordPress core's own Query block works.

		while ( $query->have_posts() ) {
			$query->the_post();

			$post_context = array(
				'postId'   => (int) get_the_ID(),
				'postType' => (string) get_post_type(),
			);

			// $block->available_context can be null when rendered outside a.
			// full WP_Block tree (e.g. do_blocks() in a REST request). Cast.
			// to array so array_merge() never receives a null first argument.
			$parent_context = is_array( $block->available_context ) ? $block->available_context : array();
			$merged_context = array_merge( $parent_context, $post_context );

			$post_output = '';
			foreach ( $block->inner_blocks as $inner_block ) {
				$post_output .= ( new \WP_Block(
					$inner_block->parsed_block,
					$merged_context
				) )->render( array( 'dynamic' => true ) );
			}

			// Fallback card when the template produces no visible content.
			// (e.g. user added the block but left the template empty).
			if ( '' === trim( wp_strip_all_tags( $post_output ) ) ) {
				$post_output = self::render_fallback_card();
			}

			// Wrap each post in an article so it is a single grid/flex item.
			$output .= '<article class="gb-query-loop__item">' . $post_output . '</article>';
		}

		wp_reset_postdata();

		return sprintf( '<div class="%s"%s>%s</div>', $classes, $html_attrs, $output );
	}

	/**
	 * Minimal post card used when the user's template produces no visible output.
	 * Ensures pages with an unconfigured Query block are never completely blank.
	 *
	 * @return string
	 */
	private static function render_fallback_card(): string {
		$thumb_url  = get_the_post_thumbnail_url( null, 'medium_large' );
		$thumb_html = $thumb_url
			? sprintf(
				'<a href="%s"><img class="gb-query-fallback-card__thumbnail" src="%s" alt="%s" loading="lazy"></a>',
				esc_url( get_permalink() ),
				esc_url( $thumb_url ),
				esc_attr( get_the_title() )
			)
			: '';

		$excerpt = get_the_excerpt();
		if ( ! $excerpt ) {
			$excerpt = wp_trim_words( get_the_content(), 20, '&hellip;' );
		}
		$card_title = (string) get_the_title();
		$card_title = '' !== $card_title ? $card_title : (string) __( '(Untitled)', 'goblocks' );

		return sprintf(
			'<article class="gb-query-fallback-card">%s<div class="gb-query-fallback-card__body"><h3 class="gb-query-fallback-card__title"><a href="%s">%s</a></h3><div class="gb-query-fallback-card__meta"><time datetime="%s">%s</time></div>%s</div></article>',
			$thumb_html,
			esc_url( get_permalink() ),
			esc_html( $card_title ),
			esc_attr( get_the_date( 'Y-m-d' ) ),
			esc_html( get_the_date() ),
			$excerpt ? '<p class="gb-query-fallback-card__excerpt">' . esc_html( $excerpt ) . '</p>' : ''
		);
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

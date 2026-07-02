<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * Pagination block — PHP render callback.
 *
 * Reads the WP_Query stored by QueryLoop and renders the appropriate
 * pagination UI based on paginationType from context.
 *
 * Pagination types:
 *   standard  — numbered pages, zero JS, full page reload (SEO-friendly)
 *   load-more — REST append, single "Load More" button
 *   infinite  — IntersectionObserver auto-fetch
 */
class Pagination extends BlockBase {

	/**
	 * @return string
	 */
	public function get_name(): string {
		return 'pagination';
	}

	/**
	 * Render pagination output.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @param  string               $content    Inner blocks HTML (unused).
	 * @param  \WP_Block            $block      Block instance.
	 * @return string
	 */
	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$query_id        = sanitize_key( (string) ( $block->context['goblocks/queryId'] ?? '' ) );
		$pagination_type = sanitize_key( (string) ( $block->context['goblocks/paginationType'] ?? 'standard' ) );

		// Retrieve the query already executed by the sibling QueryLoop block.
		$query = QueryLoop::get_query( $query_id );

		if ( ! $query || (int) $query->max_num_pages <= 1 ) {
			return '';
		}

		$total_pages = (int) $query->max_num_pages;
		$paged_var   = get_query_var( 'paged' );
		$page_var    = get_query_var( 'page' );
		$current     = absint( $paged_var ? $paged_var : ( $page_var ? $page_var : 1 ) );

		$unique_id   = $this->get_unique_id( $attributes );
		$block_class = $unique_id ? $this->get_block_class( $unique_id ) : 'gb-pagination';
		$classes     = $this->build_class_string(
			$block_class,
			$this->get_global_classes( $attributes ),
			array( 'gb-pagination', 'gb-pagination--' . esc_attr( $pagination_type ) )
		);

		switch ( $pagination_type ) {
			case 'load-more':
				return $this->render_load_more( $classes, $total_pages, $current, $query_id, $attributes );

			case 'infinite':
				return $this->render_infinite( $classes, $total_pages, $current, $query_id );

			default:
				return $this->render_standard( $classes, $total_pages, $current, $attributes );
		}
	}

	/**
	 * Standard numbered pagination — zero JavaScript required.
	 *
	 * @param  string               $classes     CSS class string.
	 * @param  int                  $total_pages Total page count.
	 * @param  int                  $current     Current page number.
	 * @param  array<string, mixed> $attributes  Block attributes.
	 * @return string
	 */
	private function render_standard(
		string $classes,
		int $total_pages,
		int $current,
		array $attributes
	): string {
		$prev_label      = sanitize_text_field( (string) ( $attributes['prevLabel'] ?? '' ) );
		$next_label      = sanitize_text_field( (string) ( $attributes['nextLabel'] ?? '' ) );
		$show_first_last = (bool) ( $attributes['showFirstLast'] ?? false );
		$show_prev_next  = isset( $attributes['showPrevNext'] ) ? (bool) $attributes['showPrevNext'] : true;

		$links = paginate_links(
			array(
				'total'     => $total_pages,
				'current'   => $current,
				'prev_text' => $show_prev_next ? ( $prev_label ?: __( '&laquo; Previous', 'goblocks' ) ) : false,
				'next_text' => $show_prev_next ? ( $next_label ?: __( 'Next &raquo;', 'goblocks' ) ) : false,
				'type'      => 'array',
				'end_size'  => $show_first_last ? 1 : 0,
				'mid_size'  => 2,
			)
		);

		if ( empty( $links ) ) {
			return '';
		}

		$items = '';
		foreach ( $links as $link ) {
			$items .= '<li class="gb-pagination__item">' . $link . '</li>';
		}

		return sprintf(
			'<nav class="%s" aria-label="%s"><ul class="gb-pagination__list">%s</ul></nav>',
			$classes,
			esc_attr__( 'Page navigation', 'goblocks' ),
			$items
		);
	}

	/**
	 * Load-more button — JavaScript fetches and appends next page via REST.
	 *
	 * @param  string               $classes     CSS class string.
	 * @param  int                  $total_pages Total page count.
	 * @param  int                  $current     Current page number.
	 * @param  string               $query_id    Block query ID.
	 * @param  array<string, mixed> $attributes  Block attributes.
	 * @return string
	 */
	private function render_load_more(
		string $classes,
		int $total_pages,
		int $current,
		string $query_id,
		array $attributes
	): string {
		if ( $current >= $total_pages ) {
			return '';
		}

		$label = sanitize_text_field( (string) ( $attributes['loadMoreLabel'] ?? '' ) );

		return sprintf(
			'<div class="%s" data-query-id="%s" data-total-pages="%d" data-current-page="%d">'
			. '<button class="gb-pagination__load-more wp-element-button" type="button">%s</button>'
			. '</div>',
			$classes,
			esc_attr( $query_id ),
			$total_pages,
			$current,
			esc_html( $label ? $label : __( 'Load More', 'goblocks' ) )
		);
	}

	/**
	 * Infinite scroll — IntersectionObserver triggers next-page REST fetch.
	 *
	 * @param  string $classes     CSS class string.
	 * @param  int    $total_pages Total page count.
	 * @param  int    $current     Current page number.
	 * @param  string $query_id    Block query ID.
	 * @return string
	 */
	private function render_infinite(
		string $classes,
		int $total_pages,
		int $current,
		string $query_id
	): string {
		if ( $current >= $total_pages ) {
			return '';
		}

		return sprintf(
			'<div class="%s" data-query-id="%s" data-total-pages="%d" data-current-page="%d" aria-hidden="true">'
			. '<span class="gb-pagination__sentinel"></span>'
			. '</div>',
			$classes,
			esc_attr( $query_id ),
			$total_pages,
			$current
		);
	}
}

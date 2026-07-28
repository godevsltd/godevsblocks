<?php
/**
 * Query Builder.
 *
 * @package GoBlocks\Query
 */

namespace GoBlocks\Query;

defined( 'ABSPATH' ) || exit;

/**
 * Builds and executes WP_Query args from GoBlocks Query block attributes.
 *
 * Sanitization is delegated to QuerySanitizer.
 * Third-party extensions can hook via the 'goblocks_query_args' filter.
 */
final class QueryBuilder {

	/**
	 * Build sanitized WP_Query args from raw block attributes.
	 *
	 * @param  array<string, mixed> $attrs Query block attribute values.
	 * @param  \WP_Block|null       $block Block instance (used for context when inherit = true).
	 * @return array<string, mixed> WP_Query args.
	 */
	public static function build( array $attrs, ?\WP_Block $block = null ): array { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		$args = array();

		// Post type.
		$args['post_type'] = QuerySanitizer::sanitize_post_types( $attrs['postType'] ?? array( 'post' ) );

		// Post status.
		$args['post_status'] = QuerySanitizer::sanitize_status( $attrs['postStatus'] ?? array( 'publish' ) );

		// Pagination.
		$args['posts_per_page'] = QuerySanitizer::sanitize_per_page( $attrs['perPage'] ?? 10 );
		$args['no_paging']      = ! empty( $attrs['noPaging'] );

		if ( isset( $attrs['offset'] ) ) {
			$args['offset'] = absint( $attrs['offset'] );
		}

		// Include / exclude specific post IDs.
		if ( ! empty( $attrs['includeIds'] ) && is_array( $attrs['includeIds'] ) ) {
			$args['post__in'] = array_map( 'absint', $attrs['includeIds'] );
		}

		if ( ! empty( $attrs['excludeIds'] ) && is_array( $attrs['excludeIds'] ) ) {
			$args['post__not_in'] = array_map( 'absint', $attrs['excludeIds'] ); // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_post__not_in
		}

		// Exclude the current post.
		if ( ! empty( $attrs['excludeCurrent'] ) ) {
			$current_id = get_queried_object_id();
			if ( $current_id ) {
				$existing             = (array) ( $args['post__not_in'] ?? array() );
				$existing[]           = $current_id;
				$args['post__not_in'] = array_unique( $existing ); // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_post__not_in
			}
		}

		// Taxonomy query.
		if ( ! empty( $attrs['taxQuery'] ) ) {
			$tax_query = QuerySanitizer::sanitize_tax_query( $attrs['taxQuery'] );
			if ( $tax_query ) {
				$args['tax_query'] = $tax_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			}
		}

		// Author filter.
		if ( ! empty( $attrs['author'] ) && is_array( $attrs['author'] ) ) {
			$args['author__in'] = array_map( 'absint', $attrs['author'] );
		}

		// Meta query.
		if ( ! empty( $attrs['metaQuery'] ) ) {
			$meta_query = QuerySanitizer::sanitize_meta_query( $attrs['metaQuery'] );
			if ( $meta_query ) {
				$args['meta_query'] = $meta_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
			}
		}

		// Meta key for orderby.
		if ( ! empty( $attrs['metaKey'] ) ) {
			$args['meta_key'] = sanitize_key( (string) $attrs['metaKey'] ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
		}

		// Date query.
		if ( ! empty( $attrs['dateQuery'] ) ) {
			$date_query = QuerySanitizer::sanitize_date_query( $attrs['dateQuery'] );
			if ( $date_query ) {
				$args['date_query'] = $date_query;
			}
		}

		// Ordering.
		$args['orderby'] = QuerySanitizer::sanitize_order_by( $attrs['orderBy'] ?? 'date' );
		$args['order']   = 'ASC' === strtoupper( (string) ( $attrs['order'] ?? 'DESC' ) ) ? 'ASC' : 'DESC';

		// Search.
		if ( ! empty( $attrs['search'] ) ) {
			$args['s'] = sanitize_text_field( (string) $attrs['search'] );
		}

		// Sticky posts.
		$sticky = (string) ( $attrs['sticky'] ?? 'include' );
		if ( 'exclude' === $sticky ) {
			$args['post__not_in'] = array_unique( // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_post__not_in
				array_merge( (array) ( $args['post__not_in'] ?? array() ), get_option( 'sticky_posts', array() ) )
			);
		} elseif ( 'only' === $sticky ) {
			$args['post__in'] = get_option( 'sticky_posts', array() );
		} else {
			$args['ignore_sticky_posts'] = 0;
		}

		// Cache results.
		$args['cache_results'] = isset( $attrs['cacheResults'] ) ? (bool) $attrs['cacheResults'] : true;

		// Inherit the current archive query (e.g., for Loop blocks on archive pages).
		if ( ! empty( $attrs['inherit'] ) ) {
			$args = self::inherit_query( $args );
		}

		/**
		 * Allow third-party plugins to modify the WP_Query args.
		 *
		 * @param array<string, mixed> $args  Sanitized args.
		 * @param array<string, mixed> $attrs Original block attributes.
		 */
		$args = (array) apply_filters( 'goblocks_query_args', $args, $attrs );

		return $args;
	}

	/**
	 * Execute a WP_Query with the given args.
	 *
	 * @param  array<string, mixed> $args WP_Query args.
	 * @return \WP_Query
	 */
	public static function execute( array $args ): \WP_Query {
		return new \WP_Query( $args );
	}

	/**
	 * Merge in vars from the main query when inherit = true.
	 *
	 * Copies paged, s, author, and taxonomy terms from the global $wp_query
	 * so the block loop reflects the current archive / search page.
	 *
	 * @param  array<string, mixed> $args Current args.
	 * @return array<string, mixed>
	 */
	private static function inherit_query( array $args ): array {
		global $wp_query;

		if ( ! $wp_query instanceof \WP_Query ) {
			return $args;
		}

		$main = $wp_query->query_vars;

		if ( ! empty( $main['paged'] ) ) {
			$args['paged'] = absint( $main['paged'] );
		}

		if ( ! empty( $main['s'] ) ) {
			$args['s'] = sanitize_text_field( (string) $main['s'] );
		}

		if ( ! empty( $main['author'] ) ) {
			$args['author'] = absint( $main['author'] );
		}

		if ( ! empty( $main['tax_query'] ) ) {
			$args['tax_query'] = $main['tax_query']; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
		}

		return $args;
	}
}

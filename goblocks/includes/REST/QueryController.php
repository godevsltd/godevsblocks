<?php
/**
 * Query Controller.
 *
 * @package GoBlocks\REST
 */

namespace GoBlocks\REST;

defined( 'ABSPATH' ) || exit;

/**
 * REST controller for Query block preview and metadata endpoints.
 *
 * Routes:
 *   GET  /goblocks/v1/query/post-types             → public post types list
 *   GET  /goblocks/v1/query/taxonomies             → taxonomies for a post type
 *   GET  /goblocks/v1/query/terms                  → terms for a taxonomy
 *   GET  /goblocks/v1/query/authors                → authors with published posts
 *   POST /goblocks/v1/query/preview                → run WP_Query and return post list
 *
 * All endpoints require edit_posts — they can expose draft/private content.
 */
class QueryController extends RestController {

	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		$cb = array( $this, 'require_edit_posts' );

		register_rest_route(
			$this->namespace,
			'/query/post-types',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_post_types' ),
				'permission_callback' => $cb,
			)
		);

		register_rest_route(
			$this->namespace,
			'/query/taxonomies',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_taxonomies' ),
				'permission_callback' => $cb,
				'args'                => array(
					'post_type' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/query/terms',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_terms' ),
				'permission_callback' => $cb,
				'args'                => array(
					'taxonomy' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
					'search'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'per_page' => array(
						'type'    => 'integer',
						'default' => 50,
						'minimum' => 1,
						'maximum' => 200,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/query/authors',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_authors' ),
				'permission_callback' => $cb,
			)
		);

		register_rest_route(
			$this->namespace,
			'/query/preview',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'preview_query' ),
				'permission_callback' => $cb,
			)
		);
	}

	/**
	 * GET /goblocks/v1/query/post-types
	 *
	 * @return \WP_REST_Response
	 */
	public function get_post_types(): \WP_REST_Response {
		$post_types = get_post_types( array( 'public' => true ), 'objects' );
		$result     = array();

		foreach ( $post_types as $type ) {
			$result[] = array(
				'slug'  => $type->name,
				'label' => $type->label,
				'icon'  => $type->menu_icon,
			);
		}

		return $this->success( $result );
	}

	/**
	 * GET /goblocks/v1/query/taxonomies
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_taxonomies( \WP_REST_Request $request ): \WP_REST_Response {
		$post_type = sanitize_key( (string) $request->get_param( 'post_type' ) );
		$args      = array( 'public' => true );

		if ( $post_type ) {
			$args['object_type'] = array( $post_type );
		}

		$taxonomies = get_taxonomies( $args, 'objects' );
		$result     = array();

		foreach ( $taxonomies as $tax ) {
			$result[] = array(
				'slug'  => $tax->name,
				'label' => $tax->label,
			);
		}

		return $this->success( $result );
	}

	/**
	 * GET /goblocks/v1/query/terms
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_terms( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$taxonomy       = sanitize_key( (string) $request->get_param( 'taxonomy' ) );
		$search         = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$per_page_param = $request->get_param( 'per_page' );
		$per_page       = absint( $per_page_param ? $per_page_param : 50 );

		if ( ! taxonomy_exists( $taxonomy ) ) {
			return $this->error(
				'goblocks_invalid_taxonomy',
				__( 'Invalid taxonomy.', 'goblocks' ),
				400
			);
		}

		$terms = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
				'search'     => $search,
				'number'     => $per_page,
			)
		);

		if ( is_wp_error( $terms ) ) {
			return $terms;
		}

		$result = array();
		foreach ( $terms as $term ) {
			$result[] = array(
				'id'    => $term->term_id,
				'slug'  => $term->slug,
				'name'  => $term->name,
				'count' => $term->count,
			);
		}

		return $this->success( $result );
	}

	/**
	 * GET /goblocks/v1/query/authors
	 *
	 * @return \WP_REST_Response
	 */
	public function get_authors(): \WP_REST_Response {
		$users = get_users(
			array(
				'who'     => 'authors',
				'orderby' => 'display_name',
				'order'   => 'ASC',
			)
		);

		$result = array();
		foreach ( $users as $user ) {
			$result[] = array(
				'id'   => $user->ID,
				'name' => $user->display_name,
				'slug' => $user->user_nicename,
			);
		}

		return $this->success( $result );
	}

	/**
	 * POST /goblocks/v1/query/preview
	 *
	 * Accepts a subset of WP_Query args and returns a lightweight post list
	 * for the Query block's editor preview.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function preview_query( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$body = $request->get_json_params();

		if ( ! is_array( $body ) ) {
			return $this->error(
				'goblocks_invalid_body',
				__( 'Request body must be a JSON object.', 'goblocks' )
			);
		}

		$query_args = $this->sanitize_query_args( $body );

		// Limit preview to max 12 posts to keep responses small.
		$query_args['posts_per_page'] = min( absint( $query_args['posts_per_page'] ?? 6 ), 12 );
		$query_args['no_found_rows']  = false;

		$query = new \WP_Query( $query_args );
		$posts = array();

		foreach ( $query->posts as $post ) {
			$posts[] = array(
				'id'        => $post->ID,
				'title'     => get_the_title( $post ),
				'permalink' => get_permalink( $post ),
				'thumbnail' => get_the_post_thumbnail_url( $post, 'medium' ),
				'excerpt'   => get_the_excerpt( $post ),
				'date'      => get_the_date( 'Y-m-d', $post ),
				'author'    => get_the_author_meta( 'display_name', (int) $post->post_author ),
			);
		}

		return $this->success(
			array(
				'posts'       => $posts,
				'total'       => (int) $query->found_posts,
				'total_pages' => (int) $query->max_num_pages,
			)
		);
	}

	/**
	 * Sanitize query args from the request body.
	 * Only allows a known safe subset of WP_Query parameters.
	 *
	 * @param array<string, mixed> $raw Raw request body.
	 * @return array<string, mixed> Sanitized WP_Query args.
	 */
	private function sanitize_query_args( array $raw ): array {
		$args = array();

		if ( isset( $raw['post_type'] ) ) {
			$args['post_type'] = array_map( 'sanitize_key', (array) $raw['post_type'] );
		}

		if ( isset( $raw['posts_per_page'] ) ) {
			$args['posts_per_page'] = absint( $raw['posts_per_page'] );
		}

		if ( isset( $raw['orderby'] ) ) {
			$allowed_orderby = array( 'date', 'title', 'menu_order', 'rand', 'comment_count', 'modified', 'ID' );
			$args['orderby'] = in_array( $raw['orderby'], $allowed_orderby, true ) ? $raw['orderby'] : 'date';
		}

		if ( isset( $raw['order'] ) ) {
			$args['order'] = 'ASC' === strtoupper( (string) $raw['order'] ) ? 'ASC' : 'DESC';
		}

		if ( isset( $raw['author__in'] ) ) {
			$args['author__in'] = array_map( 'absint', (array) $raw['author__in'] );
		}

		if ( isset( $raw['tax_query'] ) && is_array( $raw['tax_query'] ) ) {
			$args['tax_query'] = $this->sanitize_tax_query( $raw['tax_query'] ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
		}

		if ( isset( $raw['s'] ) ) {
			$args['s'] = sanitize_text_field( (string) $raw['s'] );
		}

		if ( isset( $raw['offset'] ) ) {
			$args['offset'] = absint( $raw['offset'] );
		}

		if ( isset( $raw['ignore_sticky_posts'] ) ) {
			$args['ignore_sticky_posts'] = (bool) $raw['ignore_sticky_posts'];
		}

		// Always limit to published posts for preview.
		$args['post_status'] = 'publish';

		return $args;
	}

	/**
	 * Sanitize a tax_query array to only allowed structure.
	 *
	 * @param array<mixed> $raw_tax_query Raw tax_query.
	 * @return array<mixed> Sanitized tax_query.
	 */
	private function sanitize_tax_query( array $raw_tax_query ): array {
		$clean = array();

		foreach ( $raw_tax_query as $clause ) {
			if ( ! is_array( $clause ) ) {
				continue;
			}

			if ( ! isset( $clause['taxonomy'] ) || ! taxonomy_exists( sanitize_key( (string) $clause['taxonomy'] ) ) ) {
				continue;
			}

			$clean[] = array(
				'taxonomy' => sanitize_key( (string) $clause['taxonomy'] ),
				'field'    => in_array( $clause['field'] ?? 'term_id', array( 'term_id', 'slug', 'name' ), true )
					? $clause['field']
					: 'term_id',
				'terms'    => array_map( 'absint', (array) ( $clause['terms'] ?? array() ) ),
				'operator' => in_array( $clause['operator'] ?? 'IN', array( 'IN', 'NOT IN', 'AND' ), true )
					? $clause['operator']
					: 'IN',
			);
		}

		return $clean;
	}
}

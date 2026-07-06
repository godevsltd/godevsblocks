<?php
namespace GoBlocks\REST;

defined( 'ABSPATH' ) || exit;

/**
 * REST controller for dynamic content tag preview.
 *
 * Routes:
 *   POST /goblocks/v1/dynamic-content/preview
 *     Body: { tag: string, post_id: int, options: object }
 *     Returns: { preview: string }
 *
 * Requires edit_posts: could expose private post meta or custom fields.
 *
 * Tag resolution is delegated to TagRegistry once the DynamicContent
 * subsystem is built in Step 14. This controller provides the REST
 * surface and security checks; it returns a placeholder until
 * TagRegistry exists.
 */
class DynamicContentController extends RestController {

	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/dynamic-content/preview',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'preview_tag' ),
				'permission_callback' => array( $this, 'require_edit_posts' ),
				'args'                => array(
					'tag'     => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'post_id' => array(
						'type'              => 'integer',
						'required'          => false,
						'sanitize_callback' => 'absint',
						'default'           => 0,
					),
					'options' => array(
						'type'     => 'object',
						'required' => false,
						'default'  => array(),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/dynamic-content/tags',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_tags' ),
				'permission_callback' => array( $this, 'require_edit_posts' ),
			)
		);
	}

	/**
	 * POST /goblocks/v1/dynamic-content/preview
	 *
	 * Resolves a dynamic content tag in the context of a post.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function preview_tag( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$tag     = sanitize_text_field( (string) $request->get_param( 'tag' ) );
		$post_id = absint( $request->get_param( 'post_id' ) );
		$options = $request->get_param( 'options' );
		$options = is_array( $options ) ? $options : array();

		// Validate tag format: only allow alphanumeric + underscores + hyphens.
		if ( ! preg_match( '/^[a-z0-9_-]+$/', $tag ) ) {
			return $this->error(
				'goblocks_invalid_tag',
				__( 'Invalid tag identifier.', 'goblocks' ),
				400
			);
		}

		$post = $post_id ? get_post( $post_id ) : get_post();

		/**
		 * Filter dynamic content tag preview output.
		 *
		 * TagRegistry hooks into this filter in Step 14 to resolve tags.
		 *
		 * @param string|null  $preview  Resolved preview (null = not handled).
		 * @param string       $tag      Tag identifier.
		 * @param \WP_Post|null $post    Context post.
		 * @param array        $options  Tag options.
		 */
		$preview = apply_filters(
			'goblocks_dynamic_content_preview',
			null,
			$tag,
			$post,
			$options
		);

		if ( null === $preview ) {
			// TagRegistry not yet active or tag unknown — return placeholder.
			$preview = esc_html(
				/* translators: %s: tag name */
				sprintf( __( '[%s]', 'goblocks' ), $tag )
			);
		}

		return $this->success( array( 'preview' => (string) $preview ) );
	}

	/**
	 * GET /goblocks/v1/dynamic-content/tags
	 *
	 * Returns the list of available dynamic content tags.
	 * TagRegistry populates this via filter in Step 14.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_tags(): \WP_REST_Response {
		/**
		 * Filter the list of available dynamic content tags.
		 *
		 * @param array[] $tags Array of tag definition arrays.
		 */
		$tags = apply_filters( 'goblocks_dynamic_content_tags', array() );

		return $this->success( $tags );
	}
}

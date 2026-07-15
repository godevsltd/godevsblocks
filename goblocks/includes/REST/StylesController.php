<?php
/**
 * Styles Controller.
 *
 * @package GoBlocks\REST
 */

namespace GoBlocks\REST;

defined( 'ABSPATH' ) || exit;

use GoBlocks\CSS\CssGenerator;
use GoBlocks\CSS\CssCache;
use GoBlocks\Settings\SettingsStore;

/**
 * REST controller for GoBlocks CSS / style endpoints.
 *
 * Routes:
 *   GET  /goblocks/v1/styles/tokens         → global design token CSS variables
 *   POST /goblocks/v1/styles/regenerate/{id} → regenerate CSS for a single post
 */
class StylesController extends RestController {

	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/styles/tokens',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_tokens' ),
				'permission_callback' => array( $this, 'require_edit_posts' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/styles/regenerate/(?P<post_id>\d+)',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'regenerate_post_css' ),
				'permission_callback' => array( $this, 'require_manage_options' ),
				'args'                => array(
					'post_id' => array(
						'type'              => 'integer',
						'required'          => true,
						'minimum'           => 1,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);
	}

	/**
	 * GET /goblocks/v1/styles/tokens
	 *
	 * Returns the active GoBlocks design tokens as CSS custom property declarations.
	 * The block editor uses this to mirror the frontend token values inside the
	 * iframe preview without a page reload.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_tokens(): \WP_REST_Response {
		$settings = SettingsStore::all();

		$tokens = array(
			'--gb-container-site' => absint( $settings['container_width'] ?? 1200 ) . 'px',
		);

		// Expose user-defined palette colors as --gb-color-{slug}.
		$palette = $settings['global_color_palette'] ?? array();
		if ( is_array( $palette ) ) {
			foreach ( $palette as $entry ) {
				if ( ! is_array( $entry ) ) {
					continue;
				}
				$slug  = sanitize_title( $entry['slug'] ?? '' );
				$color = sanitize_hex_color( (string) ( $entry['color'] ?? '' ) );
				if ( $slug && $color ) {
					$tokens[ '--gb-color-' . $slug ] = $color;
				}
			}
		}

		return $this->success(
			array(
				'tokens' => $tokens,
				'css'    => $this->tokens_to_css( $tokens ),
			)
		);
	}

	/**
	 * POST /goblocks/v1/styles/regenerate/{post_id}
	 *
	 * Collects generatedCss from all GoBlocks blocks in a post and writes a
	 * fresh CSS cache file. Intended for bulk-regenerate admin tooling.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function regenerate_post_css( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$post_id = absint( $request->get_param( 'post_id' ) );
		$post    = get_post( $post_id );

		if ( ! $post instanceof \WP_Post ) {
			return $this->error(
				'goblocks_post_not_found',
				__( 'Post not found.', 'godevs-block-library' ),
				404
			);
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return $this->error(
				'goblocks_forbidden',
				__( 'You do not have permission to edit this post.', 'godevs-block-library' ),
				403
			);
		}

		$css     = CssGenerator::collect_for_post( $post_id );
		$written = $css ? CssCache::write( $post_id, $css ) : false;

		return $this->success(
			array(
				'post_id'  => $post_id,
				'written'  => $written,
				'url'      => CssCache::get_url( $post_id ),
				'byte_len' => strlen( $css ),
			)
		);
	}

	/**
	 * Convert a tokens map to a :root {} CSS string.
	 *
	 * @param  array<string, string> $tokens CSS custom property map.
	 * @return string
	 */
	private function tokens_to_css( array $tokens ): string {
		$declarations = array();

		foreach ( $tokens as $prop => $value ) {
			$declarations[] = esc_attr( $prop ) . ':' . esc_attr( $value );
		}

		return ':root{' . implode( ';', $declarations ) . '}';
	}
}

<?php
/**
 * Patterns Controller.
 *
 * @package GoBlocks\REST
 */

namespace GoBlocks\REST;

defined( 'ABSPATH' ) || exit;

/**
 * REST controller for GoBlocks block patterns.
 *
 * Routes:
 *   GET /goblocks/v1/patterns         → list all registered GoBlocks patterns
 *   GET /goblocks/v1/patterns/{slug}  → get a single pattern by slug
 *
 * Requires edit_posts: pattern content may reveal draft/private post IDs.
 */
class PatternsController extends RestController {

	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/patterns',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_patterns' ),
				'permission_callback' => array( $this, 'require_edit_posts' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/patterns/(?P<slug>[a-z0-9_-]+)',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_pattern' ),
				'permission_callback' => array( $this, 'require_edit_posts' ),
				'args'                => array(
					'slug' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_title',
					),
				),
			)
		);
	}

	/**
	 * GET /goblocks/v1/patterns
	 *
	 * Returns all patterns registered by GoBlocks (category = 'goblocks').
	 *
	 * @return \WP_REST_Response
	 */
	public function get_patterns(): \WP_REST_Response {
		$registry = \WP_Block_Patterns_Registry::get_instance();
		$all      = $registry->get_all_registered();
		$result   = array();

		foreach ( $all as $pattern ) {
			if ( ! $this->is_goblocks_pattern( $pattern ) ) {
				continue;
			}

			$result[] = $this->format_pattern( $pattern ); // Content always included.
		}

		return $this->success( $result );
	}

	/**
	 * GET /goblocks/v1/patterns/{slug}
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_pattern( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$slug     = sanitize_title( (string) $request->get_param( 'slug' ) );
		$registry = \WP_Block_Patterns_Registry::get_instance();

		$pattern = $registry->get_registered( $slug );

		if ( ! $pattern || ! $this->is_goblocks_pattern( $pattern ) ) {
			return $this->error(
				'goblocks_pattern_not_found',
				__( 'Pattern not found.', 'godevs-block-library' ),
				404
			);
		}

		return $this->success( $this->format_pattern( $pattern ) );
	}

	/**
	 * Check whether a pattern belongs to the GoBlocks category.
	 *
	 * @param  array<string, mixed> $pattern Pattern data.
	 * @return bool
	 */
	private function is_goblocks_pattern( array $pattern ): bool {
		$categories = $pattern['categories'] ?? array();
		return in_array( 'goblocks', (array) $categories, true );
	}

	/**
	 * Recursively collect generatedCss from a parsed block tree.
	 *
	 * @param  array<int, array<string, mixed>> $blocks Parsed blocks from parse_blocks().
	 * @return string
	 */
	private function collect_css( array $blocks ): string {
		$css = '';
		foreach ( $blocks as $block ) {
			$block_css = $block['attrs']['generatedCss'] ?? '';
			if ( is_string( $block_css ) && '' !== $block_css ) {
				$css .= $block_css;
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$css .= $this->collect_css( $block['innerBlocks'] );
			}
		}
		return $css;
	}

	/**
	 * Format a pattern for the REST response.
	 *
	 * Content is always included so the admin pattern browser can copy markup
	 * without a second request.
	 *
	 * @param  array<string, mixed> $pattern Raw pattern data.
	 * @return array<string, mixed>
	 */
	private function format_pattern( array $pattern ): array {
		$content = $pattern['content'] ?? '';

		if ( $content ) {
			$css       = $this->collect_css( parse_blocks( $content ) );
			$safe_html = wp_kses_post( do_blocks( $content ) );
			// The <style> is part of the HTML string returned in a REST response
			// for block editor pattern preview iframes — wp_add_inline_style()
			// cannot be used here because this is not a page render context.
			$rendered  = $css
				? '<style>' . wp_strip_all_tags( $css ) . '</style>' . $safe_html
				: $safe_html;
		} else {
			$rendered = '';
		}

		return array(
			'slug'           => $pattern['name'] ?? '',
			'title'          => $pattern['title'] ?? '',
			'description'    => $pattern['description'] ?? '',
			'categories'     => $pattern['categories'] ?? array(),
			'keywords'       => $pattern['keywords'] ?? array(),
			'viewport_width' => (int) ( $pattern['viewportWidth'] ?? 1280 ),
			'inserter'       => (bool) ( $pattern['inserter'] ?? true ),
			'content'        => $content,
			'rendered'       => $rendered,
		);
	}
}

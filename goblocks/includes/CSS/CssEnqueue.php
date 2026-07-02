<?php
/**
 * WordPress hooks and asset enqueue logic for the CSS cache.
 *
 * @package GoBlocks\CSS
 */

namespace GoBlocks\CSS;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Utils\Singleton;

/**
 * Registers all hooks required for the CSS pipeline:
 *
 *   save_post          → regenerate + write CSS file
 *   delete_post        → delete CSS file
 *   wp_enqueue_scripts → enqueue the file or print inline
 */
class CssEnqueue extends Singleton {

	/**
	 * Static cache of post_content parsed-blocks result per request.
	 *
	 * @var array<int, array<int, array<string, mixed>>>
	 */
	private array $block_cache = array();

	/**
	 * Whether we've already printed inline CSS for the current request.
	 *
	 * @var bool
	 */
	private bool $printed_inline = false;

	/**
	 * Register all WordPress hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_base' ), 15 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend' ), 25 );
		add_action( 'save_post', array( $this, 'on_save_post' ), 10, 1 );
		add_action( 'delete_post', array( $this, 'on_delete_post' ), 10, 1 );
	}

	/**
	 * Enqueue the site-wide base stylesheet on all frontend pages.
	 *
	 * This gives pages and posts the same clean design tokens (white
	 * background, typography, spacing) used on the GoBlocks home page,
	 * regardless of whether they contain any GoBlocks blocks.
	 *
	 * @return void
	 */
	public function enqueue_base(): void {
		if ( is_admin() ) {
			return;
		}
		wp_enqueue_style(
			'goblocks-frontend-base',
			GOBLOCKS_URL . 'assets/css/frontend-base.css',
			array(),
			GOBLOCKS_VERSION
		);
		// blocks.css provides all block structural defaults (.gb-group, .gb-column,
		// .gb-timeline, .gb-heading, etc.). Without this, blocks
		// appear invisible on the frontend because generatedCss only overrides
		// defaults — it does not supply them from scratch.
		wp_enqueue_style(
			'goblocks-blocks',
			GOBLOCKS_URL . 'assets/css/blocks.css',
			array( 'goblocks-frontend-base' ),
			GOBLOCKS_VERSION
		);
	}

	/**
	 * Enqueue the per-post CSS file, falling back to inline if the file
	 * hasn't been generated yet or filesystem write failed.
	 *
	 * @return void
	 */
	public function enqueue_frontend(): void {
		if ( ! $this->current_page_has_goblocks() ) {
			return;
		}

		$post_id = get_queried_object_id();

		if ( ! $post_id ) {
			return;
		}

		$css_url = CssCache::get_url( $post_id );
		$hash    = CssCache::get_hash( $post_id );

		if ( $css_url && $hash ) {
			wp_enqueue_style(
				'goblocks-post-' . $post_id,
				$css_url,
				array(),
				$hash
			);
			return;
		}

		// Fallback: generate on the fly and print inline.
		add_action( 'wp_head', array( $this, 'print_inline_css' ), 9 );
	}

	/**
	 * Print CSS inline in <head> as a fallback.
	 *
	 * @return void
	 */
	public function print_inline_css(): void {
		if ( $this->printed_inline ) {
			return;
		}

		$post_id = get_queried_object_id();

		if ( ! $post_id ) {
			return;
		}

		// Use get_queried_object() so preview/revision content is included.
		// get_post_field() reads from the DB and misses unsaved preview changes.
		$queried = get_queried_object();
		if ( $queried instanceof \WP_Post ) {
			$css = CssGenerator::collect_from_blocks( parse_blocks( $queried->post_content ) );
		} else {
			$css = CssGenerator::collect_for_post( $post_id );
		}

		$css = CssGenerator::minify( $css );

		if ( is_rtl() ) {
			$css = CssGenerator::flip_rtl( $css );
		}

		if ( '' !== $css ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo '<style id="goblocks-inline-' . absint( $post_id ) . '">' . $css . '</style>' . "\n";
		}

		$this->printed_inline = true;
	}

	/**
	 * Regenerate and cache CSS when a post is saved.
	 *
	 * @param  int $post_id Saved post ID.
	 * @return void
	 */
	public function on_save_post( int $post_id ): void {
		// Bail on autosave, revisions, or auto-draft.
		if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return;
		}

		$post = get_post( $post_id );
		if ( ! $post || 'auto-draft' === $post->post_status ) {
			return;
		}

		$blocks = parse_blocks( $post->post_content );

		if ( ! $this->blocks_contain_goblocks( $blocks ) ) {
			return;
		}

		$css = CssGenerator::collect_from_blocks( $blocks );
		$css = CssGenerator::minify( $css );

		if ( is_rtl() ) {
			$css = CssGenerator::flip_rtl( $css );
		}

		// If no CSS was collected, delete any stale empty file so the inline
		// fallback (print_inline_css) re-reads live block attributes on every request.
		if ( '' === $css ) {
			CssCache::delete( $post_id );
			return;
		}

		CssCache::write( $post_id, $css );
	}

	/**
	 * Delete CSS cache when a post is deleted.
	 *
	 * @param  int $post_id Deleted post ID.
	 * @return void
	 */
	public function on_delete_post( int $post_id ): void {
		CssCache::delete( $post_id );
	}

	/**
	 * Determine whether the current queried page uses any GoBlocks block.
	 *
	 * Uses a static cache so parse_blocks() only runs once per request.
	 *
	 * @return bool
	 */
	private function current_page_has_goblocks(): bool {
		if ( ! is_singular() && ! is_home() && ! is_archive() ) {
			return false;
		}

		$post_id = get_queried_object_id();

		if ( ! $post_id ) {
			return false;
		}

		if ( ! isset( $this->block_cache[ $post_id ] ) ) {
			// Use get_queried_object() so preview pages (which have revision content
			// injected into the queried post object by WP_Query) are handled correctly.
			// get_post_field() bypasses this replacement and reads the raw DB value.
			$queried = get_queried_object();
			if ( $queried instanceof \WP_Post && $queried->ID === $post_id ) {
				$content = $queried->post_content;
			} else {
				$content = get_post_field( 'post_content', $post_id );
			}
			$this->block_cache[ $post_id ] = parse_blocks( (string) $content );
		}

		return $this->blocks_contain_goblocks( $this->block_cache[ $post_id ] );
	}

	/**
	 * Recursively check whether a block list contains any GoBlocks block.
	 *
	 * @param  array<int, array<string, mixed>> $blocks Parsed blocks.
	 * @return bool
	 */
	private function blocks_contain_goblocks( array $blocks ): bool {
		foreach ( $blocks as $block ) {
			if ( isset( $block['blockName'] ) && str_starts_with( (string) $block['blockName'], 'goblocks/' ) ) {
				return true;
			}
			if ( ! empty( $block['innerBlocks'] ) && $this->blocks_contain_goblocks( $block['innerBlocks'] ) ) {
				return true;
			}
		}
		return false;
	}
}

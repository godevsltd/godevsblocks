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
 * Registers all hooks required for the CSS pipeline.
 *
 * Hooks registered:
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
	 * Parsed blocks from the FSE template content, lazily populated per request.
	 *
	 * @var array<int, array<string, mixed>>|null  null = not yet parsed
	 */
	private ?array $template_block_cache = null;

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
		// FSE template CSS must print before per-post inline CSS (priority 8 vs 9).
		add_action( 'wp_head', array( $this, 'print_template_css' ), 8 );
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
		// blocks.css provides all block structural defaults (.gb-group, .gb-column, etc.).
		// Only enqueue it on pages that actually contain GoBlocks blocks — this avoids.
		// loading ~10 KB of block CSS on every page of the site.
		if ( $this->current_page_has_goblocks() ) {
			wp_enqueue_style(
				'goblocks-blocks',
				GOBLOCKS_URL . 'assets/css/blocks.css',
				array( 'goblocks-frontend-base' ),
				GOBLOCKS_VERSION
			);
		}
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
	 * Print inline CSS for GoBlocks in FSE block-theme templates.
	 *
	 * Classic themes: template markup is assembled via template files, not block
	 * markup, so this method exits immediately.
	 * Block themes: WordPress stores the active template's block HTML in the
	 * $_wp_current_template_content global (set during template_include, before
	 * wp_head fires).  We parse it, collect GoBlocks CSS, and print it inline so
	 * header/footer/global-template blocks are styled even when no post content
	 * is loaded on the page (e.g. 404, search, archive).
	 *
	 * @return void
	 */
	public function print_template_css(): void {
		$blocks = $this->get_template_blocks();
		if ( ! $this->blocks_contain_goblocks( $blocks ) ) {
			return;
		}

		$css = CssGenerator::collect_from_blocks( $blocks );
		$css = CssGenerator::minify( $css );

		if ( is_rtl() ) {
			$css = CssGenerator::flip_rtl( $css );
		}

		if ( '' === $css ) {
			return;
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '<style id="goblocks-template-css">' . $css . '</style>' . "\n";
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

		// If no CSS was collected, delete any stale empty file so the inline.
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
		// Check post content for all standard WP page contexts (404 and search.
		// included — they may have a queried post object via block-theme templates).
		if ( is_singular() || is_home() || is_archive() || is_404() || is_search() ) {
			$post_id = get_queried_object_id();

			if ( $post_id ) {
				if ( ! isset( $this->block_cache[ $post_id ] ) ) {
					// Use get_queried_object() so preview pages (which have revision content.
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

				if ( $this->blocks_contain_goblocks( $this->block_cache[ $post_id ] ) ) {
					return true;
				}
			}
		}

		// Also check the FSE block-theme template (header/footer/global blocks).
		return $this->template_has_goblocks();
	}

	/**
	 * Return parsed blocks for the active FSE template, with a per-request cache.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private function get_template_blocks(): array {
		if ( null !== $this->template_block_cache ) {
			return $this->template_block_cache;
		}

		global $_wp_current_template_content;

		if ( empty( $_wp_current_template_content ) ) {
			$this->template_block_cache = array();
		} else {
			$this->template_block_cache = parse_blocks( $_wp_current_template_content );
		}

		return $this->template_block_cache;
	}

	/**
	 * Return true if the active FSE template contains any GoBlocks block.
	 *
	 * @return bool
	 */
	private function template_has_goblocks(): bool {
		return $this->blocks_contain_goblocks( $this->get_template_blocks() );
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

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
	 * Register all WordPress hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_base' ), 15 );
		// Template CSS must be enqueued before per-post CSS (priority 20 vs 25).
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_template_css' ), 20 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_nav_breakpoint_css' ), 22 );
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

		// Fallback: generate CSS on the fly and attach via wp_add_inline_style().
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

		if ( '' === $css ) {
			return;
		}

		$handle = 'goblocks-inline-' . $post_id;
		wp_register_style( $handle, false, array(), GOBLOCKS_VERSION );
		wp_enqueue_style( $handle );
		wp_add_inline_style( $handle, $css );
	}

	/**
	 * Enqueue CSS for GoBlocks blocks in FSE block-theme templates.
	 *
	 * $_wp_current_template_content is set during template_include (before
	 * wp_enqueue_scripts fires), so the template blocks are available here.
	 * Uses wp_add_inline_style() so WordPress manages the output.
	 *
	 * @return void
	 */
	public function enqueue_template_css(): void {
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

		$handle = 'goblocks-template-css';
		wp_register_style( $handle, false, array(), GOBLOCKS_VERSION );
		wp_enqueue_style( $handle );
		wp_add_inline_style( $handle, $css );
	}

	/**
	 * Pre-enqueue responsive breakpoint CSS for Navigation blocks.
	 *
	 * Navigation blocks with a custom mobileBreakpoint (not the default 768px)
	 * need a per-instance @media rule. Scanning blocks here during
	 * wp_enqueue_scripts lets us use wp_add_inline_style() instead of
	 * outputting a <style> tag inside the render callback.
	 *
	 * @return void
	 */
	public function enqueue_nav_breakpoint_css(): void {
		if ( is_admin() ) {
			return;
		}

		$css = '';

		// Scan post content blocks.
		$post_id = get_queried_object_id();
		if ( $post_id ) {
			$queried = get_queried_object();
			if ( $queried instanceof \WP_Post ) {
				if ( ! isset( $this->block_cache[ $post_id ] ) ) {
					$this->block_cache[ $post_id ] = parse_blocks( $queried->post_content );
				}
				$css .= $this->collect_nav_breakpoint_css( $this->block_cache[ $post_id ] );
			}
		}

		// Scan FSE template blocks (header/footer navigation).
		$css .= $this->collect_nav_breakpoint_css( $this->get_template_blocks() );

		if ( '' === $css ) {
			return;
		}

		$handle = 'goblocks-nav-breakpoints';
		wp_register_style( $handle, false, array(), GOBLOCKS_VERSION );
		wp_enqueue_style( $handle );
		wp_add_inline_style( $handle, $css );
	}

	/**
	 * Recursively collect @media breakpoint CSS for Navigation block instances.
	 *
	 * @param  array<int, array<string, mixed>> $blocks Parsed blocks.
	 * @return string Generated CSS.
	 */
	private function collect_nav_breakpoint_css( array $blocks ): string {
		$css = '';
		foreach ( $blocks as $block ) {
			if ( 'goblocks/navigation' === ( $block['blockName'] ?? '' ) ) {
				$attrs      = $block['attrs'] ?? array();
				$breakpoint = sanitize_text_field( (string) ( $attrs['mobileBreakpoint'] ?? '768px' ) );
				if ( ! preg_match( '/^\d+(px|em|rem)$/', $breakpoint ) ) {
					$breakpoint = '768px';
				}
				if ( '768px' !== $breakpoint ) {
					$uid = preg_replace( '/[^a-z0-9\-]/', '', strtolower( (string) ( $attrs['uniqueId'] ?? '' ) ) );
					$uid = substr( $uid, 0, 32 );
					if ( '' !== $uid ) {
						$sel  = '.gb-navigation-' . $uid;
						$css .= sprintf(
							'@media(max-width:%s){%s .gb-navigation__toggle{display:flex}%s .gb-navigation__menu{display:none;flex-direction:column;width:100%%;padding:.5rem 0;margin-top:.25rem;border-top:1px solid #e2e8f0}%s .gb-navigation__menu.is-open{display:flex}}',
							esc_attr( $breakpoint ),
							$sel,
							$sel,
							$sel
						);
					}
				}
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$css .= $this->collect_nav_breakpoint_css( $block['innerBlocks'] );
			}
		}
		return $css;
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

<?php
/**
 * Table Of Contents.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Table of Contents block — PHP render callback.
 *
 * Outputs a nav placeholder. view.ts builds the actual list in the browser.
 */
class TableOfContents extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'table-of-contents';
	}

	private const ALLOWED_LIST_STYLES = array( 'ordered', 'unordered' );

	/**
	 * Render the block.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @param  string               $content    Inner HTML content.
	 * @param  \WP_Block            $block      Block instance.
	 * @return string               Rendered HTML output.
	 */
	public function render( array $attributes, string $content, WP_Block $block ): string {
		$unique_id = $this->get_unique_id( $attributes );

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			array( 'gb-toc' )
		);

		$title           = isset( $attributes['title'] ) ? sanitize_text_field( $attributes['title'] ) : 'Table of Contents';
		$headings        = isset( $attributes['headings'] ) && is_array( $attributes['headings'] )
			? array_map( 'sanitize_key', $attributes['headings'] ) : array( 'h2', 'h3' );
		$collapsible     = ! empty( $attributes['collapsible'] );
		$start_collapsed = ! empty( $attributes['startCollapsed'] );
		$smooth_scroll   = isset( $attributes['smoothScroll'] ) ? (bool) $attributes['smoothScroll'] : true;
		$scroll_offset   = isset( $attributes['scrollOffset'] ) ? absint( $attributes['scrollOffset'] ) : 80;
		$list_style      = isset( $attributes['listStyle'] ) ? sanitize_key( $attributes['listStyle'] ) : 'ordered';
		$show_back_top   = ! empty( $attributes['showBackToTop'] );
		$link_color      = isset( $attributes['linkColor'] ) ? sanitize_hex_color( (string) $attributes['linkColor'] ) : '';
		$active_color    = isset( $attributes['activeColor'] ) ? sanitize_hex_color( (string) $attributes['activeColor'] ) : '';

		if ( ! in_array( $list_style, self::ALLOWED_LIST_STYLES, true ) ) {
			$list_style = 'ordered';
		}

		if ( $collapsible && $start_collapsed ) {
			$classes .= ' is-collapsed';
		}

		$title_html = $title ? sprintf( '<p class="gb-toc__title">%s</p>', esc_html( $title ) ) : '';

		$inline_vars = '';
		if ( $link_color ) {
			$inline_vars .= '--gb-toc-link:' . $link_color . ';';
		}
		if ( $active_color ) {
			$inline_vars .= '--gb-toc-active:' . $active_color . ';';
		}
		$style_attr = $inline_vars ? ' style="' . esc_attr( $inline_vars ) . '"' : '';

		// Placeholder list — replaced by view.ts at runtime.
		$list_tag  = 'ordered' === $list_style ? 'ol' : 'ul';
		$list_html = sprintf( '<%s class="gb-toc__list"></%s>', $list_tag, $list_tag );

		$back_top_html = $show_back_top
			? sprintf(
				'<a href="#" class="gb-toc__back-top" aria-label="%s">%s</a>',
				esc_attr__( 'Back to top of page', 'goblocks' ),
				esc_html__( '↑ Back to top', 'goblocks' )
			)
			: '';

		$nav_label = $title ? $title : __( 'Page outline', 'goblocks' );

		return sprintf(
			'<nav class="%s" aria-label="%s"%s data-headings="%s" data-collapsible="%s" data-start-collapsed="%s" data-smooth-scroll="%s" data-scroll-offset="%d" data-list-style="%s">%s%s%s</nav>',
			esc_attr( $classes ),
			esc_attr( $nav_label ),
			$style_attr,
			esc_attr( implode( ',', $headings ) ),
			$collapsible ? 'true' : 'false',
			$start_collapsed ? 'true' : 'false',
			$smooth_scroll ? 'true' : 'false',
			$scroll_offset,
			esc_attr( $list_style ),
			$title_html,
			$list_html,
			$back_top_html
		);
	}
}

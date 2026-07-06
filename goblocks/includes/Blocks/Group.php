<?php
/**
 * Group.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Group block — PHP render callback.
 */
class Group extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'group';
	}

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

		$animation_class = isset( $attributes['animationClass'] ) ? sanitize_html_class( $attributes['animationClass'] ) : '';
		$align           = isset( $attributes['align'] ) ? sanitize_key( $attributes['align'] ) : '';

		// WordPress className attribute carries is-style-* when block styles are used.
		$wp_classes = array();
		if ( isset( $attributes['className'] ) && is_string( $attributes['className'] ) && '' !== $attributes['className'] ) {
			$wp_classes = array_filter( array_map( 'sanitize_html_class', explode( ' ', $attributes['className'] ) ) );
		}

		$extra_classes = array_filter(
			array_merge(
				array(
					'gb-group',
					$animation_class,
					$align && in_array( $align, array( 'full', 'wide' ), true ) ? 'align' . $align : '',
				),
				$wp_classes
			)
		);
		$classes       = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			$extra_classes
		);

		$tag_name   = isset( $attributes['tagName'] ) ? sanitize_key( $attributes['tagName'] ) : 'div';
		$aria_label = isset( $attributes['ariaLabel'] ) ? sanitize_text_field( $attributes['ariaLabel'] ) : '';
		$link       = isset( $attributes['link'] ) ? esc_url( $attributes['link'] ) : '';
		$target     = isset( $attributes['linkTarget'] ) ? sanitize_text_field( $attributes['linkTarget'] ) : '_self';
		$rel        = isset( $attributes['linkRel'] ) ? sanitize_text_field( $attributes['linkRel'] ) : '';

		$allowed_tags = array( 'div', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main', 'figure', 'ul', 'ol', 'a', 'form', 'span' );
		if ( ! in_array( $tag_name, $allowed_tags, true ) ) {
			$tag_name = 'div';
		}

		$anchor = isset( $attributes['anchor'] ) && is_string( $attributes['anchor'] )
			? sanitize_text_field( $attributes['anchor'] )
			: '';

		$html_attrs = '';
		if ( $anchor ) {
			$html_attrs .= ' id="' . esc_attr( $anchor ) . '"';
		}
		if ( $aria_label ) {
			$html_attrs .= ' aria-label="' . esc_attr( $aria_label ) . '"';
		}

		// Link attrs when tag is <a>.
		if ( 'a' === $tag_name && $link ) {
			if ( ! in_array( $target, array( '_self', '_blank' ), true ) ) {
				$target = '_self';
			}
			if ( '_blank' === $target ) {
				$rel_parts = array_unique( array_filter( array_merge( array( 'noopener', 'noreferrer' ), explode( ' ', $rel ) ) ) );
				$rel       = implode( ' ', $rel_parts );
			}
			$html_attrs .= sprintf( ' href="%s" target="%s"', esc_url( $link ), esc_attr( $target ) );
			if ( $rel ) {
				$html_attrs .= ' rel="' . esc_attr( $rel ) . '"';
			}
		}

		$html_attrs .= $this->build_html_attrs( $this->get_html_attributes( $attributes ) );

		return sprintf(
			'<%1$s class="%2$s"%3$s>%4$s</%1$s>',
			esc_attr( $tag_name ),
			$classes,
			$html_attrs,
			$content
		);
	}
}

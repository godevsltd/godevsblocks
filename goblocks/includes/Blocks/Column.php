<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

class Column extends BlockBase {

	public function get_name(): string {
		return 'column';
	}

	public function render( array $attributes, string $content, WP_Block $block ): string {
		$unique_id = $this->get_unique_id( $attributes );

		$animation_class = isset( $attributes['animationClass'] ) ? sanitize_html_class( $attributes['animationClass'] ) : '';

		$extra_classes = array_filter( array( 'gb-column', $animation_class ) );
		$classes       = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			$extra_classes
		);

		$tag_name   = isset( $attributes['tagName'] )   ? sanitize_key( $attributes['tagName'] )          : 'div';
		$aria_label = isset( $attributes['ariaLabel'] ) ? sanitize_text_field( $attributes['ariaLabel'] ) : '';

		$allowed_tags = array( 'div', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main', 'figure', 'li', 'span' );
		if ( ! in_array( $tag_name, $allowed_tags, true ) ) {
			$tag_name = 'div';
		}

		$html_attrs  = $aria_label ? ' aria-label="' . esc_attr( $aria_label ) . '"' : '';
		$html_attrs .= $this->build_html_attrs( $this->get_html_attributes( $attributes ) );

		return sprintf(
			'<%1$s class="%2$s"%3$s>%4$s</%1$s>',
			$tag_name,
			$classes,
			$html_attrs,
			$content
		);
	}
}
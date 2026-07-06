<?php
/**
 * Timeline.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Timeline block — PHP render callback.
 */
class Timeline extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'timeline';
	}

	/**
	 * Sanitize a hex color attribute, falling back to a default.
	 *
	 * @param  mixed  $value   Raw attribute value.
	 * @param  string $default Fallback hex color.
	 * @return string          Sanitized hex color.
	 */
	private function safe_color( mixed $value, string $default ): string {
		$sanitized = sanitize_hex_color( (string) ( $value ?? '' ) );
		return $sanitized ? $sanitized : $default;
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
		$unique_id   = $this->get_unique_id( $attributes );
		$layout      = isset( $attributes['layout'] ) ? sanitize_key( $attributes['layout'] ) : 'vertical';
		$alternating = ! empty( $attributes['alternating'] ) && 'vertical' === $layout;
		$line        = $this->safe_color( $attributes['lineColor'] ?? null, '#4f46e5' );

		$allowed_animations = array( 'fade-up', 'slide', 'none' );
		$animation          = isset( $attributes['entranceAnimation'] )
			? sanitize_key( (string) $attributes['entranceAnimation'] )
			: 'fade-up';
		if ( ! in_array( $animation, $allowed_animations, true ) ) {
			$animation = 'fade-up';
		}

		$css_vars = sprintf( '--gb-tl-line-color:%s;', $line );

		$extra_classes = array( 'gb-timeline', "gb-timeline--{$layout}" );
		if ( $alternating ) {
			$extra_classes[] = 'gb-timeline--alternating';
		}

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			$extra_classes
		);

		$data = 'none' !== $animation
			? ' data-animation="' . esc_attr( $animation ) . '"'
			: '';

		return sprintf(
			'<div class="%s" style="%s"%s>%s</div>',
			esc_attr( $classes ),
			esc_attr( $css_vars ),
			$data,
			$content
		);
	}
}

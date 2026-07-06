<?php
/**
 * Counter.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Counter block — PHP render callback.
 */
class Counter extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'counter';
	}

	/**
	 * Sanitize a hex color attribute, falling back to a default.
	 *
	 * @param  mixed  $value   Raw attribute value.
	 * @param  string $default Fallback hex color.
	 * @return string          Sanitized hex color.
	 */
	private function safe_color( mixed $value, string $default ): string {
		return $this->sanitize_color( $value, $default );
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

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			array( 'gb-counter' )
		);

		$target     = isset( $attributes['target'] ) ? floatval( $attributes['target'] ) : 100;
		$start_from = isset( $attributes['startFrom'] ) ? floatval( $attributes['startFrom'] ) : 0;
		$duration   = isset( $attributes['duration'] ) ? intval( $attributes['duration'] ) : 2000;
		$easing     = isset( $attributes['easing'] ) ? sanitize_key( $attributes['easing'] ) : 'ease-out';
		$count_down = ! empty( $attributes['countDown'] );
		$prefix     = isset( $attributes['prefix'] ) ? sanitize_text_field( $attributes['prefix'] ) : '';
		$suffix     = isset( $attributes['suffix'] ) ? sanitize_text_field( $attributes['suffix'] ) : '';
		$label      = isset( $attributes['label'] ) ? sanitize_text_field( $attributes['label'] ) : '';
		$decimals   = isset( $attributes['decimals'] ) ? intval( $attributes['decimals'] ) : 0;
		$separator  = isset( $attributes['separator'] ) ? sanitize_text_field( $attributes['separator'] ) : '';

		$allowed_easings = array( 'linear', 'ease-out', 'ease-in-out', 'spring' );
		if ( ! in_array( $easing, $allowed_easings, true ) ) {
			$easing = 'ease-out';
		}

		$num_color = $this->safe_color( $attributes['numberColor'] ?? null, '#4f46e5' );
		$lbl_color = $this->safe_color( $attributes['labelColor'] ?? null, '#9ca3af' );

		$css_vars = sprintf(
			'--gb-counter-color:%s;--gb-counter-label:%s;',
			$num_color,
			$lbl_color
		);

		// Render the FINAL (target) value so screen readers and no-JS users see.
		// the correct number. The view script resets to startFrom before animating.
		$final_number = number_format( $target, $decimals );

		$label_html = $label
			? '<span class="gb-counter__label">' . esc_html( $label ) . '</span>'
			: '';

		$data  = ' data-target="' . esc_attr( (string) $target ) . '"';
		$data .= ' data-start-from="' . esc_attr( (string) $start_from ) . '"';
		$data .= ' data-duration="' . esc_attr( (string) $duration ) . '"';
		$data .= ' data-easing="' . esc_attr( $easing ) . '"';
		$data .= ' data-prefix="' . esc_attr( $prefix ) . '"';
		$data .= ' data-suffix="' . esc_attr( $suffix ) . '"';
		$data .= ' data-decimals="' . esc_attr( (string) $decimals ) . '"';
		$data .= ' data-separator="' . esc_attr( $separator ) . '"';
		if ( $count_down ) {
			$data .= ' data-count-down="true"';
		}

		return sprintf(
			'<div class="%s" style="%s"%s><span class="gb-counter__number">%s</span>%s</div>',
			esc_attr( $classes ),
			esc_attr( $css_vars ),
			$data,
			esc_html( $prefix . $final_number . $suffix ),
			$label_html
		);
	}
}

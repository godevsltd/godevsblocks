<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Progress Bar block — PHP render callback.
 */
class ProgressBar extends BlockBase {

	public function get_name(): string {
		return 'progress-bar';
	}

	private function safe_color( mixed $value, string $default ): string {
		$sanitized = sanitize_hex_color( (string) ( $value ?? '' ) );
		return $sanitized ?: $default;
	}

	public function render( array $attributes, string $content, WP_Block $block ): string {
		$unique_id = $this->get_unique_id( $attributes );

		$value      = isset( $attributes['value'] )      ? intval( $attributes['value'] )              : 75;
		$value      = max( 0, min( 100, $value ) );
		$label      = isset( $attributes['label'] )      ? sanitize_text_field( $attributes['label'] ) : 'Progress';
		$show_label = ! isset( $attributes['showLabel'] ) || ! empty( $attributes['showLabel'] );
		$show_value = ! isset( $attributes['showValue'] ) || ! empty( $attributes['showValue'] );
		$striped    = ! empty( $attributes['striped'] );
		$bar_height = isset( $attributes['barHeight'] )
			? max( 4, min( 32, intval( $attributes['barHeight'] ) ) )
			: 10;

		$duration = isset( $attributes['duration'] )
			? max( 200, min( 3000, intval( $attributes['duration'] ) ) )
			: 800;

		$allowed_easings = array( 'linear', 'ease-out', 'ease-in-out', 'spring' );
		$easing          = isset( $attributes['easing'] ) ? sanitize_key( $attributes['easing'] ) : 'ease-out';
		if ( ! in_array( $easing, $allowed_easings, true ) ) {
			$easing = 'ease-out';
		}

		$allowed_positions = array( 'top', 'inside', 'bottom' );
		$label_position    = isset( $attributes['labelPosition'] ) ? sanitize_key( $attributes['labelPosition'] ) : 'top';
		if ( ! in_array( $label_position, $allowed_positions, true ) ) {
			$label_position = 'top';
		}

		$fill_color  = $this->safe_color( $attributes['fillColor']  ?? null, '#4f46e5' );
		$fill_color2 = $this->safe_color( $attributes['fillColor2'] ?? null, '#7c3aed' );
		$track_color = $this->safe_color( $attributes['trackColor'] ?? null, '#e5e7eb' );

		$css_vars = sprintf(
			'--gb-bar-fill:%s;--gb-bar-fill2:%s;--gb-bar-track:%s;--gb-bar-height:%dpx;',
			$fill_color,
			$fill_color2,
			$track_color,
			$bar_height
		);

		$extra_classes = array_filter( [
			'gb-progress',
			$striped                     ? 'gb-progress--striped'      : '',
			'inside' === $label_position ? 'gb-progress--label-inside' : '',
			'bottom' === $label_position ? 'gb-progress--label-bottom' : '',
		] );

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			$extra_classes
		);

		$aria_label = $label
			? sprintf( '%s: %d%%', $label, $value )
			: sprintf( '%d%%', $value );

		// Header HTML (label + value spans).
		$label_span  = $show_label ? '<span class="gb-progress__label">' . esc_html( $label ) . '</span>' : '';
		$value_span  = $show_value ? '<span class="gb-progress__value">' . $value . '%</span>'              : '';
		$header_html = ( $show_label || $show_value )
			? '<div class="gb-progress__header">' . $label_span . $value_span . '</div>'
			: '';

		// Fill inner content for inside-label mode.
		$fill_inner = ( 'inside' === $label_position && ( $show_label || $show_value ) )
			? $label_span . $value_span
			: '';

		// Render the fill at its CORRECT target width so no-JS / reduced-motion
		// users see the bar filled to the right level. The view script resets
		// to width:0 and re-applies the animation if motion is allowed.
		$fill = sprintf(
			'<div class="gb-progress__fill" style="width:%d%%" data-width="%d%%" data-duration="%d" data-easing="%s">%s</div>',
			$value,
			$value,
			$duration,
			esc_attr( $easing ),
			$fill_inner
		);

		$track = sprintf(
			'<div class="gb-progress__track" role="progressbar" aria-valuenow="%d" aria-valuemin="0" aria-valuemax="100" aria-label="%s">%s</div>',
			$value,
			esc_attr( $aria_label ),
			$fill
		);

		$before_track = ( 'top'    === $label_position ) ? $header_html : '';
		$after_track  = ( 'bottom' === $label_position ) ? $header_html : '';

		return sprintf(
			'<div class="%s" style="%s">%s%s%s</div>',
			esc_attr( $classes ),
			esc_attr( $css_vars ),
			$before_track,
			$track,
			$after_track
		);
	}
}
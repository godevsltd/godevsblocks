<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Timeline Item block — PHP render callback.
 */
class TimelineItem extends BlockBase {

	public function get_name(): string {
		return 'timeline-item';
	}

	private function safe_color( mixed $value, string $default ): string {
		$sanitized = sanitize_hex_color( (string) ( $value ?? '' ) );
		return $sanitized ?: $default;
	}

	public function render( array $attributes, string $content, WP_Block $block ): string {
		$unique_id = $this->get_unique_id( $attributes );

		$date    = isset( $attributes['date'] )    ? wp_kses_post( $attributes['date'] )    : '';
		$title   = isset( $attributes['title'] )   ? sanitize_text_field( $attributes['title'] ) : '';
		$body    = isset( $attributes['content'] ) ? wp_kses_post( $attributes['content'] ) : '';
		$icon    = isset( $attributes['icon'] )    ? sanitize_text_field( $attributes['icon'] )  : '';

		$dot     = $this->safe_color( $attributes['dotColor']     ?? null, '#4f46e5' );
		$ttl     = $this->safe_color( $attributes['titleColor']   ?? null, '#0f172a' );
		$date_c  = $this->safe_color( $attributes['dateColor']    ?? null, '#4f46e5' );
		$date_bg = $this->safe_color( $attributes['dateBg']       ?? null, '#ede9fe' );
		$cnt     = $this->safe_color( $attributes['contentColor'] ?? null, '#475569' );

		$css_vars = sprintf(
			'--gb-ti-dot:%s;--gb-ti-title:%s;--gb-ti-date:%s;--gb-ti-date-bg:%s;--gb-ti-content:%s;',
			$dot, $ttl, $date_c, $date_bg, $cnt
		);

		$extra_classes = array( 'gb-timeline-item' );
		if ( $icon ) {
			$extra_classes[] = 'gb-timeline-item--has-icon';
		}

		$classes = $this->build_class_string(
			$unique_id ? $this->get_block_class( $unique_id ) : '',
			$this->get_global_classes( $attributes ),
			$extra_classes
		);

		$icon_html = $icon
			? sprintf( '<span class="gb-timeline-item__dot-icon" aria-hidden="true">%s</span>', esc_html( $icon ) )
			: '';

		$dot_html  = sprintf( '<div class="gb-timeline-item__dot">%s</div>', $icon_html );

		$content_html = implode( '', array_filter( array(
			$date  ? sprintf( '<span class="gb-timeline-item__date">%s</span>', $date )            : '',
			$title ? sprintf( '<h3 class="gb-timeline-item__title">%s</h3>', esc_html( $title ) )  : '',
			$body  ? sprintf( '<p class="gb-timeline-item__body">%s</p>', $body )                  : '',
		) ) );

		return sprintf(
			'<div class="%s" style="%s">%s<div class="gb-timeline-item__content">%s</div></div>',
			esc_attr( $classes ),
			esc_attr( $css_vars ),
			$dot_html,
			$content_html
		);
	}
}
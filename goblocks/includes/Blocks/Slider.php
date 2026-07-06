<?php
/**
 * Slider.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Slider block — PHP render callback.
 */
class Slider extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'slider';
	}

	/**
	 * Sanitize a hex or rgba/rgb color value, falling back to a default.
	 *
	 * @param  mixed  $value   Raw attribute value.
	 * @param  string $default Fallback color string.
	 * @return string          Sanitized color value.
	 */
	protected function sanitize_color( mixed $value, string $default = '' ): string {
		$val = trim( (string) ( $value ?? '' ) );
		if ( '' === $val ) {
			return $default;
		}
		// Hex color.
		$hex = sanitize_hex_color( $val );
		if ( $hex ) {
			return $hex;
		}
		// rgba / rgb.
		if ( preg_match( '/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(\s*,\s*[\d.]+)?\s*\)$/', $val ) ) {
			return $val;
		}
		// Keyword "transparent".
		if ( 'transparent' === $val ) {
			return $val;
		}
		return $default;
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

		// ── Effect & Behavior ──────────────────────────────────────────────.
		$effect = sanitize_key( (string) ( $attributes['effect'] ?? 'slide' ) );
		if ( ! in_array( $effect, array( 'slide', 'fade', 'zoom', 'cards' ), true ) ) {
			$effect = 'slide';
		}

		$spv         = max( 1, min( 4, intval( $attributes['slidesPerView'] ?? 1 ) ) );
		$slide_gap   = max( 0, min( 200, intval( $attributes['slideGap'] ?? 0 ) ) );
		$autoplay    = ! empty( $attributes['autoplay'] ) ? 'true' : 'false';
		$delay       = max( 500, intval( $attributes['autoplayDelay'] ?? 3000 ) );
		$loop        = ! empty( $attributes['loop'] ) ? 'true' : 'false';
		$pause_hover = ! isset( $attributes['pauseOnHover'] ) || ! empty( $attributes['pauseOnHover'] ) ? 'true' : 'false';
		$trans_dur   = max( 50, min( 2000, intval( $attributes['transitionDuration'] ?? 450 ) ) );
		$trans_ease  = sanitize_text_field( (string) ( $attributes['transitionEasing'] ?? 'ease' ) );

		// Whitelist easing values to prevent injection.
		$allowed_easings = array(
			'ease',
			'ease-in',
			'ease-out',
			'ease-in-out',
			'linear',
			'cubic-bezier(0.34,1.56,0.64,1)',
			'cubic-bezier(0.25,0.46,0.45,0.94)',
			'cubic-bezier(0.4,0,0.2,1)',
		);
		if ( ! in_array( $trans_ease, $allowed_easings, true ) ) {
			$trans_ease = 'ease';
		}

		// ── Navigation ─────────────────────────────────────────────────────.
		$show_arrows    = ! isset( $attributes['showArrows'] ) || ! empty( $attributes['showArrows'] );
		$show_dots      = ! isset( $attributes['showDots'] ) || ! empty( $attributes['showDots'] );
		$show_counter   = ! empty( $attributes['showCounter'] );
		$show_progress  = ! empty( $attributes['showProgressBar'] ) && 'true' === $autoplay;
		$show_pause_btn = ( ! isset( $attributes['showPauseButton'] ) || ! empty( $attributes['showPauseButton'] ) ) && 'true' === $autoplay;

		// ── Arrow appearance ───────────────────────────────────────────────.
		$arrow_color       = $this->sanitize_color( $attributes['arrowColor'] ?? null, '#ffffff' );
		$arrow_hover_color = $this->sanitize_color( $attributes['arrowHoverColor'] ?? null, '#ffffff' );
		$arrow_bg          = $this->sanitize_color( $attributes['arrowBgColor'] ?? null, 'rgba(0,0,0,0.35)' );
		$arrow_bg_hover    = $this->sanitize_color( $attributes['arrowBgHoverColor'] ?? null, 'rgba(0,0,0,0.65)' );
		$arrow_size        = max( 20, min( 120, intval( $attributes['arrowSize'] ?? 44 ) ) );
		$arrow_radius      = max( 0, min( 50, intval( $attributes['arrowRadius'] ?? 50 ) ) );
		$arrow_position    = sanitize_key( (string) ( $attributes['arrowPosition'] ?? 'inside' ) );
		if ( ! in_array( $arrow_position, array( 'inside', 'outside', 'edge' ), true ) ) {
			$arrow_position = 'inside';
		}
		$arrow_vis = sanitize_key( (string) ( $attributes['arrowVisibility'] ?? 'always' ) );
		if ( ! in_array( $arrow_vis, array( 'always', 'hover' ), true ) ) {
			$arrow_vis = 'always';
		}

		// ── Dot appearance ─────────────────────────────────────────────────.
		$dot_color        = $this->sanitize_color( $attributes['dotColor'] ?? null, 'rgba(255,255,255,0.45)' );
		$dot_active_color = $this->sanitize_color( $attributes['dotActiveColor'] ?? null, '#ffffff' );
		$dot_size         = max( 2, min( 40, intval( $attributes['dotSize'] ?? 8 ) ) );
		$dot_style        = sanitize_key( (string) ( $attributes['dotStyle'] ?? 'pill' ) );
		$dot_position     = sanitize_key( (string) ( $attributes['dotPosition'] ?? 'inside-bottom' ) );
		if ( ! in_array( $dot_style, array( 'pill', 'circle', 'square', 'line' ), true ) ) {
			$dot_style = 'pill';
		}
		if ( ! in_array( $dot_position, array( 'inside-bottom', 'inside-top', 'outside-bottom', 'outside-top' ), true ) ) {
			$dot_position = 'inside-bottom';
		}

		// ── CSS custom properties ──────────────────────────────────────────.
		$css_vars = sprintf(
			'--gb-sl-arrow-color:%s;--gb-sl-arrow-hover:%s;--gb-sl-arrow-bg:%s;--gb-sl-arrow-bg-hover:%s;--gb-sl-arrow-size:%dpx;--gb-sl-arrow-r:%d%%;--gb-sl-dot:%s;--gb-sl-dot-active:%s;--gb-sl-dot-size:%dpx;--gb-sl-dur:%dms;',
			$arrow_color,
			$arrow_hover_color,
			$arrow_bg,
			$arrow_bg_hover,
			$arrow_size,
			$arrow_radius,
			$dot_color,
			$dot_active_color,
			$dot_size,
			$trans_dur
		);
		if ( $spv > 1 ) {
			$css_vars .= '--gb-spv:' . $spv . ';';
		}
		if ( $slide_gap > 0 ) {
			$css_vars .= '--gb-sl-gap:' . $slide_gap . 'px;';
		}

		// ── Classes ────────────────────────────────────────────────────────.
		$extra_classes = array( 'gb-slider', 'gb-slider--' . $effect );
		if ( $show_arrows ) {
			$extra_classes[] = 'gb-slider--arrows-' . $arrow_position;
			if ( 'hover' === $arrow_vis ) {
				$extra_classes[] = 'gb-slider--arrow-vis-hover';
			}
		}
		if ( $show_dots ) {
			$extra_classes[] = 'gb-slider--dots-' . $dot_position;
			$extra_classes[] = 'gb-slider--dot-style-' . $dot_style;
		}

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			$extra_classes
		);

		// ── Icons ──────────────────────────────────────────────────────────.
		$icon_prev = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
		$icon_next = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

		$arrows_html = $show_arrows
			? '<button class="gb-slider__prev" aria-label="' . esc_attr__( 'Previous', 'goblocks' ) . '" type="button">' . $icon_prev . '</button>'
				. '<button class="gb-slider__next" aria-label="' . esc_attr__( 'Next', 'goblocks' ) . '" type="button">' . $icon_next . '</button>'
			: '';

		$dots_html = $show_dots ? '<div class="gb-slider__dots" aria-hidden="true"></div>' : '';

		$counter_html = $show_counter
			? '<div class="gb-slider__counter" aria-hidden="true"><span class="gb-slider__counter-current">1</span><span class="gb-slider__counter-sep"> / </span><span class="gb-slider__counter-total">1</span></div>'
			: '';

		$progress_html = $show_progress
			? '<div class="gb-slider__progress" aria-hidden="true"><div class="gb-slider__progress-bar"></div></div>'
			: '';

		$icon_pause = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
		$icon_play  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3l14 9-14 9V3z"/></svg>';

		$pause_btn_html = $show_pause_btn
			? sprintf(
				'<button class="gb-slider__pause" type="button" aria-label="%1$s" aria-pressed="false">' .
					'<span class="gb-slider__pause-icon gb-slider__pause-icon--pause">%2$s</span>' .
					'<span class="gb-slider__pause-icon gb-slider__pause-icon--play">%3$s</span>' .
				'</button>',
				esc_attr__( 'Pause slideshow', 'goblocks' ),
				$icon_pause,
				$icon_play
			)
			: '';

		// ── Output ─────────────────────────────────────────────────────────.
		return sprintf(
			'<div class="%s" style="%s" data-effect="%s" data-spv="%d" data-gap="%d" data-autoplay="%s" data-delay="%d" data-loop="%s" data-pause-hover="%s" data-duration="%d" data-easing="%s">'
				. '<div class="gb-slider__clip"><div class="gb-slider__track">%s</div></div>'
				. '%s%s%s%s%s'
			. '</div>',
			esc_attr( $classes ),
			esc_attr( $css_vars ),
			esc_attr( $effect ),
			$spv,
			$slide_gap,
			$autoplay,
			$delay,
			$loop,
			$pause_hover,
			$trans_dur,
			esc_attr( $trans_ease ),
			$content,
			$arrows_html,
			$dots_html,
			$counter_html,
			$progress_html,
			$pause_btn_html
		);
	}
}

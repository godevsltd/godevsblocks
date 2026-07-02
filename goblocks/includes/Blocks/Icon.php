<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Utils\SvgSanitizer;

/**
 * Icon block — PHP render callback.
 *
 * Supports: icon color/hover, background shape, CSS animations (load/hover/scroll trigger).
 */
class Icon extends BlockBase {

	public function get_name(): string {
		return 'icon';
	}

	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$svg_raw = (string) ( $attributes['svgContent'] ?? '' );
		if ( '' === trim( $svg_raw ) ) return '';

		$svg = SvgSanitizer::sanitize( $svg_raw );
		if ( '' === $svg ) return '';

		$unique_id = $this->get_unique_id( $attributes );

		// ── Colors ────────────────────────────────────────────────────────────
		$icon_color      = isset( $attributes['iconColor'] )      ? sanitize_hex_color( (string) $attributes['iconColor'] )      : '';
		$icon_hover      = isset( $attributes['iconHoverColor'] )  ? sanitize_hex_color( (string) $attributes['iconHoverColor'] ) : '';

		// ── Background shape ──────────────────────────────────────────────────
		$icon_bg        = sanitize_key( (string) ( $attributes['iconBg'] ?? 'none' ) );
		$icon_bg_color  = isset( $attributes['iconBgColor'] )      ? sanitize_hex_color( (string) $attributes['iconBgColor'] )      : '';
		$icon_bg_hover  = isset( $attributes['iconBgHoverColor'] ) ? sanitize_hex_color( (string) $attributes['iconBgHoverColor'] ) : '';
		$icon_bg_pad    = isset( $attributes['iconBgPadding'] )    ? absint( $attributes['iconBgPadding'] )                         : 16;

		if ( ! in_array( $icon_bg, array( 'none', 'circle', 'square', 'rounded' ), true ) ) {
			$icon_bg = 'none';
		}

		// ── Animation ─────────────────────────────────────────────────────────
		$animation    = sanitize_key( (string) ( $attributes['animation']           ?? 'none' ) );
		$anim_trigger = sanitize_key( (string) ( $attributes['animationTrigger']    ?? 'load' ) );
		$anim_dur     = floatval( $attributes['animationDuration']  ?? 1 );
		$anim_delay   = floatval( $attributes['animationDelay']     ?? 0 );
		$anim_iter    = sanitize_text_field( (string) ( $attributes['animationIterations'] ?? '1' ) );

		if ( ! in_array( $animation, array( 'none', 'spin', 'pulse', 'bounce', 'tada', 'swing', 'shake' ), true ) ) {
			$animation = 'none';
		}
		if ( ! in_array( $anim_trigger, array( 'load', 'hover', 'scroll' ), true ) ) {
			$anim_trigger = 'load';
		}
		if ( ! in_array( $anim_iter, array( '1', '2', '3', 'infinite' ), true ) ) {
			$anim_iter = '1';
		}

		// ── Classes ───────────────────────────────────────────────────────────
		$classes_extra = array( 'gb-icon' );
		if ( 'none' !== $icon_bg )    $classes_extra[] = 'gb-icon--bg-' . $icon_bg;
		if ( 'none' !== $animation )  $classes_extra[] = 'gb-icon--anim-' . $animation;
		if ( 'none' !== $animation && 'load' !== $anim_trigger ) {
			$classes_extra[] = 'gb-icon--trigger-' . $anim_trigger;
		}

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			$classes_extra
		);

		// ── CSS custom properties (inline style) ──────────────────────────────
		$css_vars = '';
		if ( $icon_color )   $css_vars .= '--gb-icon-color:' . $icon_color . ';';
		if ( $icon_hover )   $css_vars .= '--gb-icon-hover:' . $icon_hover . ';';
		if ( $icon_bg_color ) $css_vars .= '--gb-icon-bg:' . $icon_bg_color . ';';
		if ( $icon_bg_hover ) $css_vars .= '--gb-icon-bg-hover:' . $icon_bg_hover . ';';
		if ( 'none' !== $icon_bg ) $css_vars .= '--gb-icon-bg-pad:' . $icon_bg_pad . 'px;';
		if ( 'none' !== $animation ) {
			$css_vars .= '--gb-anim-dur:'   . esc_attr( (string) $anim_dur )   . 's;';
			$css_vars .= '--gb-anim-delay:' . esc_attr( (string) $anim_delay ) . 's;';
			$css_vars .= '--gb-anim-iter:'  . esc_attr( $anim_iter )           . ';';
		}
		$style_attr = $css_vars ? ' style="' . esc_attr( $css_vars ) . '"' : '';

		// ── Accessibility ─────────────────────────────────────────────────────
		$aria_hidden = (bool) ( $attributes['ariaHidden'] ?? true );
		$aria_label  = sanitize_text_field( (string) ( $attributes['ariaLabel'] ?? '' ) );
		$link        = (string) ( $attributes['link'] ?? '' );

		$has_link_label = $link && ! $aria_hidden && $aria_label;

		$icon_attrs = '';
		if ( $aria_hidden || $has_link_label ) {
			$icon_attrs .= ' aria-hidden="true"';
		} elseif ( $aria_label ) {
			$icon_attrs .= ' aria-label="' . esc_attr( $aria_label ) . '" role="img"';
		}

		$inner = '<span class="gb-icon__svg"' . $icon_attrs . '>' . $svg . '</span>';

		if ( $link ) {
			$target = sanitize_text_field( (string) ( $attributes['linkTarget'] ?? '_self' ) );
			if ( ! in_array( $target, array( '_self', '_blank' ), true ) ) $target = '_self';

			$rel = sanitize_text_field( (string) ( $attributes['linkRel'] ?? '' ) );
			if ( '_blank' === $target ) {
				$rel_parts = array_unique( array_filter( array_merge( array( 'noopener', 'noreferrer' ), explode( ' ', $rel ) ) ) );
				$rel       = implode( ' ', $rel_parts );
			}

			$link_attrs = sprintf( ' href="%s" target="%s"%s', esc_url( $link ), esc_attr( $target ), $rel ? ' rel="' . esc_attr( $rel ) . '"' : '' );
			if ( $has_link_label ) $link_attrs .= ' aria-label="' . esc_attr( $aria_label ) . '"';

			$inner = '<a class="gb-icon__link"' . $link_attrs . '>' . $inner . '</a>';
		}

		return sprintf( '<div class="%s"%s>%s</div>', $classes, $style_attr, $inner );
	}
}
<?php
/**
 * Flip Card.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Flip Card block — PHP render callback.
 */
class FlipCard extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'flip-card';
	}

	private const ALLOWED_DIRECTIONS = array( 'horizontal', 'vertical' );

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
			array( 'gb-flip-card' )
		);

		$front_title    = isset( $attributes['frontTitle'] ) ? sanitize_text_field( $attributes['frontTitle'] ) : 'Front Side';
		$front_content  = isset( $attributes['frontContent'] ) ? sanitize_text_field( $attributes['frontContent'] ) : '';
		$front_icon     = isset( $attributes['frontIcon'] ) ? sanitize_text_field( $attributes['frontIcon'] ) : '';
		$back_title     = isset( $attributes['backTitle'] ) ? sanitize_text_field( $attributes['backTitle'] ) : 'Back Side';
		$back_content   = isset( $attributes['backContent'] ) ? sanitize_text_field( $attributes['backContent'] ) : '';
		$back_icon      = isset( $attributes['backIcon'] ) ? sanitize_text_field( $attributes['backIcon'] ) : '';
		$back_link_url  = isset( $attributes['backLinkUrl'] ) ? esc_url_raw( $attributes['backLinkUrl'] ) : '';
		$back_link_text = isset( $attributes['backLinkText'] ) ? sanitize_text_field( $attributes['backLinkText'] ) : '';
		$direction      = isset( $attributes['flipDirection'] ) ? sanitize_key( $attributes['flipDirection'] ) : 'horizontal';
		$on_click       = ! empty( $attributes['triggerOnClick'] );

		if ( ! in_array( $direction, self::ALLOWED_DIRECTIONS, true ) ) {
			$direction = 'horizontal';
		}

		// Front face.
		$front_icon_html = $front_icon
			? sprintf( '<span class="gb-flip-card__icon" aria-hidden="true">%s</span>', esc_html( $front_icon ) )
			: '';

		$front_html = sprintf(
			'<div class="gb-flip-card__front">%s<h3 class="gb-flip-card__title">%s</h3><p class="gb-flip-card__content">%s</p></div>',
			$front_icon_html,
			esc_html( $front_title ),
			esc_html( $front_content )
		);

		// Back face.
		$back_icon_html = $back_icon
			? sprintf( '<span class="gb-flip-card__icon" aria-hidden="true">%s</span>', esc_html( $back_icon ) )
			: '';

		$cta_html = ( $back_link_url && $back_link_text )
			? sprintf( '<a class="gb-flip-card__cta" href="%s">%s</a>', esc_url( $back_link_url ), esc_html( $back_link_text ) )
			: '';

		$back_html = sprintf(
			'<div class="gb-flip-card__back">%s<h3 class="gb-flip-card__title">%s</h3><p class="gb-flip-card__content">%s</p>%s</div>',
			$back_icon_html,
			esc_html( $back_title ),
			esc_html( $back_content ),
			$cta_html
		);

		// ARIA label for click-trigger keyboard users.
		$aria_label = $on_click
			? sprintf( ' data-aria-label="%s"', esc_attr__( 'Flip card — press to reveal the back side', 'godevs-block-library' ) )
			: '';

		return sprintf(
			'<div class="%s" data-direction="%s" data-trigger="%s"%s><div class="gb-flip-card__inner">%s%s</div></div>',
			esc_attr( $classes ),
			esc_attr( $direction ),
			$on_click ? 'click' : 'hover',
			$aria_label,
			$front_html,
			$back_html
		);
	}
}

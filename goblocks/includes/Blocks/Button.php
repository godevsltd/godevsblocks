<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Utils\SvgSanitizer;

/**
 * Button block — PHP render callback.
 *
 * Renders an <a> or <button> element with an inner .gb-button__text span.
 * The span structure reserves space for before/after icon slots (Step 13).
 */
class Button extends BlockBase {

	/**
	 * Allowed button type values for <button> elements.
	 *
	 * @var string[]
	 */
	private const BUTTON_TYPES = array( 'button', 'submit', 'reset' );

	/**
	 * Allowed kses tags for button label (rich text with bold/italic only).
	 *
	 * @var array<string, array<string, bool>>
	 */
	private const TEXT_KSES = array(
		'strong' => array(),
		'em'     => array(),
		'span'   => array(),
		'br'     => array(),
	);

	/**
	 * Block slug (without namespace prefix).
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'button';
	}

	/**
	 * Render the Button block.
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 * @param string               $content    Inner blocks HTML (unused).
	 * @param \WP_Block            $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$unique_id = $this->get_unique_id( $attributes );

		$tag_name       = $this->get_tag_name( $attributes, 'a' );
		$block_class    = $this->get_block_class( $unique_id );   // gb-button-{uniqueId}
		$global_classes = $this->get_global_classes( $attributes );
		$classes        = $this->build_class_string( $block_class, $global_classes, array( 'gb-button' ) );
		$html_attrs     = $this->build_html_attrs( $this->get_html_attributes( $attributes ) );

		// Element-specific attributes.
		$element_attrs = ( 'a' === $tag_name )
			? $this->build_link_attrs( $attributes )
			: $this->build_button_attrs( $attributes );

		// ARIA label.
		$aria_label = sanitize_text_field( (string) ( $attributes['ariaLabel'] ?? '' ) );
		if ( $aria_label ) {
			$element_attrs .= ' aria-label="' . esc_attr( $aria_label ) . '"';
		}

		// Button label — allow bold/italic only.
		$text = wp_kses( (string) ( $attributes['text'] ?? '' ), self::TEXT_KSES );

		if ( '' === $text ) {
			return '';
		}

		// Icon support.
		$icon_slug     = sanitize_key( (string) ( $attributes['iconSlug'] ?? '' ) );
		$icon_svg_raw  = (string) ( $attributes['iconSvg'] ?? '' );
		$icon_position = in_array( (string) ( $attributes['iconPosition'] ?? 'before' ), array( 'before', 'after' ), true )
			? (string) ( $attributes['iconPosition'] ?? 'before' )
			: 'before';
		$icon_size     = sanitize_text_field( (string) ( $attributes['iconSize'] ?? '1em' ) );

		$icon_html = '';
		if ( $icon_slug && $icon_svg_raw ) {
			$icon_inner_safe = SvgSanitizer::sanitize_inner( $icon_svg_raw );
			if ( $icon_inner_safe ) {
				$svg_open  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"'
					. ' width="' . esc_attr( $icon_size ) . '"'
					. ' height="' . esc_attr( $icon_size ) . '"'
					. ' fill="none" stroke="currentColor"'
					. ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
					. ' aria-hidden="true">';
				$icon_html = '<span class="gb-button__icon gb-button__icon--' . esc_attr( $icon_position ) . '">'
					. $svg_open . $icon_inner_safe . '</svg>'
					. '</span>';
			}
		}

		$before_icon = ( $icon_html && 'before' === $icon_position ) ? $icon_html : '';
		$after_icon  = ( $icon_html && 'after' === $icon_position )  ? $icon_html : '';

		$inner = $before_icon
			. '<span class="gb-button__text">' . $text . '</span>'
			. $after_icon;

		return sprintf(
			'<%1$s class="%2$s"%3$s%4$s>%5$s</%1$s>',
			esc_attr( $tag_name ),
			$classes,
			$html_attrs,
			$element_attrs,
			$inner
		);
	}

	/**
	 * Build link-specific attributes (href, target, rel, download).
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 * @return string Attribute fragment with leading space.
	 */
	private function build_link_attrs( array $attributes ): string {
		$href   = esc_url( (string) ( $attributes['href'] ?? '' ) );
		$target = (string) ( $attributes['target'] ?? '_self' );
		$rel    = sanitize_text_field( (string) ( $attributes['rel'] ?? '' ) );

		if ( ! in_array( $target, array( '_self', '_blank' ), true ) ) {
			$target = '_self';
		}

		if ( '_blank' === $target ) {
			$rel_parts = array_unique(
				array_filter(
					array_merge( array( 'noopener', 'noreferrer' ), explode( ' ', $rel ) )
				)
			);
			$rel       = implode( ' ', $rel_parts );
		}

		$attrs = '';

		if ( $href ) {
			$attrs .= ' href="' . $href . '"';
		}

		$attrs .= ' target="' . esc_attr( $target ) . '"';

		if ( $rel ) {
			$attrs .= ' rel="' . esc_attr( $rel ) . '"';
		}

		if ( ! empty( $attributes['download'] ) && true === $attributes['download'] ) {
			$attrs .= ' download';
		}

		return $attrs;
	}

	/**
	 * Build button-specific attributes (type).
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 * @return string Attribute fragment with leading space.
	 */
	private function build_button_attrs( array $attributes ): string {
		$type = (string) ( $attributes['buttonType'] ?? 'button' );

		if ( ! in_array( $type, self::BUTTON_TYPES, true ) ) {
			$type = 'button';
		}

		return ' type="' . esc_attr( $type ) . '"';
	}
}

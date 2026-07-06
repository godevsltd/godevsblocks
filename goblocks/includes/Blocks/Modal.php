<?php
/**
 * Modal.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Modal block — PHP render callback.
 *
 * Supports animation variants (fade/slide-up/zoom), auto-open with delay,
 * and cookie-based "don't show again" dismissal.
 */
class Modal extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'modal';
	}

	private const ALLOWED_ANIMATIONS = array( 'fade', 'slide-up', 'zoom' );
	private const ALLOWED_TRIGGERS   = array( 'button', 'link' );

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
			array( 'gb-modal' )
		);

		$trigger_text    = isset( $attributes['triggerText'] ) ? sanitize_text_field( $attributes['triggerText'] ) : 'Open Modal';
		$trigger_type    = isset( $attributes['triggerType'] ) ? sanitize_key( $attributes['triggerType'] ) : 'button';
		$close_overlay   = ! isset( $attributes['closeOnOverlay'] ) || ! empty( $attributes['closeOnOverlay'] ) ? 'true' : 'false';
		$close_escape    = ! isset( $attributes['closeOnEscape'] ) || ! empty( $attributes['closeOnEscape'] ) ? 'true' : 'false';
		$animation       = isset( $attributes['animation'] ) ? sanitize_key( $attributes['animation'] ) : 'fade';
		$auto_open       = ! empty( $attributes['autoOpen'] ) ? 'true' : 'false';
		$auto_open_delay = isset( $attributes['autoOpenDelay'] ) ? max( 0, intval( $attributes['autoOpenDelay'] ) ) : 2000;
		$cookie_name     = isset( $attributes['cookieName'] ) ? sanitize_key( $attributes['cookieName'] ) : '';
		$cookie_days     = isset( $attributes['cookieDays'] ) ? max( 1, intval( $attributes['cookieDays'] ) ) : 30;
		$show_dismiss    = ! empty( $attributes['showDismissBtn'] );

		if ( ! in_array( $trigger_type, self::ALLOWED_TRIGGERS, true ) ) {
			$trigger_type = 'button';
		}
		if ( ! in_array( $animation, self::ALLOWED_ANIMATIONS, true ) ) {
			$animation = 'fade';
		}

		// data-* attributes for view.ts.
		$data_attrs = sprintf(
			' data-close-overlay="%s" data-close-escape="%s" data-animation="%s" data-auto-open="%s" data-auto-open-delay="%d"',
			esc_attr( $close_overlay ),
			esc_attr( $close_escape ),
			esc_attr( $animation ),
			esc_attr( $auto_open ),
			$auto_open_delay
		);

		if ( '' !== $cookie_name ) {
			$data_attrs .= sprintf(
				' data-cookie-name="%s" data-cookie-days="%d"',
				esc_attr( $cookie_name ),
				$cookie_days
			);
		}

		$trigger_aria = esc_attr( $trigger_text );
		$trigger      = 'button' === $trigger_type
			? sprintf( '<button class="gb-modal__trigger" aria-label="%s" aria-haspopup="dialog">%s</button>', $trigger_aria, esc_html( $trigger_text ) )
			: sprintf( '<a class="gb-modal__trigger" href="#modal" aria-label="%s" aria-haspopup="dialog">%s</a>', $trigger_aria, esc_html( $trigger_text ) );

		$dismiss_html = $show_dismiss
			? sprintf( '<div class="gb-modal__footer"><button type="button" class="gb-modal__dismiss">%s</button></div>', esc_html__( 'Don\'t show again', 'goblocks' ) )
			: '';

		$extra_html_attrs = $this->build_html_attrs( $this->get_html_attributes( $attributes ) );

		return sprintf(
			'<div class="%s"%s%s>%s<div class="gb-modal__overlay" hidden aria-hidden="true"><div class="gb-modal__dialog" role="dialog" aria-modal="true" aria-label="%s" tabindex="-1"><button class="gb-modal__close" aria-label="%s">&times;</button><div class="gb-modal__content">%s</div>%s</div></div></div>',
			esc_attr( $classes ),
			$data_attrs,
			$extra_html_attrs,
			$trigger,
			esc_attr( $trigger_text ),
			esc_attr__( 'Close', 'goblocks' ),
			$content,
			$dismiss_html
		);
	}
}

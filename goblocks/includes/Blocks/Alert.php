<?php
/**
 * Alert.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Alert block — PHP render callback.
 */
class Alert extends BlockBase {

	/** Allowed HTML in the message body. */
	private const MESSAGE_KSES = array(
		'strong' => array(),
		'em'     => array(),
		'b'      => array(),
		'i'      => array(),
		'br'     => array(),
		'a'      => array(
			'href'   => true,
			'target' => true,
			'rel'    => true,
			'title'  => true,
		),
		'span'   => array( 'class' => true ),
	);

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'alert';
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
		$unique_id    = $this->get_unique_id( $attributes );
		$alert_type   = isset( $attributes['alertType'] ) ? sanitize_key( (string) $attributes['alertType'] ) : 'info';
		$alert_style  = isset( $attributes['alertStyle'] ) ? sanitize_key( (string) $attributes['alertStyle'] ) : 'filled';
		$title        = isset( $attributes['title'] ) ? sanitize_text_field( (string) $attributes['title'] ) : '';
		$message      = isset( $attributes['message'] ) ? wp_kses( (string) $attributes['message'], self::MESSAGE_KSES ) : '';
		$dismissible  = ! empty( $attributes['dismissible'] );
		$dismiss_mode = isset( $attributes['dismissMode'] ) ? sanitize_key( (string) $attributes['dismissMode'] ) : 'none';
		$dismiss_days = isset( $attributes['dismissDays'] ) ? absint( $attributes['dismissDays'] ) : 30;
		$show_icon    = ! isset( $attributes['icon'] ) || ! empty( $attributes['icon'] );
		$sticky       = ! empty( $attributes['sticky'] );

		if ( ! in_array( $alert_type, array( 'info', 'success', 'warning', 'error' ), true ) ) {
			$alert_type = 'info';
		}
		if ( ! in_array( $alert_style, array( 'filled', 'outline', 'banner' ), true ) ) {
			$alert_style = 'filled';
		}
		if ( ! in_array( $dismiss_mode, array( 'none', 'session', 'local', 'cookie' ), true ) ) {
			$dismiss_mode = 'none';
		}

		$extra_classes = array( 'gb-alert', 'gb-alert--' . $alert_type, 'gb-alert--style-' . $alert_style );
		if ( $sticky ) {
			$extra_classes[] = 'gb-alert--sticky';
		}

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			$extra_classes
		);

		// Data attributes for JS dismiss persistence.
		$data = '';
		if ( $dismissible && 'none' !== $dismiss_mode ) {
			$dismiss_key = 'gb_alert_' . $unique_id;
			$data       .= ' data-dismiss-key="' . esc_attr( $dismiss_key ) . '"';
			$data       .= ' data-dismiss-mode="' . esc_attr( $dismiss_mode ) . '"';
			if ( 'cookie' === $dismiss_mode ) {
				$data .= ' data-dismiss-days="' . esc_attr( (string) $dismiss_days ) . '"';
			}
		}

		$icons = array(
			'info'    => '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>',
			'success' => '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9,12 11,14 15,10"/></svg>',
			'warning' => '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>',
			'error'   => '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
		);

		$dismiss_svg = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="3" x2="17" y2="17"/><line x1="17" y1="3" x2="3" y2="17"/></svg>';

		$icon_html    = $show_icon && isset( $icons[ $alert_type ] )
			? '<div class="gb-alert__icon" aria-hidden="true">' . $icons[ $alert_type ] . '</div>'
			: '';
		$title_html   = $title ? '<strong class="gb-alert__title">' . esc_html( $title ) . '</strong>' : '';
		$message_html = $message ? '<p class="gb-alert__message">' . $message . '</p>' : '';
		$dismiss_html = $dismissible
			? '<button class="gb-alert__dismiss" aria-label="' . esc_attr__( 'Dismiss', 'goblocks' ) . '">' . $dismiss_svg . '</button>'
			: '';

		return sprintf(
			'<div class="%s" role="alert"%s>%s<div class="gb-alert__body">%s%s</div>%s</div>',
			esc_attr( $classes ),
			$data,
			$icon_html,
			$title_html,
			$message_html,
			$dismiss_html
		);
	}
}

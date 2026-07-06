<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Lottie Animation block — PHP render callback.
 *
 * Uses the @lottiefiles/lottie-player web component loaded from CDN.
 * Supports trigger modes: auto, hover, scroll-into-view, click.
 */
class Lottie extends BlockBase {

	const LOTTIE_CDN = 'https://unpkg.com/@lottiefiles/lottie-player@2/dist/lottie-player.js';

	public function get_name(): string {
		return 'lottie';
	}

	public function render( array $attributes, string $content, WP_Block $block ): string {
		$unique_id = $this->get_unique_id( $attributes );

		$src       = isset( $attributes['src'] ) ? esc_url_raw( (string) $attributes['src'] ) : '';
		$loop      = ! isset( $attributes['loop'] ) || ! empty( $attributes['loop'] );
		$speed     = isset( $attributes['speed'] ) ? floatval( $attributes['speed'] ) : 1.0;
		$trigger   = isset( $attributes['trigger'] ) ? sanitize_key( $attributes['trigger'] ) : 'auto';
		$direction = isset( $attributes['direction'] ) ? intval( $attributes['direction'] ) : 1;
		$renderer  = isset( $attributes['renderer'] ) ? sanitize_key( $attributes['renderer'] ) : 'svg';

		if ( ! $src ) {
			return '';
		}

		if ( ! in_array( $trigger, array( 'auto', 'hover', 'scroll', 'click' ), true ) ) {
			$trigger = 'auto';
		}
		if ( ! in_array( $renderer, array( 'svg', 'canvas' ), true ) ) {
			$renderer = 'svg';
		}
		if ( ! in_array( $direction, array( 1, -1 ), true ) ) {
			$direction = 1;
		}

		// Enqueue lottie-player CDN once per page.
		if ( ! wp_script_is( 'lottie-player', 'enqueued' ) ) {
			wp_enqueue_script(
				'lottie-player',
				self::LOTTIE_CDN,
				array(),
				null, // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
				array(
					'strategy'  => 'defer',
					'in_footer' => true,
				)
			);
		}

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			array( 'gb-lottie' )
		);

		// Build lottie-player attributes.
		$player_attrs  = ' src="' . esc_url( $src ) . '"';
		$player_attrs .= ' renderer="' . esc_attr( $renderer ) . '"';
		$player_attrs .= ' speed="' . esc_attr( (string) $speed ) . '"';
		$player_attrs .= ' direction="' . esc_attr( (string) $direction ) . '"';
		if ( $loop ) {
			$player_attrs .= ' loop';
		}
		if ( 'auto' === $trigger ) {
			$player_attrs .= ' autoplay';
		}

		return sprintf(
			'<div class="%s" data-trigger="%s"><lottie-player%s style="width:100%%;height:100%%"></lottie-player></div>',
			esc_attr( $classes ),
			esc_attr( $trigger ),
			$player_attrs
		);
	}
}

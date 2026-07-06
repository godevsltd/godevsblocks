<?php
/**
 * Countdown.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Countdown block — PHP render callback.
 */
class Countdown extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'countdown';
	}

	/**
	 * Check whether a string is a valid IANA timezone identifier.
	 *
	 * @param  string $tz Timezone string to validate.
	 * @return bool       True if the timezone is valid.
	 */
	private function is_valid_timezone( string $tz ): bool {
		try {
			new \DateTimeZone( $tz );
			return true;
		} catch ( \Exception $e ) {
			return false;
		}
	}

	/**
	 * Sanitize a hex color attribute, falling back to a default.
	 *
	 * @param  mixed  $value   Raw attribute value.
	 * @param  string $default Fallback hex color.
	 * @return string          Sanitized hex color.
	 */
	private function safe_color( mixed $value, string $default ): string {
		$sanitized = sanitize_hex_color( (string) ( $value ?? '' ) );
		return $sanitized ? $sanitized : $default;
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
			array( 'gb-countdown' )
		);

		$raw_date       = sanitize_text_field( (string) ( $attributes['targetDate'] ?? '' ) );
		$target_date    = preg_match( '/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/', $raw_date ) ? $raw_date : '';
		$timezone       = sanitize_text_field( (string) ( $attributes['timezone'] ?? '' ) );
		$cd_style       = sanitize_key( (string) ( $attributes['countdownStyle'] ?? 'card' ) );
		$show_separator = ! empty( $attributes['showSeparator'] );
		$expired_action = sanitize_key( (string) ( $attributes['expiredAction'] ?? 'message' ) );
		$expired_text   = sanitize_text_field( (string) ( $attributes['expiredText'] ?? "Time's up!" ) );
		$expired_url    = esc_url( (string) ( $attributes['expiredUrl'] ?? '' ) );
		$show_days      = ! isset( $attributes['showDays'] ) || ! empty( $attributes['showDays'] );
		$show_hours     = ! isset( $attributes['showHours'] ) || ! empty( $attributes['showHours'] );
		$show_minutes   = ! isset( $attributes['showMinutes'] ) || ! empty( $attributes['showMinutes'] );
		$show_seconds   = ! isset( $attributes['showSeconds'] ) || ! empty( $attributes['showSeconds'] );

		if ( ! in_array( $cd_style, array( 'card', 'flat', 'bold' ), true ) ) {
			$cd_style = 'card';
		}
		if ( ! in_array( $expired_action, array( 'message', 'redirect', 'hide' ), true ) ) {
			$expired_action = 'message';
		}

		// Validate timezone: must be a valid IANA identifier.
		if ( $timezone && ! $this->is_valid_timezone( $timezone ) ) {
			$timezone = '';
		}

		$num_color = $this->safe_color( $attributes['numberColor'] ?? null, '#4f46e5' );
		$lbl_color = $this->safe_color( $attributes['labelColor'] ?? null, '#9ca3af' );
		$bg_color  = $this->safe_color( $attributes['unitBg'] ?? null, '#ffffff' );
		$bd_color  = $this->safe_color( $attributes['unitBorder'] ?? null, '#e2e8f0' );

		$css_vars = sprintf(
			'--gb-cd-color:%s;--gb-cd-label:%s;--gb-cd-bg:%s;--gb-cd-border:%s;',
			$num_color,
			$lbl_color,
			$bg_color,
			$bd_color
		);

		// Build extra classes.
		$extra_classes = array( 'gb-countdown', 'gb-countdown--style-' . $cd_style );
		if ( $show_separator ) {
			$extra_classes[] = 'gb-countdown--sep';
		}
		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			$extra_classes
		);

		// Assemble visible units, stripping trailing separator.
		$ordered = array(
			array(
				'show'  => $show_days,
				'key'   => 'days',
				'label' => __( 'Days', 'goblocks' ),
			),
			array(
				'show'  => $show_hours,
				'key'   => 'hours',
				'label' => __( 'Hours', 'goblocks' ),
			),
			array(
				'show'  => $show_minutes,
				'key'   => 'minutes',
				'label' => __( 'Minutes', 'goblocks' ),
			),
			array(
				'show'  => $show_seconds,
				'key'   => 'seconds',
				'label' => __( 'Seconds', 'goblocks' ),
			),
		);
		$visible = array_values( array_filter( $ordered, fn( $u ) => $u['show'] ) );

		$units = '';
		foreach ( $visible as $idx => $u ) {
			$is_last = ( count( $visible ) - 1 === $idx );
			$units  .= '<div class="gb-countdown__unit gb-countdown__' . $u['key'] . '">'
				. '<span class="gb-countdown__number">00</span>'
				. '<span class="gb-countdown__label">' . esc_html( $u['label'] ) . '</span>'
				. '</div>';
			if ( $show_separator && ! $is_last ) {
				$units .= '<span class="gb-countdown__sep" aria-hidden="true">:</span>';
			}
		}

		// Data attributes for the view script.
		$data  = ' data-target="' . esc_attr( $target_date ) . '"';
		$data .= ' data-expired="' . esc_attr( $expired_text ) . '"';
		$data .= ' data-expired-action="' . esc_attr( $expired_action ) . '"';
		if ( $timezone ) {
			$data .= ' data-tz="' . esc_attr( $timezone ) . '"';
		}
		if ( 'redirect' === $expired_action && $expired_url ) {
			$data .= ' data-expired-url="' . esc_attr( $expired_url ) . '"';
		}

		return sprintf(
			'<div class="%s" style="%s" role="timer" aria-label="%s"%s>%s</div>',
			esc_attr( $classes ),
			esc_attr( $css_vars ),
			esc_attr( __( 'Countdown timer', 'goblocks' ) ),
			$data,
			$units
		);
	}
}

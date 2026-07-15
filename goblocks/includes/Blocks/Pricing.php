<?php
/**
 * Pricing.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Pricing Card block — PHP render callback.
 *
 * Supports monthly/annual pricing toggle, feature prefixes (- excluded, * highlighted),
 * and a featured badge.
 */
class Pricing extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'pricing';
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
	 * Render a single price row.
	 *
	 * @param  string $currency    Currency symbol.
	 * @param  string $amount      Price amount string.
	 * @param  string $period      Billing period label.
	 * @param  string $extra_class Additional CSS class.
	 * @return string              HTML markup for the price row.
	 */
	private function price_html( string $currency, string $amount, string $period, string $extra_class = '' ): string {
		$class = trim( 'gb-pricing__price ' . $extra_class );
		return sprintf(
			'<div class="%s"><span class="gb-pricing__currency">%s</span><span class="gb-pricing__amount">%s</span><span class="gb-pricing__period">%s</span></div>',
			esc_attr( $class ),
			esc_html( $currency ),
			esc_html( $amount ),
			esc_html( $period )
		);
	}

	/**
	 * Build a single feature list item.
	 *
	 * Line prefix rules: `-` excluded (gray x), `*` highlighted (accent bold), none normal (green check).
	 *
	 * @param  string $raw Raw feature string (may include `-` or `*` prefix).
	 * @return string      HTML list item markup.
	 */
	private function feature_html( string $raw ): string {
		$raw  = sanitize_text_field( $raw );
		$type = 'normal';
		$text = $raw;

		if ( str_starts_with( $raw, '-' ) ) {
			$type = 'excluded';
			$text = ltrim( substr( $raw, 1 ) );
		} elseif ( str_starts_with( $raw, '*' ) ) {
			$type = 'highlight';
			$text = ltrim( substr( $raw, 1 ) );
		}

		$li_class    = 'gb-pricing__feature' . ( 'normal' !== $type ? " gb-pricing__feature--{$type}" : '' );
		$check_class = 'gb-pricing__check' . ( 'excluded' === $type ? ' gb-pricing__check--x' : '' );
		$inner       = 'highlight' === $type
			? '<strong>' . esc_html( $text ) . '</strong>'
			: esc_html( $text );

		return sprintf(
			'<li class="%s"><span class="%s" aria-hidden="true"></span>%s</li>',
			esc_attr( $li_class ),
			esc_attr( $check_class ),
			$inner
		);
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

		$featured = ! empty( $attributes['featured'] );

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			array_filter( array( 'gb-pricing', $featured ? 'gb-pricing--featured' : '' ) )
		);

		$plan_name      = isset( $attributes['planName'] ) ? sanitize_text_field( $attributes['planName'] ) : 'Pro Plan';
		$price          = isset( $attributes['price'] ) ? sanitize_text_field( $attributes['price'] ) : '29';
		$period         = isset( $attributes['period'] ) ? sanitize_text_field( $attributes['period'] ) : '/month';
		$currency       = isset( $attributes['currency'] ) ? sanitize_text_field( $attributes['currency'] ) : '$';
		$description    = isset( $attributes['description'] ) ? sanitize_text_field( $attributes['description'] ) : '';
		$features       = isset( $attributes['features'] ) && is_array( $attributes['features'] ) ? $attributes['features'] : array();
		$cta_text       = isset( $attributes['ctaText'] ) ? sanitize_text_field( $attributes['ctaText'] ) : 'Get Started';
		$cta_url        = isset( $attributes['ctaUrl'] ) ? esc_url( $attributes['ctaUrl'] ) : '#';
		$featured_label = isset( $attributes['featuredLabel'] ) ? sanitize_text_field( $attributes['featuredLabel'] ) : 'Most Popular';
		$price_alt      = isset( $attributes['priceAlt'] ) ? sanitize_text_field( $attributes['priceAlt'] ) : '';
		$period_alt     = isset( $attributes['periodAlt'] ) ? sanitize_text_field( $attributes['periodAlt'] ) : '/yr';
		$savings_label  = isset( $attributes['savingsLabel'] ) ? sanitize_text_field( $attributes['savingsLabel'] ) : '';

		// Colors.
		$accent   = $this->safe_color( $attributes['accentColor'] ?? null, '#4f46e5' );
		$btn_text = $this->safe_color( $attributes['btnTextColor'] ?? null, '#ffffff' );
		$heading  = $this->safe_color( $attributes['headingColor'] ?? null, '#0f172a' );
		$text     = $this->safe_color( $attributes['textColor'] ?? null, '#374151' );
		$check    = $this->safe_color( $attributes['checkColor'] ?? null, '#059669' );
		$bg       = $this->safe_color( $attributes['cardBg'] ?? null, '#ffffff' );

		$css_vars = sprintf(
			'--gb-pc-accent:%s;--gb-pc-btn-text:%s;--gb-pc-heading:%s;--gb-pc-text:%s;--gb-pc-check:%s;--gb-pc-bg:%s;',
			$accent,
			$btn_text,
			$heading,
			$text,
			$check,
			$bg
		);

		$animate = ! isset( $attributes['animateOnScroll'] ) || ! empty( $attributes['animateOnScroll'] );

		// data-* for view.ts toggle injection.
		$data_attrs = '';
		if ( $animate ) {
			$data_attrs .= ' data-animate="true"';
		}
		if ( '' !== $price_alt ) {
			$data_attrs .= ' data-price-alt="1"';
			if ( '' !== $savings_label ) {
				$data_attrs .= sprintf( ' data-savings-label="%s"', esc_attr( $savings_label ) );
			}
		}

		// Badge.
		$badge = $featured
			? sprintf( '<div class="gb-pricing__badge">%s</div>', esc_html( $featured_label ) )
			: '';

		// Price row(s): dual when annual pricing is configured.
		$price_html = '' !== $price_alt
			? $this->price_html( $currency, $price, $period, 'gb-pricing__price--monthly' )
				. $this->price_html( $currency, $price_alt, $period_alt, 'gb-pricing__price--annual' )
			: $this->price_html( $currency, $price, $period );

		// Features list.
		$features_html = '';
		foreach ( $features as $feature ) {
			$features_html .= $this->feature_html( (string) $feature );
		}

		$desc_html = $description
			? sprintf( '<p class="gb-pricing__desc">%s</p>', esc_html( $description ) )
			: '';

		return sprintf(
			'<div class="%s" style="%s"%s>' .
				'%s' .
				'<div class="gb-pricing__accent-bar"></div>' .
				'<div class="gb-pricing__header">' .
					'<div class="gb-pricing__plan-label">%s</div>' .
					'<h3 class="gb-pricing__name">%s</h3>' .
					'%s' .
					'%s' .
				'</div>' .
				'<div class="gb-pricing__divider"></div>' .
				'<ul class="gb-pricing__features">%s</ul>' .
				'<div class="gb-pricing__footer">' .
					'<a class="gb-pricing__cta" href="%s">%s</a>' .
				'</div>' .
			'</div>',
			esc_attr( $classes ),
			esc_attr( $css_vars ),
			$data_attrs,
			$badge,
			esc_html__( 'Plan', 'godevs-block-library' ),
			esc_html( $plan_name ),
			$price_html,
			$desc_html,
			$features_html,
			$cta_url,
			esc_html( $cta_text )
		);
	}
}

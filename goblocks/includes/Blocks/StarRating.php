<?php
/**
 * Star Rating.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Star Rating block — PHP render callback.
 *
 * Outputs star SVGs, optional review count, and JSON-LD AggregateRating schema.
 */
class StarRating extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'star-rating';
	}

	private const STAR_POLYGON = '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26';

	/**
	 * Build a single star span element.
	 *
	 * @param  string $type Star type: 'full', 'half', or 'empty'.
	 * @return string       HTML span element.
	 */
	private function star_span( string $type ): string {
		$poly = '<polygon points="' . self::STAR_POLYGON . '"/>';

		if ( 'half' === $type ) {
			$bg = '<svg class="gb-star__svg gb-star__bg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' . $poly . '</svg>';
			$fg = '<svg class="gb-star__svg gb-star__fg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' . $poly . '</svg>';
			return '<span class="gb-star gb-star--half">' . $bg . $fg . '</span>';
		}

		$fill = 'full' === $type ? 'currentColor' : 'none';
		$svg  = '<svg class="gb-star__svg" viewBox="0 0 24 24" fill="' . $fill . '" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' . $poly . '</svg>';
		return '<span class="gb-star gb-star--' . $type . '">' . $svg . '</span>';
	}

	/**
	 * Build the schema.org JSON-LD markup for star ratings.
	 *
	 * @param  float  $rating       Numeric rating value.
	 * @param  int    $max_rating   Maximum rating value.
	 * @param  int    $review_count Number of reviews.
	 * @param  string $item_name    Rated item name; falls back to post title.
	 * @return string               JSON-LD script tag.
	 */
	private function build_schema( float $rating, int $max_rating, int $review_count, string $item_name ): string {
		$post_title  = (string) get_the_title();
		$schema_name = '' !== $item_name ? $item_name : ( '' !== $post_title ? $post_title : '' );
		$schema      = array(
			'@context'        => 'https://schema.org',
			'@type'           => 'Product',
			'name'            => $schema_name,
			'aggregateRating' => array(
				'@type'       => 'AggregateRating',
				'ratingValue' => (string) $rating,
				'bestRating'  => (string) $max_rating,
				'worstRating' => '1',
				'reviewCount' => (string) $review_count,
			),
		);

		return '<script type="application/ld+json">'
			. wp_json_encode( $schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES )
			. '</script>';
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

		$rating         = isset( $attributes['rating'] ) ? floatval( $attributes['rating'] ) : 4.5;
		$max_rating     = isset( $attributes['maxRating'] ) ? max( 1, intval( $attributes['maxRating'] ) ) : 5;
		$show_num       = ! isset( $attributes['showNumber'] ) || ! empty( $attributes['showNumber'] );
		$label          = isset( $attributes['label'] ) ? sanitize_text_field( $attributes['label'] ) : '';
		$review_count   = isset( $attributes['reviewCount'] ) ? max( 1, intval( $attributes['reviewCount'] ) ) : 1;
		$show_count     = ! empty( $attributes['showCount'] );
		$schema_enabled = ! isset( $attributes['schemaEnabled'] ) || ! empty( $attributes['schemaEnabled'] );
		$item_name      = isset( $attributes['itemName'] ) ? sanitize_text_field( $attributes['itemName'] ) : '';

		$star_hex    = sanitize_hex_color( $attributes['starColor'] ?? '#f59e0b' );
		$star_color  = $star_hex ? $star_hex : '#f59e0b';
		$empty_hex   = sanitize_hex_color( $attributes['emptyColor'] ?? '#d1d5db' );
		$empty_color = $empty_hex ? $empty_hex : '#d1d5db';
		$star_size   = max( 12, min( 64, intval( $attributes['starSize'] ?? 22 ) ) );

		$css_vars = sprintf(
			'--gb-star-color:%s;--gb-star-empty:%s;--gb-star-size:%dpx;',
			$star_color,
			$empty_color,
			$star_size
		);

		$animate = ! isset( $attributes['animateOnScroll'] ) || ! empty( $attributes['animateOnScroll'] );

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			array( 'gb-star-rating' )
		);

		// Build star spans.
		$stars_html = '';
		for ( $i = 1; $i <= $max_rating; $i++ ) {
			if ( $i <= floor( $rating ) ) {
				$type = 'full';
			} elseif ( $i - 0.5 <= $rating ) {
				$type = 'half';
			} else {
				$type = 'empty';
			}
			$stars_html .= $this->star_span( $type );
		}

		$label_html  = $label ? '<span class="gb-star-rating__label">' . esc_html( $label ) . '</span>' : '';
		$number_html = $show_num ? '<span class="gb-star-rating__number">' . esc_html( (string) $rating ) . '/' . $max_rating . '</span>' : '';

		$count_text = sprintf(
			/* translators: %d: number of reviews */
			_n( '(%d review)', '(%d reviews)', $review_count, 'goblocks' ),
			$review_count
		);
		$count_html = $show_count ? '<span class="gb-star-rating__count">' . esc_html( $count_text ) . '</span>' : '';

		$schema_html = ( $schema_enabled && $review_count >= 1 )
			? $this->build_schema( $rating, $max_rating, $review_count, $item_name )
			: '';

		$aria_label = sprintf( '%s out of %d stars', $rating, $max_rating );

		$data_animate = $animate ? ' data-animate="true"' : '';

		return sprintf(
			'%s<div class="%s" style="%s"%s>%s<div class="gb-star-rating__stars" role="img" aria-label="%s">%s</div>%s%s</div>',
			$schema_html,
			esc_attr( $classes ),
			esc_attr( $css_vars ),
			$data_animate,
			$label_html,
			esc_attr( $aria_label ),
			$stars_html,
			$number_html,
			$count_html
		);
	}
}

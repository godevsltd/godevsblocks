<?php
/**
 * Accordion Item.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * Accordion Item block — PHP render callback.
 *
 * Renders a native <details>/<summary> element.
 * When the parent Accordion has FAQ schema enabled, the item receives the
 * schema.org/Question markup via block context.
 */
class AccordionItem extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'accordion-item';
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
	 * @param  string               $content    Inner blocks HTML (the answer).
	 * @param  \WP_Block            $block      Block instance (context from Accordion).
	 * @return string               HTML output.
	 */
	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$unique_id      = $this->get_unique_id( $attributes );
		$block_class    = $this->get_block_class( $unique_id );
		$global_classes = $this->get_global_classes( $attributes );
		$question       = wp_strip_all_tags( (string) ( $attributes['question'] ?? '' ) );
		$is_open        = ! empty( $attributes['isOpen'] );
		$faq_schema     = ! empty( $block->context['goblocks/accordionFaqSchema'] );

		$hdr_color  = $this->safe_color( $attributes['headerColor'] ?? null, '#111827' );
		$hdr_bg     = $this->safe_color( $attributes['headerBg'] ?? null, '#ffffff' );
		$cnt_color  = $this->safe_color( $attributes['contentColor'] ?? null, '#374151' );
		$icon_style = sanitize_key( (string) ( $attributes['iconStyle'] ?? 'chevron' ) );
		if ( ! in_array( $icon_style, array( 'chevron', 'plus', 'arrow', 'none' ), true ) ) {
			$icon_style = 'chevron';
		}

		$css_vars = sprintf(
			'--gb-ai-header-color:%s;--gb-ai-header-bg:%s;--gb-ai-content-color:%s;',
			$hdr_color,
			$hdr_bg,
			$cnt_color
		);

		$classes = $this->build_class_string(
			$block_class,
			$global_classes,
			array( 'gb-accordion-item', 'gb-accordion-item--icon-' . $icon_style )
		);

		// FAQ schema attribute fragments.
		$schema_item = $faq_schema
			? ' itemscope itemprop="mainEntity" itemtype="https://schema.org/Question"'
			: '';
		$schema_name = $faq_schema ? ' itemprop="name"' : '';
		$schema_ans  = $faq_schema
			? ' itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"'
			: '';
		$schema_text = $faq_schema ? ' itemprop="text"' : '';

		$summary_label = $question ? ' aria-label="' . esc_attr( $question ) . '"' : '';

		return sprintf(
			'<details class="%s" style="%s"%s%s>' .
				'<summary class="gb-accordion-item__trigger"%s%s>' .
					'<span class="gb-accordion-item__question">%s</span>' .
					'<span class="gb-accordion-item__icon" aria-hidden="true"></span>' .
				'</summary>' .
				'<div class="gb-accordion-item__content"%s>' .
					'<div%s>%s</div>' .
				'</div>' .
			'</details>',
			$classes,
			esc_attr( $css_vars ),
			$is_open ? ' open' : '',
			$schema_item,
			$schema_name,
			$summary_label,
			esc_html( $question ),
			$schema_ans,
			$schema_text,
			$content
		);
	}
}

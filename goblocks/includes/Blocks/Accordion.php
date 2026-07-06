<?php
/**
 * Accordion.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * Accordion block — PHP render callback.
 *
 * Renders a container div with data attributes for the view script.
 * FAQ schema markup is added when enableFaqSchema is true.
 * Inner block content (AccordionItem elements) comes pre-rendered via $content.
 */
class Accordion extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'accordion';
	}

	/**
	 * Render the block.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @param  string               $content    Inner blocks HTML (accordion items).
	 * @param  \WP_Block            $block      Block instance.
	 * @return string               HTML output.
	 */
	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$unique_id      = $this->get_unique_id( $attributes );
		$block_class    = $this->get_block_class( $unique_id );
		$global_classes = $this->get_global_classes( $attributes );
		$enable_schema  = ! empty( $attributes['enableFaqSchema'] );
		$allow_multiple = ! isset( $attributes['allowMultiple'] ) || ! empty( $attributes['allowMultiple'] );

		$classes = $this->build_class_string(
			$block_class,
			$global_classes,
			array( 'gb-accordion' )
		);

		$schema_attrs     = $enable_schema ? ' itemscope itemtype="https://schema.org/FAQPage"' : '';
		$extra_html_attrs = $this->build_html_attrs( $this->get_html_attributes( $attributes ) );

		return sprintf(
			'<div class="%s" data-allow-multiple="%s"%s%s>%s</div>',
			$classes,
			$allow_multiple ? 'true' : 'false',
			$schema_attrs,
			$extra_html_attrs,
			$content
		);
	}
}

<?php
/**
 * Query.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * Query block — PHP render callback.
 *
 * Acts as a thin container: it provides context (queryId, query, paginationType,
 * layout) to child blocks via block.json "providesContext". The actual WP_Query
 * is run by the QueryLoop child block.
 */
class Query extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'query';
	}

	/**
	 * Render the Query wrapper.
	 *
	 * $content is already the rendered output of the inner blocks
	 * (QueryLoop + Pagination) which have already executed their queries.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @param  string               $content    Inner blocks HTML.
	 * @param  \WP_Block            $block      Block instance.
	 * @return string
	 */
	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$unique_id      = $this->get_unique_id( $attributes );
		$block_class    = $unique_id ? $this->get_block_class( $unique_id ) : '';
		$global_classes = $this->get_global_classes( $attributes );

		$extra = array( 'gb-query' );

		// Alignment class (wide / full).
		$align = trim( (string) ( $attributes['align'] ?? '' ) );
		if ( in_array( $align, array( 'wide', 'full' ), true ) ) {
			$extra[] = 'align' . $align;
		}

		// Layout type class.
		$layout      = (array) ( $attributes['layout'] ?? array() );
		$layout_type = (string) ( $layout['type'] ?? 'grid' );
		if ( 'list' === $layout_type ) {
			$extra[] = 'gb-query--list';
		} else {
			$extra[] = 'gb-query--grid';
		}

		$classes    = $this->build_class_string( $block_class ? $block_class : 'gb-query', $global_classes, $extra );
		$html_attrs = $this->build_html_attrs( $this->get_html_attributes( $attributes ) );

		return sprintf(
			'<div class="%s"%s>%s</div>',
			$classes,
			$html_attrs,
			$content
		);
	}
}

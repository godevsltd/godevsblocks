<?php
/**
 * Tabs.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * Tabs block — PHP render callback.
 *
 * Iterates inner tab-panel blocks to build the tablist + panels markup.
 * The pre-rendered $content is intentionally ignored; each inner block is
 * rendered manually so context (tabsId, tabIndex) can be injected per-panel.
 */
class Tabs extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'tabs';
	}

	/**
	 * Render the block.
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 * @param string               $content    Pre-rendered inner blocks (not used).
	 * @param \WP_Block            $block      Block instance with inner_blocks.
	 * @return string HTML output.
	 */
	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$unique_id      = $this->get_unique_id( $attributes );
		$block_class    = $this->get_block_class( $unique_id );
		$global_classes = $this->get_global_classes( $attributes );
		$orientation    = $this->sanitize_orientation( (string) ( $attributes['orientation'] ?? 'horizontal' ) );
		$default_tab    = absint( $attributes['defaultTab'] ?? 0 );
		$tab_style      = sanitize_key( (string) ( $attributes['tabStyle'] ?? 'pill' ) );
		$full_width     = ! empty( $attributes['tabsFullWidth'] );

		if ( ! in_array( $tab_style, array( 'pill', 'underline', 'bordered', 'boxed' ), true ) ) {
			$tab_style = 'pill';
		}

		$extra = array( 'gb-tabs', 'gb-tabs--' . $orientation, 'gb-tabs--style-' . $tab_style );
		if ( $full_width ) {
			$extra[] = 'gb-tabs--full-width';
		}

		$classes = $this->build_class_string( $block_class, $global_classes, $extra );

		$tabs_html   = '';
		$panels_html = '';

		foreach ( $block->inner_blocks as $idx => $inner_block ) {
			$panel_attrs = $inner_block->parsed_block['attrs'] ?? array();
			/* translators: %d: 1-based tab number used as fallback label */
			$label    = sanitize_text_field( (string) ( $panel_attrs['label'] ?? sprintf( __( 'Tab %d', 'goblocks' ), $idx + 1 ) ) );
			$tab_id   = 'tab-' . $unique_id . '-' . $idx;
			$panel_id = 'panel-' . $unique_id . '-' . $idx;
			$active   = ( $idx === $default_tab );

			$tabs_html .= sprintf(
				'<button role="tab" id="%s" aria-controls="%s" aria-selected="%s" tabindex="%s" class="gb-tabs__button%s">%s</button>',
				esc_attr( $tab_id ),
				esc_attr( $panel_id ),
				$active ? 'true' : 'false',
				$active ? '0' : '-1',
				$active ? ' is-active' : '',
				esc_html( $label )
			);

			// Build the panel wrapper directly in Tabs.php instead of post-processing.
			// the rendered HTML from TabPanel.php with fragile regex substitutions.
			$panel_unique_id  = sanitize_key( (string) ( $panel_attrs['uniqueId'] ?? '' ) );
			$panel_base_class = $panel_unique_id ? 'gb-tab-panel-' . $panel_unique_id : 'gb-tab-panel';
			$panel_extra      = array_filter( array( 'gb-tab-panel', $active ? 'is-active' : '' ) );
			$panel_classes    = $this->build_class_string(
				$panel_base_class,
				$this->get_global_classes( $panel_attrs ),
				$panel_extra
			);

			// Render the panel's own inner blocks, bypassing TabPanel's outer wrapper.
			$panel_content = '';
			foreach ( $inner_block->inner_blocks as $panel_child ) {
				$panel_content .= $panel_child->render();
			}

			$panels_html .= sprintf(
				'<div role="tabpanel" id="%s" aria-labelledby="%s" class="%s"%s><div class="gb-tab-panel__content">%s</div></div>',
				esc_attr( $panel_id ),
				esc_attr( $tab_id ),
				$panel_classes,
				$active ? '' : ' hidden',
				$panel_content
			);
		}

		return sprintf(
			'<div class="%s" data-orientation="%s"><div role="tablist" class="gb-tabs__tablist" aria-orientation="%s">%s</div><div class="gb-tabs__panels">%s</div></div>',
			$classes,
			esc_attr( $orientation ),
			esc_attr( $orientation ),
			$tabs_html,
			$panels_html
		);
	}

	/**
	 * Sanitize the orientation attribute value.
	 *
	 * @param  string $orientation Raw value.
	 * @return string              'horizontal' or 'vertical'.
	 */
	private function sanitize_orientation( string $orientation ): string {
		return in_array( $orientation, array( 'horizontal', 'vertical' ), true )
			? $orientation
			: 'horizontal';
	}
}

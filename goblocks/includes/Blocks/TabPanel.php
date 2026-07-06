<?php
/**
 * Tab Panel.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * Tab Panel block — PHP render callback.
 *
 * Renders a single ARIA tabpanel. The parent Tabs block injects the
 * context values (tabsId, tabIndex, tabActive) before calling render().
 * Active panel is shown; others have the `hidden` attribute so they are
 * display:none without JavaScript, and the view script toggles them.
 */
class TabPanel extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'tab-panel';
	}

	/**
	 * Render the block.
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 * @param string               $content    Inner blocks HTML.
	 * @param \WP_Block            $block      Block instance (context provided by Tabs).
	 * @return string HTML output.
	 */
	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$tabs_id = sanitize_key( (string) ( $block->context['goblocks/tabsId'] ?? '' ) );
		$idx     = absint( $block->context['goblocks/tabIndex'] ?? 0 );
		$active  = ! empty( $block->context['goblocks/tabActive'] );

		$panel_id = 'panel-' . $tabs_id . '-' . $idx;
		$tab_id   = 'tab-' . $tabs_id . '-' . $idx;

		$unique_id      = $this->get_unique_id( $attributes );
		$block_class    = $unique_id ? $this->get_block_class( $unique_id ) : '';
		$global_classes = $this->get_global_classes( $attributes );
		$extra          = array( 'gb-tab-panel' );
		if ( $active ) {
			$extra[] = 'is-active';
		}
		$classes = $this->build_class_string( $block_class ? $block_class : 'gb-tab-panel', $global_classes, $extra );

		return sprintf(
			'<div role="tabpanel" id="%s" aria-labelledby="%s" class="%s"%s><div class="gb-tab-panel__content">%s</div></div>',
			esc_attr( $panel_id ),
			esc_attr( $tab_id ),
			$classes,
			$active ? '' : ' hidden',
			$content
		);
	}
}

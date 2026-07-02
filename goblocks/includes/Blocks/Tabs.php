<?php
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
	 * @return string
	 */
	public function get_name(): string {
		return 'tabs';
	}

	/**
	 * @param array<string, mixed> $attributes Block attributes.
	 * @param string               $content    Pre-rendered inner blocks (not used).
	 * @param \WP_Block            $block      Block instance with inner_blocks.
	 * @return string HTML output.
	 */
	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$unique_id = $this->get_unique_id( $attributes );
		$block_class    = $this->get_block_class( $unique_id );
		$global_classes = $this->get_global_classes( $attributes );
		$orientation  = $this->sanitize_orientation( (string) ( $attributes['orientation'] ?? 'horizontal' ) );
		$default_tab  = absint( $attributes['defaultTab'] ?? 0 );
		$tab_style    = sanitize_key( (string) ( $attributes['tabStyle'] ?? 'pill' ) );
		$full_width   = ! empty( $attributes['tabsFullWidth'] );

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
			$label       = sanitize_text_field( (string) ( $panel_attrs['label'] ?? sprintf( __( 'Tab %d', 'goblocks' ), $idx + 1 ) ) );
			$tab_id      = 'tab-' . $unique_id . '-' . $idx;
			$panel_id    = 'panel-' . $unique_id . '-' . $idx;
			$active      = ( $idx === $default_tab );

			$tabs_html .= sprintf(
				'<button role="tab" id="%s" aria-controls="%s" aria-selected="%s" tabindex="%s" class="gb-tabs__button%s">%s</button>',
				esc_attr( $tab_id ),
				esc_attr( $panel_id ),
				$active ? 'true' : 'false',
				$active ? '0' : '-1',
				$active ? ' is-active' : '',
				esc_html( $label )
			);

			// Render panel then fix the id/aria/hidden attrs.
			// TabPanel.php cannot receive per-panel index via WP context
			// (providesContext sends the same value to all children), so we
			// post-process the outer <div> after rendering.
			$rendered = $inner_block->render();

			// Replace the always-0 index that TabPanel generated with real $idx.
			$rendered = preg_replace(
				'/\bid="panel-[^"]*?"/',
				'id="' . esc_attr( $panel_id ) . '"',
				$rendered,
				1
			);
			$rendered = preg_replace(
				'/\baria-labelledby="tab-[^"]*?"/',
				'aria-labelledby="' . esc_attr( $tab_id ) . '"',
				$rendered,
				1
			);

			// Fix hidden attribute: non-active → add hidden, active → remove it.
			if ( $active ) {
				$rendered = preg_replace( '/(\s+hidden(?:="[^"]*")?)(?=>|\s)/', '', $rendered, 1 );
			} else {
				// Insert hidden before the closing > of the opening tag if not already present.
				if ( ! preg_match( '/\bhidden\b/', substr( $rendered, 0, 300 ) ) ) {
					$rendered = preg_replace( '/^(<div\b[^>]*)>/', '$1 hidden>', $rendered, 1 );
				}
			}

			$panels_html .= $rendered;
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
	 * @param string $orientation Raw value.
	 * @return string 'horizontal' or 'vertical'.
	 */
	private function sanitize_orientation( string $orientation ): string {
		return in_array( $orientation, array( 'horizontal', 'vertical' ), true )
			? $orientation
			: 'horizontal';
	}
}

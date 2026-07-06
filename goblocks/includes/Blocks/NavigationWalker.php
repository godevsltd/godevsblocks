<?php
/**
 * Navigation Walker.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * Custom walker that adds a submenu toggle button on parent items.
 */
class NavigationWalker extends \Walker_Nav_Menu {

	/**
	 * Outputs the beginning of the current element in the tree.
	 *
	 * @param string    $output    Used to append additional content.
	 * @param \WP_Post  $item      The current menu item.
	 * @param int       $depth     Depth of menu item. Used for padding.
	 * @param \stdClass $args      An object of wp_nav_menu() arguments.
	 * @param int       $id        Current item ID.
	 * @return void
	 */
	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ): void {
		parent::start_el( $output, $item, $depth, $args, $id );

		// If this item has children, inject a submenu toggle button after the <a>.
		if ( in_array( 'menu-item-has-children', (array) $item->classes, true ) ) {
			$btn = '<button class="gb-navigation__submenu-toggle" aria-expanded="false" aria-label="'
				. esc_attr__( 'Toggle submenu', 'goblocks' )
				. '"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">'
				. '<path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
				. '</svg></button>';
			// Inject after the closing </a> tag.
			$output = rtrim( $output );
			$pos    = strrpos( $output, '</a>' );
			if ( false !== $pos ) {
				$output = substr_replace( $output, '</a>' . $btn, $pos, 4 );
			}
		}
	}
}

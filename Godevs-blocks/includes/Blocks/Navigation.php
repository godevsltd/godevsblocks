<?php
/**
 * Navigation.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Navigation block — PHP render callback.
 *
 * Renders a WordPress navigation menu via wp_nav_menu().
 * Supports dropdowns, mobile hamburger, custom colors, dynamic breakpoint.
 */
class Navigation extends BlockBase {

	/**
	 * Block slug used to register the block type.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'navigation';
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

		$layout      = sanitize_key( $attributes['layout'] ?? 'horizontal' );
		$show_toggle = ! isset( $attributes['showMobileToggle'] ) || ! empty( $attributes['showMobileToggle'] );
		$menu_id     = isset( $attributes['menuId'] ) ? intval( $attributes['menuId'] ) : 0;
		$breakpoint  = sanitize_text_field( $attributes['mobileBreakpoint'] ?? '768px' );
		$sticky      = ! empty( $attributes['sticky'] );
		$scroll_hide = ! empty( $attributes['scrollHide'] );

		// Validate breakpoint to avoid CSS injection.
		if ( ! preg_match( '/^\d+(px|em|rem)$/', $breakpoint ) ) {
			$breakpoint = '768px';
		}

		$link_color   = isset( $attributes['linkColor'] ) ? sanitize_hex_color( (string) $attributes['linkColor'] ) : '';
		$hover_color  = isset( $attributes['hoverColor'] ) ? sanitize_hex_color( (string) $attributes['hoverColor'] ) : '';
		$active_color = isset( $attributes['activeColor'] ) ? sanitize_hex_color( (string) $attributes['activeColor'] ) : '';
		$dropdown_bg  = isset( $attributes['dropdownBg'] ) ? sanitize_hex_color( (string) $attributes['dropdownBg'] ) : '';

		$extra = array( 'gb-navigation', 'gb-navigation--' . $layout );
		if ( $sticky ) {
			$extra[] = 'gb-navigation--sticky';
		}
		if ( $sticky && $scroll_hide ) {
			$extra[] = 'gb-navigation--scroll-hide';
		}

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			$extra
		);

		// Build inline CSS variables string.
		$css_vars = '';
		if ( $link_color ) {
			$css_vars .= '--gb-nav-link:' . $link_color . ';';
		}
		if ( $hover_color ) {
			$css_vars .= '--gb-nav-hover:' . $hover_color . ';';
		}
		if ( $active_color ) {
			$css_vars .= '--gb-nav-active:' . $active_color . ';';
		}
		if ( $dropdown_bg ) {
			$css_vars .= '--gb-nav-dd-bg:' . $dropdown_bg . ';';
		}
		$style_attr = $css_vars ? ' style="' . esc_attr( $css_vars ) . '"' : '';

		// Breakpoint CSS is pre-enqueued via CssEnqueue::enqueue_nav_breakpoint_css().

		if ( ! $menu_id ) {
			return sprintf(
				'<nav class="%s"%s><p class="gb-navigation__placeholder">%s</p></nav>',
				$classes,
				$style_attr,
				esc_html__( 'Select a menu in block settings.', 'godevs-block-library' )
			);
		}

		$toggle_html = '';
		if ( $show_toggle ) {
			$toggle_html = '<button class="gb-navigation__toggle" aria-expanded="false" aria-label="'
				. esc_attr__( 'Toggle navigation', 'godevs-block-library' )
				. '"><span></span><span></span><span></span></button>';
		}

		add_filter( 'nav_menu_link_attributes', array( $this, 'add_submenu_toggle_attr' ), 10, 4 );

		$menu_html = wp_nav_menu(
			array(
				'menu'        => $menu_id,
				'container'   => false,
				'menu_class'  => 'gb-navigation__menu',
				'echo'        => false,
				'fallback_cb' => false,
				'walker'      => new NavigationWalker(),
			)
		);

		remove_filter( 'nav_menu_link_attributes', array( $this, 'add_submenu_toggle_attr' ), 10 );

		if ( ! $menu_html ) {
			$menu_html = '<ul class="gb-navigation__menu"><li>' . esc_html__( 'Menu not found.', 'godevs-block-library' ) . '</li></ul>';
		}

		$data_attrs = ' data-breakpoint="' . esc_attr( $breakpoint ) . '"';
		if ( $sticky && $scroll_hide ) {
			$data_attrs .= ' data-scroll-hide="true"';
		}

		return sprintf(
			'<nav class="%s"%s%s>%s%s</nav>',
			$classes,
			$style_attr,
			$data_attrs,
			$toggle_html,
			$menu_html
		);
	}

	/**
	 * Adds data attributes to submenu parent link elements.
	 *
	 * @param  array<string,mixed> $atts  HTML attributes for the anchor tag.
	 * @param  \WP_Post            $item  The current menu item.
	 * @param  \stdClass           $args  An object of wp_nav_menu() arguments.
	 * @param  int                 $depth Depth of menu item.
	 * @return array<string,mixed>        Modified attributes array.
	 */
	public function add_submenu_toggle_attr( array $atts, \WP_Post $item, \stdClass $args, int $depth ): array {
		return $atts;
	}
}

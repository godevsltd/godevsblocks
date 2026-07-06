<?php
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

	public function get_name(): string {
		return 'navigation';
	}

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

		// Dynamic mobile breakpoint — only output if different from default 768px.
		$bp_css = '';
		if ( '768px' !== $breakpoint ) {
			$sel    = '.gb-navigation-' . esc_attr( $unique_id );
			$bp_css = sprintf(
				'<style>@media(max-width:%s){%s .gb-navigation__toggle{display:flex}%s .gb-navigation__menu{display:none;flex-direction:column;width:100%%;padding:.5rem 0;margin-top:.25rem;border-top:1px solid #e2e8f0}%s .gb-navigation__menu.is-open{display:flex}}</style>',
				esc_attr( $breakpoint ),
				$sel,
				$sel,
				$sel
			);
		}

		if ( ! $menu_id ) {
			return $bp_css . sprintf(
				'<nav class="%s"%s><p class="gb-navigation__placeholder">%s</p></nav>',
				$classes,
				$style_attr,
				esc_html__( 'Select a menu in block settings.', 'goblocks' )
			);
		}

		$toggle_html = '';
		if ( $show_toggle ) {
			$toggle_html = '<button class="gb-navigation__toggle" aria-expanded="false" aria-label="'
				. esc_attr__( 'Toggle navigation', 'goblocks' )
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
				'walker'      => new Navigation_Walker(),
			)
		);

		remove_filter( 'nav_menu_link_attributes', array( $this, 'add_submenu_toggle_attr' ), 10 );

		if ( ! $menu_html ) {
			$menu_html = '<ul class="gb-navigation__menu"><li>' . esc_html__( 'Menu not found.', 'goblocks' ) . '</li></ul>';
		}

		$data_attrs = ' data-breakpoint="' . esc_attr( $breakpoint ) . '"';
		if ( $sticky && $scroll_hide ) {
			$data_attrs .= ' data-scroll-hide="true"';
		}

		return $bp_css . sprintf(
			'<nav class="%s"%s%s>%s%s</nav>',
			$classes,
			$style_attr,
			$data_attrs,
			$toggle_html,
			$menu_html
		);
	}

	/** @param array<string,mixed> $atts */
	public function add_submenu_toggle_attr( array $atts, \WP_Post $item, \stdClass $args, int $depth ): array {
		return $atts;
	}
}

/**
 * Custom walker that adds a submenu toggle button on parent items.
 */
class Navigation_Walker extends \Walker_Nav_Menu {

	/**
	 * @param string    $output
	 * @param \WP_Post  $item
	 * @param int       $depth
	 * @param \stdClass $args
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
			// Inject before the closing </a> is impossible at this hook; inject after the <a> closes.
			$output = rtrim( $output );
			// Replace the last </a> with </a> + button.
			$pos = strrpos( $output, '</a>' );
			if ( false !== $pos ) {
				$output = substr_replace( $output, '</a>' . $btn, $pos, 4 );
			}
		}
	}
}

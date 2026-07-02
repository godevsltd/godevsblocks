<?php
/**
 * Abstract base class for all GoBlocks block implementations.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Utils\Sanitize;

/**
 * Every concrete block class extends this, implements get_name() and render(),
 * and is registered via register().
 *
 * The pattern:
 *   class Box extends BlockBase {
 *       public function get_name(): string { return 'box'; }
 *       public function render( array $attributes, string $content, \WP_Block $block ): string {
 *           // Return the block's HTML.
 *       }
 *   }
 *   (new Box())->register();
 */
abstract class BlockBase {

	/**
	 * Return the block slug (without the 'goblocks/' namespace).
	 * Used to locate the compiled build directory.
	 *
	 * @return string e.g. 'box', 'text', 'heading'
	 */
	abstract public function get_name(): string;

	/**
	 * Render the block server-side.
	 *
	 * This method becomes the `render_callback` passed to register_block_type().
	 * All GoBlocks blocks are dynamic — save.tsx returns null.
	 *
	 * @param  array<string, mixed> $attributes Block attributes from the editor.
	 * @param  string               $content    Inner blocks HTML (if any).
	 * @param  \WP_Block            $block      Block instance (context, etc.).
	 * @return string HTML output.
	 */
	abstract public function render( array $attributes, string $content, \WP_Block $block ): string;

	/**
	 * Register the block type with WordPress.
	 *
	 * Reads block metadata from the compiled build directory and attaches
	 * this class instance's render() method as the render callback.
	 *
	 * @return void
	 */
	public function register(): void {
		$block_dir = GOBLOCKS_BUILD_DIR . 'blocks/' . $this->get_name() . '/';

		if ( ! file_exists( $block_dir . 'block.json' ) ) {
			return;
		}

		register_block_type(
			$block_dir,
			array(
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	// ── Protected helpers — available to all block render() implementations ──

	/**
	 * Safely extract uniqueId from attributes, returning '' if absent.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @return string
	 */
	protected function get_unique_id( array $attributes ): string {
		$id = $attributes['uniqueId'] ?? '';
		$id = Sanitize::unique_id( is_string( $id ) ? $id : '' );
		if ( '' === $id ) {
			// Deterministic fallback when uniqueId was not yet assigned by the editor.
			$id = 'fb' . substr( md5( serialize( $attributes ) ), 0, 6 );
		}
		return $id;
	}

	/**
	 * Safely extract and validate the HTML tag name.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @param  string               $fallback   Fallback tag.
	 * @return string
	 */
	protected function get_tag_name( array $attributes, string $fallback = 'div' ): string {
		$tag = $attributes['tagName'] ?? $fallback;
		return Sanitize::tag_name( is_string( $tag ) ? $tag : $fallback, $fallback );
	}

	/**
	 * Return the CSS class name for this block instance.
	 * Pattern: gb-{block-name}-{uniqueId}, or gb-{block-name} when uniqueId is empty.
	 *
	 * @param  string $unique_id Block unique ID.
	 * @return string
	 */
	protected function get_block_class( string $unique_id ): string {
		if ( '' === $unique_id ) {
			return 'gb-' . $this->get_name();
		}
		return 'gb-' . $this->get_name() . '-' . $unique_id;
	}

	/**
	 * Return sanitized global class array from attributes.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @return string[]
	 */
	protected function get_global_classes( array $attributes ): array {
		$classes = $attributes['globalClasses'] ?? array();
		return Sanitize::css_class_array( is_array( $classes ) ? $classes : array() );
	}

	/**
	 * Build a space-separated class string from the block class + global classes.
	 *
	 * @param  string   $block_class    Primary block class (gb-{name}-{id}).
	 * @param  string[] $global_classes Additional classes from the editor.
	 * @param  string[] $extra          Extra classes added by the render method.
	 * @return string
	 */
	protected function build_class_string( string $block_class, array $global_classes = array(), array $extra = array() ): string {
		$all = array_filter(
			array_unique( array_merge( array( $block_class ), $global_classes, $extra ) )
		);
		return esc_attr( implode( ' ', $all ) );
	}

	/**
	 * Build an HTML attribute string from a key→value map.
	 *
	 * Values are escaped with esc_attr(). URLs are escaped with esc_url().
	 * The 'class' and 'id' keys are skipped (handled separately).
	 * Unknown on* event handlers are stripped.
	 *
	 * @param  array<string, string> $attrs Raw attribute map.
	 * @return string Ready-to-output attribute string (leading space included).
	 */
	protected function build_html_attrs( array $attrs ): string {
		$parts = array();

		foreach ( $attrs as $name => $value ) {
			// Sanitize attribute name.
			$name = preg_replace( '/[^a-z0-9\-_:]/', '', strtolower( $name ) ) ?? '';

			if ( '' === $name ) {
				continue;
			}

			// Strip on* event handlers.
			if ( str_starts_with( $name, 'on' ) ) {
				continue;
			}

			// Skip class and id — controlled separately.
			if ( in_array( $name, array( 'class', 'id' ), true ) ) {
				continue;
			}

			$value   = is_string( $value ) ? $value : '';
			$escaped = ( 'href' === $name || 'src' === $name || 'action' === $name )
				? esc_url( $value )
				: esc_attr( $value );

			if ( '' === $escaped && ! in_array( $name, array( 'alt', 'aria-label' ), true ) ) {
				continue;
			}

			$parts[] = $name . '="' . $escaped . '"';
		}

		return $parts ? ' ' . implode( ' ', $parts ) : '';
	}

	/**
	 * Extract and validate the htmlAttributes block attribute.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @return array<string, string>
	 */
	protected function get_html_attributes( array $attributes ): array {
		$raw = $attributes['htmlAttributes'] ?? array();
		if ( ! is_array( $raw ) ) {
			return array();
		}

		$out = array();
		foreach ( $raw as $key => $value ) {
			if ( is_string( $key ) && ( is_string( $value ) || is_numeric( $value ) ) ) {
				$out[ $key ] = (string) $value;
			}
		}

		return $out;
	}

	/**
	 * Wrap inner content in an inner container div when needed.
	 *
	 * @param  string $content       Inner blocks HTML.
	 * @param  bool   $use_inner_div Whether to wrap.
	 * @return string
	 */
	protected function maybe_wrap_inner( string $content, bool $use_inner_div = false ): string {
		if ( ! $use_inner_div ) {
			return $content;
		}
		return '<div class="gb-inner">' . $content . '</div>';
	}
}

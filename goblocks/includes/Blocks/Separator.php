<?php
/**
 * Separator.
 *
 * @package GoBlocks\Blocks
 */

namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Separator block — PHP render callback.
 *
 * Outputs a styled horizontal rule. All visual styles are pre-generated
 * by the TypeScript CssEngine and stored in `attributes.generatedCss`.
 * PHP outputs the <hr> element with the correct classes.
 */
class Separator extends BlockBase {

	/**
	 * Block name (without namespace prefix).
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'separator';
	}

	/**
	 * Render the Separator block.
	 *
	 * @param  array<string, mixed> $attributes Block attributes.
	 * @param  string               $content    Inner blocks HTML (unused).
	 * @param  WP_Block             $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render( array $attributes, string $content, WP_Block $block ): string {
		$unique_id = $this->get_unique_id( $attributes );

		$label      = isset( $attributes['label'] ) ? sanitize_text_field( (string) $attributes['label'] ) : '';
		$line_style = isset( $attributes['lineStyle'] ) ? sanitize_key( (string) $attributes['lineStyle'] ) : 'solid';

		$allowed_styles = array( 'solid', 'dashed', 'dotted', 'double' );
		if ( ! in_array( $line_style, $allowed_styles, true ) ) {
			$line_style = 'solid';
		}

		$extra = array( 'gb-separator' );
		if ( $label ) {
			$extra[] = 'gb-separator--labeled';
		}

		$classes = $this->build_class_string(
			$this->get_block_class( $unique_id ),
			$this->get_global_classes( $attributes ),
			$extra
		);

		$hr_style = ( 'solid' !== $line_style )
			? ' style="border-style:' . esc_attr( $line_style ) . '"'
			: '';

		if ( $label ) {
			return sprintf(
				'<div class="%s"><hr aria-hidden="true"%s /><span class="gb-separator__label">%s</span><hr aria-hidden="true"%s /></div>',
				esc_attr( $classes ),
				$hr_style,
				esc_html( $label ),
				$hr_style
			);
		}

		return sprintf( '<hr class="%s"%s />', esc_attr( $classes ), $hr_style );
	}
}

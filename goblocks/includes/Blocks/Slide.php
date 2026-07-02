<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Slide block (child of Slider) — PHP render callback.
 */
class Slide extends BlockBase {

	public function get_name(): string {
		return 'slide';
	}

	public function render( array $attributes, string $content, WP_Block $block ): string {
		$unique_id = $this->get_unique_id( $attributes );

		$classes = $this->build_class_string(
			$unique_id ? $this->get_block_class( $unique_id ) : '',
			$this->get_global_classes( $attributes ),
			array( 'gb-slide' )
		);

		return sprintf( '<div class="%s">%s</div>', $classes, $content );
	}
}

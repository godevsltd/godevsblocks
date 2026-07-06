<?php
namespace GoBlocks\Blocks;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Utils\SvgSanitizer;

/**
 * Shape Divider block — PHP render callback.
 *
 * Supports 16 shape presets, solid color, linear gradient, opacity, flip, placement.
 */
class Shape extends BlockBase {

	/** @var array<string,array{w:int,h:int,inner:string}> */
	private const SHAPES = array(
		'wave'                => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="currentColor"/>',
		),
		'wave-2'              => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,20 C180,60 360,-20 540,20 C720,60 900,-20 1080,20 C1260,60 1350,0 1440,20 L1440,80 L0,80 Z" fill="currentColor" opacity="0.4"/><path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="currentColor"/>',
		),
		'triangle'            => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M720,0 L1440,80 L0,80 Z" fill="currentColor"/>',
		),
		'triangle-asymmetric' => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,0 L1440,80 L0,80 Z" fill="currentColor"/>',
		),
		'diagonal'            => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,80 L1440,0 L1440,80 Z" fill="currentColor"/>',
		),
		'curved'              => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,80 Q720,-40 1440,80 Z" fill="currentColor"/>',
		),
		'curved-up'           => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,0 Q720,120 1440,0 L1440,80 L0,80 Z" fill="currentColor"/>',
		),
		'mountains'           => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,80 L360,10 L720,55 L1080,10 L1440,80 Z" fill="currentColor"/>',
		),
		'staircase'           => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,80 L0,60 L360,60 L360,40 L720,40 L720,20 L1080,20 L1080,0 L1440,0 L1440,80 Z" fill="currentColor"/>',
		),
		'tilt'                => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M1440,0 L0,80 L0,0 Z" fill="currentColor" opacity="0.4"/><path d="M0,80 L1440,0 L1440,80 Z" fill="currentColor"/>',
		),
		'clouds'              => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,60 C120,60 120,20 240,20 C360,20 360,60 480,60 C600,60 600,20 720,20 C840,20 840,60 960,60 C1080,60 1080,20 1200,20 C1320,20 1320,60 1440,60 L1440,80 L0,80 Z" fill="currentColor"/>',
		),
		'zigzag'              => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,40 L120,0 L240,40 L360,0 L480,40 L600,0 L720,40 L840,0 L960,40 L1080,0 L1200,40 L1320,0 L1440,40 L1440,80 L0,80 Z" fill="currentColor"/>',
		),
		'fan'                 => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,80 C0,40 360,0 720,0 C1080,0 1440,40 1440,80 Z" fill="currentColor"/>',
		),
		'split'               => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,0 L720,80 L1440,0 L1440,80 L0,80 Z" fill="currentColor"/>',
		),
		'arrow'               => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,0 L720,80 L1440,0 L1440,0 L0,0 Z" fill="currentColor"/>',
		),
		'swoosh'              => array(
			'w'     => 1440,
			'h'     => 80,
			'inner' => '<path d="M0,0 C400,80 1040,80 1440,0 L1440,80 L0,80 Z" fill="currentColor"/>',
		),
	);

	public function get_name(): string {
		return 'shape';
	}

	public function render( array $attributes, string $content, \WP_Block $block ): string {
		$shape_slug = sanitize_key( (string) ( $attributes['shapeSlug'] ?? 'wave' ) );
		$shape      = self::SHAPES[ $shape_slug ] ?? self::SHAPES['wave'];
		$fill_color = sanitize_text_field( (string) ( $attributes['fillColor'] ?? '#ffffff' ) );
		$fill_type  = sanitize_key( (string) ( $attributes['fillType'] ?? 'solid' ) );
		$grad_from  = sanitize_text_field( (string) ( $attributes['gradientFrom'] ?? '' ) );
		$grad_to    = sanitize_text_field( (string) ( $attributes['gradientTo'] ?? '' ) );
		$grad_angle = floatval( $attributes['gradientAngle'] ?? 90 );
		$opacity    = min( 100, max( 0, intval( $attributes['shapeOpacity'] ?? 100 ) ) );
		$height     = max( 1, absint( $attributes['shapeHeight'] ?? 80 ) );
		$flip_x     = (bool) ( $attributes['flipX'] ?? false );
		$flip_y     = (bool) ( $attributes['flipY'] ?? false );
		$placement  = sanitize_key( (string) ( $attributes['placement'] ?? 'bottom' ) );

		$use_gradient = ( 'gradient' === $fill_type ) && $grad_from && $grad_to;

		// Build flip transform.
		$transform = '';
		if ( $flip_x || $flip_y ) {
			$sx        = $flip_x ? -1 : 1;
			$sy        = $flip_y ? -1 : 1;
			$tx        = $flip_x ? - (int) $shape['w'] : 0;
			$ty        = $flip_y ? - (int) $shape['h'] : 0;
			$transform = sprintf( ' transform="scale(%d,%d) translate(%d,%d)"', $sx, $sy, $tx, $ty );
		}

		$unique_id = $this->get_unique_id( $attributes );

		// Build gradient defs + inner HTML.
		$defs        = '';
		$inner       = $shape['inner'];
		$color_style = '';

		if ( $use_gradient ) {
			$grad_id = 'gb-grad-' . esc_attr( $unique_id );
			$rad     = ( ( $grad_angle - 90 ) * M_PI ) / 180;
			$x2      = 0.5 + 0.5 * cos( $rad );
			$y2      = 0.5 + 0.5 * sin( $rad );
			$x1      = 1 - $x2;
			$y1      = 1 - $y2;
			$defs    = sprintf(
				'<defs><linearGradient id="%s" x1="%.4f" y1="%.4f" x2="%.4f" y2="%.4f"><stop offset="0%%" stop-color="%s"/><stop offset="100%%" stop-color="%s"/></linearGradient></defs>',
				$grad_id,
				$x1,
				$y1,
				$x2,
				$y2,
				esc_attr( $grad_from ),
				esc_attr( $grad_to )
			);
			$inner   = str_replace( 'fill="currentColor"', 'fill="url(#' . $grad_id . ')"', $inner );
		} else {
			$color_style = 'color:' . esc_attr( $fill_color ) . ';';
		}

		$opacity_style = $opacity < 100 ? 'opacity:' . ( $opacity / 100 ) . ';' : '';

		$svg = sprintf(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" preserveAspectRatio="none" width="100%%" height="%d" aria-hidden="true">%s<g%s>%s</g></svg>',
			(int) $shape['w'],
			(int) $shape['h'],
			$height,
			$defs,
			$transform,
			$inner
		);

		$svg = SvgSanitizer::sanitize( $svg );
		if ( '' === $svg ) {
			return '';
		}

		$block_class    = $unique_id ? $this->get_block_class( $unique_id ) : 'gb-shape';
		$global_classes = $this->get_global_classes( $attributes );
		$classes        = $this->build_class_string(
			$block_class,
			$global_classes,
			array( 'gb-shape', 'gb-shape--' . esc_attr( $placement ) )
		);

		$style = $color_style . 'line-height:0;display:block;' . $opacity_style;

		return sprintf(
			'<div class="%s" style="%s"><div class="gb-shape__svg-wrapper">%s</div></div>',
			$classes,
			esc_attr( $style ),
			$svg
		);
	}
}

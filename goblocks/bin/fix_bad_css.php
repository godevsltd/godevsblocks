<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals
/**
 * One-time repair script.
 * Usage: wp eval-file bin/fix_bad_css.php --allow-root
 *        OR: php bin/fix_bad_css.php (from WP root via CLI)
 */

if ( ! defined( 'ABSPATH' ) ) {
	$_SERVER['HTTP_HOST']   = 'localhost';
	$_SERVER['REQUEST_URI'] = '/';
	require '/var/www/html/wp-load.php';
}

echo "=== GoBlocks CSS Repair ===" . PHP_EOL;

// ── Helper: recursively fix bad generatedCss in block tree ────────────────

function goblocks_fix_block_tree( array $blocks ): array {
	foreach ( $blocks as &$block ) {
		$name = $block['blockName'] ?? '';
		if ( str_starts_with( $name, 'goblocks/' ) ) {
			$css = $block['attrs']['generatedCss'] ?? '';
			if ( '' !== $css ) {
				$first = ltrim( $css );
				if ( '' === $first || $first[0] !== '.' || ! str_starts_with( $first, '.gb-' ) ) {
					echo "  Clearing bad CSS from $name (uid=" . ( $block['attrs']['uniqueId'] ?? '' ) . ")" . PHP_EOL;
					$block['attrs']['generatedCss'] = '';
				}
			}
		}
		if ( ! empty( $block['innerBlocks'] ) ) {
			$block['innerBlocks'] = goblocks_fix_block_tree( $block['innerBlocks'] );
		}
	}
	return $blocks;
}

// ── Fix all published posts ───────────────────────────────────────────────

$posts = get_posts( [
	'post_type'      => 'any',
	'post_status'    => [ 'publish', 'draft', 'private' ],
	'numberposts'    => -1,
] );

$fixed = 0;

foreach ( $posts as $post ) {
	if ( empty( $post->post_content ) ) {
		continue;
	}
	if ( false === strpos( $post->post_content, 'wp:goblocks/' ) ) {
		continue;
	}

	$blocks        = parse_blocks( $post->post_content );
	$fixed_blocks  = goblocks_fix_block_tree( $blocks );
	$new_content   = serialize_blocks( $fixed_blocks );

	if ( $new_content !== $post->post_content ) {
		echo "Fixing post #{$post->ID}: {$post->post_title}" . PHP_EOL;
		wp_update_post( [ 'ID' => $post->ID, 'post_content' => $new_content ] );
		GoBlocks\CSS\CssCache::delete( $post->ID );
		$fixed++;
	}
}

echo PHP_EOL . "Posts fixed: $fixed" . PHP_EOL;

// ── Recreate any empty posts ──────────────────────────────────────────────

$about_id = 273;
$demo_id  = 282;

// About GoBlocks
$about_post = get_post( $about_id );
if ( $about_post && empty( $about_post->post_content ) ) {
	$about_content = serialize_blocks( [
		[
			'blockName'   => 'goblocks/box',
			'attrs'       => [ 'uniqueId' => 'about001', 'generatedCss' => '' ],
			'innerBlocks' => [
				[
					'blockName'   => 'goblocks/heading',
					'attrs'       => [ 'uniqueId' => 'about002', 'content' => 'About GoBlocks', 'tagName' => 'h1' ],
					'innerBlocks' => [],
					'innerHTML'   => '',
					'innerContent' => [],
				],
				[
					'blockName'   => 'goblocks/text',
					'attrs'       => [ 'uniqueId' => 'about003', 'content' => 'GoBlocks is a professional Gutenberg block library providing 38 modern, responsive blocks for WordPress.', 'tagName' => 'p' ],
					'innerBlocks' => [],
					'innerHTML'   => '',
					'innerContent' => [],
				],
			],
			'innerHTML'    => '',
			'innerContent' => [ '', null, '', null, '' ],
		],
	] );
	wp_update_post( [ 'ID' => $about_id, 'post_content' => $about_content, 'post_status' => 'publish' ] );
	echo "Recreated post #$about_id (About GoBlocks)" . PHP_EOL;
}

// Pro Blocks Demo
$demo_post = get_post( $demo_id );
if ( $demo_post && empty( $demo_post->post_content ) ) {
	$demo_content = serialize_blocks( [
		[
			'blockName'   => 'goblocks/box',
			'attrs'       => [ 'uniqueId' => 'demo0001', 'generatedCss' => '' ],
			'innerBlocks' => [
				[
					'blockName'   => 'goblocks/heading',
					'attrs'       => [ 'uniqueId' => 'demo0002', 'content' => 'Pro Blocks Demo', 'tagName' => 'h1' ],
					'innerBlocks' => [],
					'innerHTML'   => '',
					'innerContent' => [],
				],
				[
					'blockName'   => 'goblocks/text',
					'attrs'       => [ 'uniqueId' => 'demo0003', 'content' => 'This page demonstrates GoBlocks pro blocks. Add new blocks from the inserter to build your page.', 'tagName' => 'p' ],
					'innerBlocks' => [],
					'innerHTML'   => '',
					'innerContent' => [],
				],
			],
			'innerHTML'    => '',
			'innerContent' => [ '', null, '', null, '' ],
		],
	] );
	wp_update_post( [ 'ID' => $demo_id, 'post_content' => $demo_content, 'post_status' => 'publish' ] );
	echo "Recreated post #$demo_id (Pro Blocks Demo)" . PHP_EOL;
}

echo PHP_EOL . "Done." . PHP_EOL;
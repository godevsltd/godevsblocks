<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals
if ( ! defined( 'ABSPATH' ) ) {
	$_SERVER['HTTP_HOST']   = 'localhost:8888';
	$_SERVER['REQUEST_URI'] = '/';
	require '/var/www/html/wp-load.php';
}

$posts = get_posts( [
	'post_type'   => 'any',
	'post_status' => [ 'publish', 'draft', 'private' ],
	'numberposts' => -1,
] );

foreach ( $posts as $p ) {
	if ( empty( $p->post_content ) || false === strpos( $p->post_content, 'wp:goblocks/' ) ) {
		continue;
	}
	GoBlocks\CSS\CssCache::delete( $p->ID );
	$css_raw = GoBlocks\CSS\CssGenerator::collect_for_post( $p->ID );
	$minified = GoBlocks\CSS\CssGenerator::minify( $css_raw );
	GoBlocks\CSS\CssCache::write( $p->ID, $minified );
	$css = GoBlocks\CSS\CssGenerator::collect_for_post( $p->ID );
	echo "#" . $p->ID . " " . $p->post_title . ": " . strlen( $css ) . " chars CSS\n";
}

echo "\nAll CSS caches regenerated.\n";
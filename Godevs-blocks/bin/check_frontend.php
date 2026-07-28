<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals
if ( ! defined( 'ABSPATH' ) ) {
	$_SERVER['HTTP_HOST']   = 'localhost:8888';
	$_SERVER['REQUEST_URI'] = '/';
	require '/var/www/html/wp-load.php';
}

// Render the homepage post (post #272)
$post = get_post( 272 );
setup_postdata( $post );

$rendered = apply_filters( 'the_content', $post->post_content );

// Check for problems
$has_display_none = false !== strpos( $rendered, 'display:none' );
$has_hidden       = false !== strpos( $rendered, 'overflow:visible' );
$gb_classes       = preg_match_all( '/class="[^"]*gb-/', $rendered );

echo "Post #272 rendered length: " . strlen( $rendered ) . " chars\n";
echo "GoBlocks class instances: $gb_classes\n";
echo "Contains display:none: " . ( $has_display_none ? 'YES ❌' : 'NO ✅' ) . "\n";
echo "Contains overflow:visible: " . ( $has_hidden ? 'YES ❌' : 'NO ✅' ) . "\n";
echo "\nFirst 600 chars of rendered output:\n" . substr( $rendered, 0, 600 ) . "\n";

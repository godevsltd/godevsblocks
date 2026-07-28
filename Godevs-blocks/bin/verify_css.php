<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals, WordPress.PHP.DevelopmentFunctions
if ( ! defined( 'ABSPATH' ) ) {
	$_SERVER['HTTP_HOST']   = 'localhost';
	$_SERVER['REQUEST_URI'] = '/';
	require '/var/www/html/wp-load.php';
}

foreach ( [ 272, 273, 277, 282 ] as $id ) {
	$p = get_post( $id );
	echo "#$id {$p->post_title}: " . strlen( $p->post_content ) . " bytes\n";

	if ( false !== strpos( $p->post_content, 'wp:goblocks/' ) ) {
		$css     = GoBlocks\CSS\CssGenerator::collect_for_post( $id );
		$has_bad = false !== strpos( $css, 'display:none' );
		echo "  CSS: " . strlen( $css ) . " chars, bad: " . ( $has_bad ? 'YES ❌' : 'NO ✅' ) . "\n";
		if ( $has_bad ) {
			echo "  Bad snippet: " . substr( $css, 0, 120 ) . "\n";
		}
	}
}

echo "\nTesting fresh block render:\n";
$block_html = '<!-- wp:goblocks/heading {"uniqueId":"frsh0001","content":"Test Heading","tagName":"h2"} /-->';
$out        = do_blocks( $block_html );
echo "Result: $out\n";

echo "\nTesting empty uniqueId (should still render content):\n";
$block_html2 = '<!-- wp:goblocks/heading {"uniqueId":"","content":"No ID Heading"} /-->';
$out2        = do_blocks( $block_html2 );
echo "Result: " . print_r( $out2, true ) . "\n";
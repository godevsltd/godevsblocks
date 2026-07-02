<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals
defined( 'ABSPATH' ) || exit;

$parts   = array();
$parts[] = '<!-- wp:goblocks/section {"uniqueId":"testsc01","sectionLabel":"Features","generatedCss":".gb-section-testsc01{background:#f8fafc;}","blockVersion":1} -->';
$parts[] = '<!-- wp:goblocks/container {"uniqueId":"testct01","generatedCss":".gb-container-testct01{max-width:960px;}","blockVersion":1} -->';
$parts[] = '<!-- wp:goblocks/inner-section {"uniqueId":"testis01","columns":3,"generatedCss":".gb-inner-section-testis01{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;}","blockVersion":1} -->';
$parts[] = '<!-- wp:goblocks/box {"uniqueId":"testbx01","generatedCss":"","blockVersion":1} -->';
$parts[] = '<!-- wp:goblocks/text {"uniqueId":"testtx01","generatedCss":"","blockVersion":1} -->Column 1<!-- /wp:goblocks/text -->';
$parts[] = '<!-- /wp:goblocks/box -->';
$parts[] = '<!-- /wp:goblocks/inner-section -->';
$parts[] = '<!-- /wp:goblocks/container -->';
$parts[] = '<!-- /wp:goblocks/section -->';

$content = implode( "\n", $parts );
$html    = do_blocks( $content );

$checks = array(
	'gb-section'       => 'Section block',
	'gb-section-testsc01' => 'Section uniqueId class',
	'aria-label="Features"' => 'Section aria-label',
	'gb-container'     => 'Container block',
	'gb-container-testct01' => 'Container uniqueId class',
	'gb-inner-section' => 'Inner Section block',
	'gb-inner-section-testis01' => 'Inner Section uniqueId class',
);

$passed = 0;
$failed = 0;

foreach ( $checks as $needle => $label ) {
	if ( strpos( $html, $needle ) !== false ) {
		WP_CLI::line( '  PASS: ' . $label );
		$passed++;
	} else {
		WP_CLI::line( '  FAIL: ' . $label . ' (missing "' . $needle . '")' );
		$failed++;
	}
}

WP_CLI::line( '' );
WP_CLI::line( 'Results: ' . $passed . ' passed, ' . $failed . ' failed' );

if ( $failed === 0 ) {
	WP_CLI::success( 'All layout blocks render correctly.' );
} else {
	WP_CLI::warning( 'Some checks failed. HTML output:' );
	WP_CLI::line( substr( $html, 0, 800 ) );
}
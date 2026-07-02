<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals
if ( ! defined( 'ABSPATH' ) ) { exit; }
/**
 * Create a demo "About GoBlocks" page using GoBlocks blocks.
 * Demonstrates: Box, Grid, Heading, Text, Button, Icon, Accordion.
 * Run via: wp eval-file wp-content/plugins/goblocks/bin/create-sample-page.php
 */

// Delete existing Sample Page
$old = get_page_by_path( 'sample-page' );
if ( $old ) {
    wp_delete_post( $old->ID, true );
    WP_CLI::log( "Deleted old Sample Page #{$old->ID}" );
}

$ico_check = "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' width='18' height='18'><circle cx='10' cy='10' r='10' fill='#dcfce7'/><path stroke='#16a34a' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' d='M6 10l3 3 5-5'/></svg>";

$c = '';

// PAGE HERO
$c .= '<!-- wp:goblocks/box {"uniqueId":"sp1","generatedCss":".gb-box-sp1{background:linear-gradient(135deg,#f8fafc 0%,#eff6ff 100%);padding:72px 40px 56px;text-align:center;border-bottom:1px solid #e2e8f0;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"sp1badge","generatedCss":".gb-box-sp1badge{display:inline-flex;background:#eff6ff;border:1px solid #bfdbfe;border-radius:100px;padding:4px 14px;margin-bottom:20px;}"} -->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"sp1bt","content":"About GoBlocks","generatedCss":".gb-text-sp1bt{font-size:.75rem;font-weight:700;color:#1d4ed8;letter-spacing:.07em;text-transform:uppercase;margin:0;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"sp1h","tagName":"h1","content":"The Block Plugin Built Right","generatedCss":".gb-heading-sp1h{font-size:clamp(2rem,4vw,3rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin-bottom:14px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"sp1sub","content":"GoBlocks gives you 18 premium Gutenberg blocks, a TypeScript CSS engine, and zero inline styles. 100% free, forever.","generatedCss":".gb-text-sp1sub{color:#475569;font-size:1.05rem;line-height:1.75;max-width:540px;margin:0 auto 32px;}"} /-->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"sp1btns","generatedCss":".gb-box-sp1btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}"} -->';
$c .= '<!-- wp:goblocks/button {"uniqueId":"sp1b1","text":"Download Free","href":"https://wordpress.org/plugins/goblocks/","generatedCss":".gb-button-sp1b1{background:#4f46e5;color:#fff;padding:12px 26px;border-radius:8px;font-size:.9rem;font-weight:700;text-decoration:none;display:inline-flex;}"} /-->';
$c .= '<!-- wp:goblocks/button {"uniqueId":"sp1b2","text":"View Home Page","href":"/","generatedCss":".gb-button-sp1b2{background:#fff;color:#374151;padding:12px 26px;border-radius:8px;font-size:.9rem;font-weight:700;text-decoration:none;border:1.5px solid #e2e8f0;display:inline-flex;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- /wp:goblocks/box -->';

// STATS 4-COL
$c .= '<!-- wp:goblocks/box {"uniqueId":"sp2","generatedCss":".gb-box-sp2{background:#fff;padding:48px 40px;border-bottom:1px solid #f1f5f9;}"} -->';
$c .= '<!-- wp:goblocks/grid {"uniqueId":"sp2g","generatedCss":".gb-grid-sp2g{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;max-width:760px;margin:0 auto;}@media(max-width:640px){.gb-grid-sp2g{grid-template-columns:repeat(2,1fr);}}"} -->';
foreach ( [
    ['sp2a','18','Blocks','#4f46e5'],
    ['sp2b','15','Patterns','#0891b2'],
    ['sp2c','0','Inline Styles','#059669'],
    ['sp2d','100%','Free Forever','#7c3aed'],
] as [$uid,$num,$label,$col] ) {
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'","generatedCss":".gb-box-'.$uid.'{text-align:center;padding:20px 12px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;}"} -->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'n","content":"'.$num.'","generatedCss":".gb-text-'.$uid.'n{font-size:2rem;font-weight:800;color:'.$col.';margin:0;line-height:1;}"} /-->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'l","content":"'.$label.'","generatedCss":".gb-text-'.$uid.'l{font-size:.75rem;color:#94a3b8;font-weight:600;letter-spacing:.04em;text-transform:uppercase;margin:6px 0 0;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
}
$c .= '<!-- /wp:goblocks/grid -->';
$c .= '<!-- /wp:goblocks/box -->';

// WHY GOBLOCKS
$c .= '<!-- wp:goblocks/box {"uniqueId":"sp3","generatedCss":".gb-box-sp3{background:#f8fafc;padding:72px 40px;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"sp3i","generatedCss":".gb-box-sp3i{max-width:900px;margin:0 auto;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"sp3hd","generatedCss":".gb-box-sp3hd{text-align:center;margin-bottom:48px;}"} -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"sp3h","tagName":"h2","content":"Why GoBlocks?","generatedCss":".gb-heading-sp3h{font-size:clamp(1.6rem,3vw,2.25rem);font-weight:800;color:#0f172a;letter-spacing:-0.025em;margin-bottom:10px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"sp3sub","content":"Most block plugins inject inline styles or use JavaScript for CSS. GoBlocks does it right.","generatedCss":".gb-text-sp3sub{color:#64748b;font-size:1rem;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/grid {"uniqueId":"sp3g","generatedCss":".gb-grid-sp3g{display:grid;grid-template-columns:1fr 1fr;gap:20px;}@media(max-width:700px){.gb-grid-sp3g{grid-template-columns:1fr;}}"} -->';
$items = [
    ['TypeScript CSS Engine','All CSS is computed in TypeScript, stored as block attributes, and written to a single file per page. No style= attributes. No JS injection. Pure CSS.','#4f46e5'],
    ['Zero Inline Styles','The HTML is clean. Semantic. Screen-reader friendly. Every element gets its class and nothing more. The CSS lives in one file.','#0891b2'],
    ['Per-Block Responsive','Every spacing, font-size, and layout property has independent desktop, tablet, and mobile values. One inspector. Three breakpoints.','#059669'],
    ['Dynamic Content Tags','25+ content tags (post title, excerpt, author, date, custom fields, taxonomy terms) work live inside Query blocks. No PHP needed.','#7c3aed'],
    ['WP Native Blocks','All 18 blocks are registered with block.json, use standard save/render APIs, and store content in post_content. Full Gutenberg compatibility.','#d97706'],
    ['15+ Free Patterns','Copy-paste professional sections: heroes, feature grids, testimonials, FAQs, CTAs, and more. All built with GoBlocks.','#dc2626'],
];
foreach ( $items as [$title,$body,$col] ) {
    $uid = 'sp3b'.md5($title);
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'","generatedCss":".gb-box-'.$uid.'{background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0;display:flex;gap:14px;}"} -->';
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'d","generatedCss":".gb-box-'.$uid.'d{width:8px;height:8px;border-radius:50%;background:'.$col.';flex-shrink:0;margin-top:8px;}"} --><!-- /wp:goblocks/box -->';
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'tx","generatedCss":".gb-box-'.$uid.'tx{}"} -->';
    $c .= '<!-- wp:goblocks/heading {"uniqueId":"'.$uid.'h","tagName":"h3","content":"'.$title.'","generatedCss":".gb-heading-'.$uid.'h{font-size:.95rem;font-weight:700;color:#0f172a;margin-bottom:6px;}"} /-->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'t","content":"'.$body.'","generatedCss":".gb-text-'.$uid.'t{font-size:.875rem;color:#64748b;line-height:1.65;margin:0;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
    $c .= '<!-- /wp:goblocks/box -->';
}
$c .= '<!-- /wp:goblocks/grid -->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// FAQ ACCORDION
$c .= '<!-- wp:goblocks/box {"uniqueId":"sp4","generatedCss":".gb-box-sp4{background:#fff;padding:72px 40px;border-top:1px solid #f1f5f9;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"sp4i","generatedCss":".gb-box-sp4i{max-width:680px;margin:0 auto;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"sp4hd","generatedCss":".gb-box-sp4hd{text-align:center;margin-bottom:40px;}"} -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"sp4h","tagName":"h2","content":"Quick Answers","generatedCss":".gb-heading-sp4h{font-size:clamp(1.6rem,3vw,2.25rem);font-weight:800;color:#0f172a;letter-spacing:-0.025em;margin-bottom:10px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"sp4sub","content":"Everything you need to know to get started.","generatedCss":".gb-text-sp4sub{color:#64748b;font-size:1rem;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$css_acc = '.gb-accordion-sp4acc{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;}';
$c .= '<!-- wp:goblocks/accordion {"uniqueId":"sp4acc","generatedCss":"'.addslashes($css_acc).'"} -->';
foreach ( [
    ['sp4q1','What WordPress version do I need?','GoBlocks requires WordPress 6.3 or higher and PHP 8.0 or higher. It works with the default Gutenberg editor — no Classic Editor compatibility.'],
    ['sp4q2','Does GoBlocks work with WooCommerce?','Yes. GoBlocks blocks can be used on any page type including WooCommerce pages. The blocks don\'t conflict with WooCommerce\'s own blocks.'],
    ['sp4q3','How many sites can I install it on?','Unlimited. GoBlocks is GPLv2 licensed and available for free from WordPress.org. Install it on as many sites as you like, commercial or otherwise.'],
    ['sp4q4','Is there a premium version?','No. All 18 blocks and all 15+ patterns are completely free. There is no premium tier, no upsell, and no subscription.'],
] as [$uid,$q,$a] ) {
    $css_item  = '.gb-accordion-item-'.$uid.'{border-bottom:1px solid #e2e8f0;}';
    $css_item .= '.gb-accordion-item-'.$uid.':last-child{border-bottom:none;}';
    $c .= '<!-- wp:goblocks/accordion-item {"uniqueId":"'.$uid.'","question":"'.addslashes($q).'","generatedCss":"'.addslashes($css_item).'"} -->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'t","content":"'.addslashes($a).'","generatedCss":".gb-text-'.$uid.'t{color:#475569;font-size:.9rem;line-height:1.75;padding:0 24px 20px;}"} /-->';
    $c .= '<!-- /wp:goblocks/accordion-item -->';
}
$c .= '<!-- /wp:goblocks/accordion -->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// CTA
$c .= '<!-- wp:goblocks/box {"uniqueId":"sp5","generatedCss":".gb-box-sp5{background:linear-gradient(135deg,#1e1b4b,#312e81);padding:72px 40px;text-align:center;}"} -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"sp5h","tagName":"h2","content":"Ready to Build?","generatedCss":".gb-heading-sp5h{font-size:clamp(1.6rem,3vw,2.25rem);font-weight:900;color:#fff;margin-bottom:12px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"sp5sub","content":"Install GoBlocks from WordPress.org in 60 seconds. No account, no credit card, no bloat.","generatedCss":".gb-text-sp5sub{color:#94a3b8;font-size:1rem;line-height:1.7;margin-bottom:28px;}"} /-->';
$c .= '<!-- wp:goblocks/button {"uniqueId":"sp5b1","text":"Download GoBlocks Free","href":"https://wordpress.org/plugins/goblocks/","generatedCss":".gb-button-sp5b1{background:#4f46e5;color:#fff;padding:13px 28px;border-radius:8px;font-size:.9rem;font-weight:700;text-decoration:none;display:inline-flex;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';

// Create page
$page_id = wp_insert_post([
    'post_title'   => 'About GoBlocks',
    'post_name'    => 'about',
    'post_content' => $c,
    'post_status'  => 'publish',
    'post_type'    => 'page',
    'post_author'  => 1,
]);

if ( is_wp_error( $page_id ) ) {
    WP_CLI::error( $page_id->get_error_message() );
} else {
    // Clear CSS cache for this page
    $upload = wp_upload_dir();
    $dir    = trailingslashit( $upload['basedir'] ) . 'goblocks/';
    if ( is_dir( $dir ) ) {
        array_map( 'unlink', glob( $dir . 'post-' . $page_id . '.css' ) );
    }
    WP_CLI::success( "Created 'About GoBlocks' page — ID: {$page_id}" );
    WP_CLI::log( "Visit: http://localhost:8888/?page_id={$page_id}" );
}
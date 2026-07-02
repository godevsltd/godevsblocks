<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals, WordPress.DB.DirectDatabaseQuery
if ( ! defined( 'ABSPATH' ) ) { exit; }
/**
 * Creates a GoBlocks demo home page using all 18 blocks.
 * KEY RULES for block markup:
 *  - Leaf blocks (no inner content): self-closing <!-- wp:X {...} /-->
 *  - Container blocks: opening/closing markers, inner block markers only, NO raw HTML wrapper
 *
 * Run via: wp eval-file wp-content/plugins/goblocks/bin/create-home-page.php
 */

// Single-quoted SVG attributes — no JSON backslash-escaping needed, safe through wp_insert_post.
$icon_bolt_svg  = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='40' height='40' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M13 2 3 14h9l-1 8 10-12h-9l1-8z'/></svg>";
$icon_sliders   = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='40' height='40' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 12h6'/></svg>";
$icon_database  = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='40' height='40' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><ellipse cx='12' cy='5' rx='9' ry='3'/><path d='M21 12c0 1.66-4 3-9 3s-9-1.34-9-3'/><path d='M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5'/></svg>";

$content = '<!-- wp:goblocks/box {"uniqueId":"gb01","tagName":"section","generatedCss":".gb-box-gb01{background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%);padding:100px 24px;text-align:center;position:relative;overflow:hidden;}"} -->'
. '<!-- wp:goblocks/heading {"uniqueId":"gb02","tagName":"h1","content":"Build Beautiful Pages with <strong>GoBlocks<\/strong>","generatedCss":".gb-heading-gb02{color:#ffffff;font-size:clamp(2.2rem,5vw,4rem);font-weight:900;margin-bottom:20px;line-height:1.1;}.gb-heading-gb02 strong{background:linear-gradient(90deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}"} /-->'
. '<!-- wp:goblocks/text {"uniqueId":"gb03","content":"18 premium Gutenberg blocks with responsive controls, dynamic content, and a blazing-fast CSS engine.","generatedCss":".gb-text-gb03{color:#94a3b8;font-size:1.25rem;line-height:1.75;max-width:600px;margin:0 auto 40px;}"} /-->'
. '<!-- wp:goblocks/box {"uniqueId":"gbbtns","generatedCss":".gb-box-gbbtns{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;}"} -->'
. '<!-- wp:goblocks/button {"uniqueId":"gb04","text":"Get Started Free","href":"#features","generatedCss":".gb-button-gb04{background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1rem;display:inline-flex;align-items:center;text-decoration:none;}"} /-->'
. '<!-- wp:goblocks/button {"uniqueId":"gb05","text":"View Demo","href":"#demo","generatedCss":".gb-button-gb05{background:rgba(255,255,255,0.1);color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1rem;border:2px solid rgba(255,255,255,.3);display:inline-flex;align-items:center;text-decoration:none;}"} /-->'
. '<!-- /wp:goblocks/box -->'
. '<!-- /wp:goblocks/box -->'

// Separator + Spacer
. '<!-- wp:goblocks/separator {"uniqueId":"gbsep1","generatedCss":".gb-separator-gbsep1{border:none;height:4px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);margin:0;}"} /-->'
. '<!-- wp:goblocks/spacer {"uniqueId":"gbsp1","generatedCss":".gb-spacer-gbsp1{height:80px;}"} /-->'

// Features section
. '<!-- wp:goblocks/box {"uniqueId":"gbfeat","tagName":"section","generatedCss":".gb-box-gbfeat{max-width:1200px;margin:0 auto;padding:0 24px;}"} -->'
. '<!-- wp:goblocks/heading {"uniqueId":"gb06","tagName":"h2","content":"Everything You Need","generatedCss":".gb-heading-gb06{font-size:2.5rem;font-weight:800;color:#0f172a;text-align:center;margin-bottom:16px;}"} /-->'
. '<!-- wp:goblocks/text {"uniqueId":"gb07","content":"Professional blocks designed for developers and site builders who demand quality.","generatedCss":".gb-text-gb07{color:#64748b;text-align:center;font-size:1.1rem;margin-bottom:56px;}"} /-->'
// Grid of 3 feature cards
. '<!-- wp:goblocks/grid {"uniqueId":"gb08","generatedCss":".gb-grid-gb08{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;}@media(max-width:768px){.gb-grid-gb08{grid-template-columns:1fr;}}"} -->'
// Card 1
. '<!-- wp:goblocks/box {"uniqueId":"gb09","generatedCss":".gb-box-gb09{background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,.06);}"} -->'
. '<!-- wp:goblocks/icon {"uniqueId":"gb10","svgContent":' . json_encode( $icon_bolt_svg ) . ',"generatedCss":".gb-icon-gb10{color:#3b82f6;margin-bottom:20px;display:block;}"} /-->'
. '<!-- wp:goblocks/heading {"uniqueId":"gb11","tagName":"h3","content":"Lightning Fast","generatedCss":".gb-heading-gb11{font-size:1.3rem;font-weight:700;color:#0f172a;margin-bottom:12px;}"} /-->'
. '<!-- wp:goblocks/text {"uniqueId":"gb12","content":"CSS generated once, cached to file, served as a lightweight asset. Zero render-blocking inline styles.","generatedCss":".gb-text-gb12{color:#64748b;line-height:1.7;}"} /-->'
. '<!-- /wp:goblocks/box -->'
// Card 2
. '<!-- wp:goblocks/box {"uniqueId":"gb13","generatedCss":".gb-box-gb13{background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,.06);}"} -->'
. '<!-- wp:goblocks/icon {"uniqueId":"gb14","svgContent":' . json_encode( $icon_sliders ) . ',"generatedCss":".gb-icon-gb14{color:#8b5cf6;margin-bottom:20px;display:block;}"} /-->'
. '<!-- wp:goblocks/heading {"uniqueId":"gb15","tagName":"h3","content":"Responsive Controls","generatedCss":".gb-heading-gb15{font-size:1.3rem;font-weight:700;color:#0f172a;margin-bottom:12px;}"} /-->'
. '<!-- wp:goblocks/text {"uniqueId":"gb16","content":"Every property has per-breakpoint controls. Design desktop, tablet, and mobile from a single inspector.","generatedCss":".gb-text-gb16{color:#64748b;line-height:1.7;}"} /-->'
. '<!-- /wp:goblocks/box -->'
// Card 3
. '<!-- wp:goblocks/box {"uniqueId":"gb17","generatedCss":".gb-box-gb17{background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,.06);}"} -->'
. '<!-- wp:goblocks/icon {"uniqueId":"gb18","svgContent":' . json_encode( $icon_database ) . ',"generatedCss":".gb-icon-gb18{color:#10b981;margin-bottom:20px;display:block;}"} /-->'
. '<!-- wp:goblocks/heading {"uniqueId":"gb19","tagName":"h3","content":"Dynamic Content","generatedCss":".gb-heading-gb19{font-size:1.3rem;font-weight:700;color:#0f172a;margin-bottom:12px;}"} /-->'
. '<!-- wp:goblocks/text {"uniqueId":"gb20","content":"25+ dynamic content tags: post title, excerpt, author, meta, terms — no shortcodes needed.","generatedCss":".gb-text-gb20{color:#64748b;line-height:1.7;}"} /-->'
. '<!-- /wp:goblocks/box -->'
. '<!-- /wp:goblocks/grid -->'
. '<!-- /wp:goblocks/box -->'

// Spacer between sections
. '<!-- wp:goblocks/spacer {"uniqueId":"gbsp2","generatedCss":".gb-spacer-gbsp2{height:80px;}"} /-->'

// Tabs section
. '<!-- wp:goblocks/box {"uniqueId":"gbtabsec","tagName":"section","generatedCss":".gb-box-gbtabsec{background:#f8fafc;padding:80px 24px;}"} -->'
. '<!-- wp:goblocks/heading {"uniqueId":"gbth","tagName":"h2","content":"Explore Features","generatedCss":".gb-heading-gbth{font-size:2rem;font-weight:800;color:#0f172a;text-align:center;margin-bottom:40px;}"} /-->'
. '<!-- wp:goblocks/tabs {"uniqueId":"gbtabs","generatedCss":".gb-tabs-gbtabs{max-width:800px;margin:0 auto;}"} -->'
. '<!-- wp:goblocks/tab-panel {"uniqueId":"gbt1","label":"Blocks","generatedCss":".gb-tab-panel-gbt1{padding:32px;background:#fff;border-radius:0 12px 12px 12px;border:1px solid #e2e8f0;}"} -->'
. '<!-- wp:goblocks/text {"uniqueId":"gbtt1","content":"GoBlocks ships with 18 ready-to-use blocks: Box, Text, Heading, Button, Image, Grid, Icon, Shape, Tabs, Tab Panel, Accordion, Accordion Item, Query, Query Loop, Query No Results, Pagination, Separator, and Spacer.","generatedCss":".gb-text-gbtt1{color:#374151;line-height:1.7;}"} /-->'
. '<!-- /wp:goblocks/tab-panel -->'
. '<!-- wp:goblocks/tab-panel {"uniqueId":"gbt2","label":"Patterns","generatedCss":".gb-tab-panel-gbt2{padding:32px;background:#fff;border-radius:0 12px 12px 12px;border:1px solid #e2e8f0;}"} -->'
. '<!-- wp:goblocks/text {"uniqueId":"gbtt2","content":"15 professionally designed patterns included: hero sections, card grids, pricing tables, testimonials, FAQ accordions, stats, newsletters, CTAs, team grids, blog post grids, logo clouds, contact CTAs, portfolio grids, how-it-works, and testimonial cards.","generatedCss":".gb-text-gbtt2{color:#374151;line-height:1.7;}"} /-->'
. '<!-- /wp:goblocks/tab-panel -->'
. '<!-- wp:goblocks/tab-panel {"uniqueId":"gbt3","label":"CSS Engine","generatedCss":".gb-tab-panel-gbt3{padding:32px;background:#fff;border-radius:0 12px 12px 12px;border:1px solid #e2e8f0;}"} -->'
. '<!-- wp:goblocks/text {"uniqueId":"gbtt3","content":"CSS is scoped per-block using unique IDs, generated by a TypeScript engine, stored as block attributes, and served from a file cache on the frontend. No inline styles. No specificity conflicts.","generatedCss":".gb-text-gbtt3{color:#374151;line-height:1.7;}"} /-->'
. '<!-- /wp:goblocks/tab-panel -->'
. '<!-- /wp:goblocks/tabs -->'
. '<!-- /wp:goblocks/box -->'

. '<!-- wp:goblocks/spacer {"uniqueId":"gbsp3","generatedCss":".gb-spacer-gbsp3{height:80px;}"} /-->'

// Accordion (FAQ)
. '<!-- wp:goblocks/box {"uniqueId":"gbaccsec","tagName":"section","generatedCss":".gb-box-gbaccsec{max-width:800px;margin:0 auto;padding:0 24px;}"} -->'
. '<!-- wp:goblocks/heading {"uniqueId":"gbah","tagName":"h2","content":"Frequently Asked Questions","generatedCss":".gb-heading-gbah{font-size:2rem;font-weight:800;color:#0f172a;text-align:center;margin-bottom:40px;}"} /-->'
. '<!-- wp:goblocks/accordion {"uniqueId":"gbacc","generatedCss":".gb-accordion-gbacc{display:flex;flex-direction:column;gap:8px;}"} -->'
. '<!-- wp:goblocks/accordion-item {"uniqueId":"gbai1","question":"Is GoBlocks free?","generatedCss":".gb-accordion-item-gbai1{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;}"} -->'
. '<!-- wp:goblocks/text {"uniqueId":"gbait1","content":"Yes, GoBlocks is completely free and open source, submitted to the WordPress.org plugin directory.","generatedCss":".gb-text-gbait1{padding:16px 20px;color:#374151;line-height:1.7;}"} /-->'
. '<!-- /wp:goblocks/accordion-item -->'
. '<!-- wp:goblocks/accordion-item {"uniqueId":"gbai2","question":"Does GoBlocks work with any theme?","generatedCss":".gb-accordion-item-gbai2{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;}"} -->'
. '<!-- wp:goblocks/text {"uniqueId":"gbait2","content":"Yes. GoBlocks uses scoped CSS with unique IDs so there are no conflicts with theme styles.","generatedCss":".gb-text-gbait2{padding:16px 20px;color:#374151;line-height:1.7;}"} /-->'
. '<!-- /wp:goblocks/accordion-item -->'
. '<!-- wp:goblocks/accordion-item {"uniqueId":"gbai3","question":"How many blocks does GoBlocks include?","generatedCss":".gb-accordion-item-gbai3{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;}"} -->'
. '<!-- wp:goblocks/text {"uniqueId":"gbait3","content":"GoBlocks v1.0 includes 18 blocks. More blocks are planned including Gallery, Form, Video, Counter, and more.","generatedCss":".gb-text-gbait3{padding:16px 20px;color:#374151;line-height:1.7;}"} /-->'
. '<!-- /wp:goblocks/accordion-item -->'
. '<!-- /wp:goblocks/accordion -->'
. '<!-- /wp:goblocks/box -->'

. '<!-- wp:goblocks/spacer {"uniqueId":"gbsp4","generatedCss":".gb-spacer-gbsp4{height:80px;}"} /-->'

// Query block section
. '<!-- wp:goblocks/box {"uniqueId":"gbqsec","tagName":"section","generatedCss":".gb-box-gbqsec{background:#f8fafc;padding:80px 24px;}"} -->'
. '<!-- wp:goblocks/heading {"uniqueId":"gbqh","tagName":"h2","content":"Latest Blog Posts","generatedCss":".gb-heading-gbqh{font-size:2rem;font-weight:800;color:#0f172a;text-align:center;margin-bottom:40px;}"} /-->'
. '<!-- wp:goblocks/query {"uniqueId":"gbq","query":{"perPage":3,"orderBy":"date","order":"DESC","postType":"post"},"generatedCss":".gb-query-gbq{max-width:1200px;margin:0 auto;}"} -->'
. '<!-- wp:goblocks/query-loop {"uniqueId":"gbql","generatedCss":".gb-query-loop-gbql{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}@media(max-width:768px){.gb-query-loop-gbql{grid-template-columns:1fr;}}"} -->'
// Post card template (rendered once per post by QueryLoop::render)
. '<!-- wp:goblocks/box {"uniqueId":"gbqcard","generatedCss":".gb-box-gbqcard{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.05);}"} -->'
. '<!-- wp:goblocks/heading {"uniqueId":"gbqtitle","tagName":"h3","content":"Post Title","generatedCss":".gb-heading-gbqtitle{font-size:1.1rem;font-weight:700;color:#0f172a;margin-bottom:12px;}"} /-->'
. '<!-- wp:goblocks/text {"uniqueId":"gbqexcerpt","content":"Post excerpt preview text goes here.","generatedCss":".gb-text-gbqexcerpt{color:#64748b;line-height:1.6;font-size:.9rem;}"} /-->'
. '<!-- /wp:goblocks/box -->'
. '<!-- /wp:goblocks/query-loop -->'
. '<!-- wp:goblocks/query-no-results {"uniqueId":"gbqnr","generatedCss":".gb-query-no-results-gbqnr{text-align:center;padding:40px;color:#94a3b8;}"} -->'
. '<!-- wp:goblocks/text {"uniqueId":"gbqnrt","content":"No posts found.","generatedCss":""} /-->'
. '<!-- /wp:goblocks/query-no-results -->'
. '<!-- wp:goblocks/pagination {"uniqueId":"gbqpag","generatedCss":".gb-pagination-gbqpag{display:flex;justify-content:center;margin-top:32px;gap:8px;}"} /-->'
. '<!-- /wp:goblocks/query -->'
. '<!-- /wp:goblocks/box -->'

. '<!-- wp:goblocks/spacer {"uniqueId":"gbsp5","generatedCss":".gb-spacer-gbsp5{height:80px;}"} /-->'

// Shape + CTA section
. '<!-- wp:goblocks/box {"uniqueId":"gbshape","tagName":"section","generatedCss":".gb-box-gbshape{background:#0f172a;padding:80px 24px;text-align:center;position:relative;overflow:hidden;}"} -->'
. '<!-- wp:goblocks/shape {"uniqueId":"gbsh1","shapeSlug":"wave","shapeHeight":60,"fillColor":"rgba(255,255,255,0.04)","generatedCss":".gb-shape-gbsh1{color:rgba(255,255,255,.04);position:absolute;top:0;left:0;width:100%;pointer-events:none;}"} /-->'
. '<!-- wp:goblocks/heading {"uniqueId":"gbcta","tagName":"h2","content":"Ready to Build Something Amazing?","generatedCss":".gb-heading-gbcta{color:#fff;font-size:2.2rem;font-weight:800;margin-bottom:20px;}"} /-->'
. '<!-- wp:goblocks/text {"uniqueId":"gbctxt","content":"Start with GoBlocks today — free, no subscription required.","generatedCss":".gb-text-gbctxt{color:#94a3b8;font-size:1.1rem;margin-bottom:32px;}"} /-->'
. '<!-- wp:goblocks/button {"uniqueId":"gbcbtn","text":"Download GoBlocks","href":"https://wordpress.org/plugins/goblocks","generatedCss":".gb-button-gbcbtn{background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;padding:18px 40px;border-radius:50px;font-weight:700;font-size:1.1rem;display:inline-flex;align-items:center;text-decoration:none;}"} /-->'
. '<!-- /wp:goblocks/box -->';

// Delete any existing home page
$q = new WP_Query( [ 'post_type' => 'page', 'post_status' => 'publish', 'title' => 'Home', 'posts_per_page' => 1 ] );
if ( $q->have_posts() ) {
	$existing_id = $q->posts[0]->ID;
	wp_delete_post( $existing_id, true );
	WP_CLI::log( "Deleted existing Home page (ID: $existing_id)" );
}

// Create the home page
$page_id = wp_insert_post( [
	'post_title'   => 'Home',
	'post_content' => $content,
	'post_status'  => 'publish',
	'post_type'    => 'page',
	'post_author'  => 1,
] );

if ( is_wp_error( $page_id ) ) {
	WP_CLI::error( 'Failed to create page: ' . $page_id->get_error_message() );
} else {
	WP_CLI::success( "Created Home page (ID: $page_id)" );
}

// Set as static front page
update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $page_id );

// Flush CSS cache so a fresh CSS file is generated on next visit
global $wpdb;
$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE 'goblocks_css_%'" );
// Delete old CSS files
$upload_dir = wp_upload_dir();
$css_dir    = trailingslashit( $upload_dir['basedir'] ) . 'goblocks/';
if ( is_dir( $css_dir ) ) {
	array_map( 'unlink', glob( $css_dir . 'post-*.css' ) );
}

WP_CLI::success( 'Set as static front page.' );
WP_CLI::log( "Visit: http://localhost:8888/" );
WP_CLI::log( "Admin: http://localhost:8888/wp-admin/ (admin / password)" );

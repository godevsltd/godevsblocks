<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals
/**
 * WP-CLI script: create a Pro Blocks demo page.
 * Run with: wp eval-file bin/create-pro-blocks-demo.php --path=/var/www/html
 */

defined( 'ABSPATH' ) || exit;

$existing = get_page_by_path( 'pro-blocks-demo', OBJECT, 'page' );
if ( $existing ) {
	wp_delete_post( $existing->ID, true );
}

$content = '
<!-- wp:goblocks/box {"uniqueId":"pbhero","tagName":"section","generatedCss":".gb-box-pbhero{background:linear-gradient(135deg,#f8fafc,#eff6ff,#e0f2fe);padding:80px 48px;text-align:center;border-bottom:1px solid #e2e8f0;}","blockVersion":1} -->
<!-- wp:goblocks/heading {"uniqueId":"pbh1","content":"Pro Blocks Demo","tagName":"h1","level":1,"generatedCss":".gb-heading-pbh1{font-size:clamp(2rem,4vw,3rem);font-weight:900;color:#0f172a;margin:0 0 16px;letter-spacing:-0.04em;}","blockVersion":1} /-->
<!-- wp:goblocks/text {"uniqueId":"pbsub","content":"All new GoBlocks Pro features — Counter, Progress Bar, Alert, Star Rating, Pricing, Countdown, Flip Card, Timeline.","tagName":"p","generatedCss":".gb-text-pbsub{font-size:1.1rem;color:#64748b;max-width:600px;margin:0 auto;}","blockVersion":1} /-->
<!-- /wp:goblocks/box -->

<!-- wp:goblocks/box {"uniqueId":"pbsec1","tagName":"section","generatedCss":".gb-box-pbsec1{padding:72px 48px;background:#fff;}@media(max-width:640px){.gb-box-pbsec1{padding:48px 20px;}}","blockVersion":1} -->
<!-- wp:goblocks/heading {"uniqueId":"pbh2","content":"Counters","tagName":"h2","level":2,"generatedCss":".gb-heading-pbh2{font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 40px;}","blockVersion":1} /-->
<!-- wp:goblocks/grid {"uniqueId":"pbcgrid","tagName":"div","generatedCss":".gb-grid-pbcgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center;}@media(max-width:860px){.gb-grid-pbcgrid{grid-template-columns:repeat(2,1fr);}}","blockVersion":1} -->
<!-- wp:goblocks/counter {"uniqueId":"c1","target":50000,"suffix":"+","duration":2000,"separator":",","decimals":0,"generatedCss":".gb-counter-c1{background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:32px 20px;}.gb-counter-c1 .gb-counter__number{font-size:2.5rem;font-weight:900;color:#4f46e5;}","blockVersion":1} /-->
<!-- wp:goblocks/counter {"uniqueId":"c2","target":99,"suffix":"%","duration":1800,"decimals":0,"generatedCss":".gb-counter-c2{background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:32px 20px;}.gb-counter-c2 .gb-counter__number{font-size:2.5rem;font-weight:900;color:#059669;}","blockVersion":1} /-->
<!-- wp:goblocks/counter {"uniqueId":"c3","target":4.9,"suffix":" ★","duration":1500,"decimals":1,"generatedCss":".gb-counter-c3{background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:32px 20px;}.gb-counter-c3 .gb-counter__number{font-size:2.5rem;font-weight:900;color:#d97706;}","blockVersion":1} /-->
<!-- wp:goblocks/counter {"uniqueId":"c4","target":24,"suffix":"/7","duration":1200,"decimals":0,"generatedCss":".gb-counter-c4{background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:32px 20px;}.gb-counter-c4 .gb-counter__number{font-size:2.5rem;font-weight:900;color:#dc2626;}","blockVersion":1} /-->
<!-- /wp:goblocks/grid -->
<!-- /wp:goblocks/box -->

<!-- wp:goblocks/box {"uniqueId":"pbsec2","tagName":"section","generatedCss":".gb-box-pbsec2{padding:72px 48px;background:#f8fafc;}","blockVersion":1} -->
<!-- wp:goblocks/heading {"uniqueId":"pbh3","content":"Progress Bars","tagName":"h2","level":2,"generatedCss":".gb-heading-pbh3{font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 40px;}","blockVersion":1} /-->
<!-- wp:goblocks/box {"uniqueId":"pbpbox","tagName":"div","generatedCss":".gb-box-pbpbox{max-width:600px;display:flex;flex-direction:column;gap:20px;}","blockVersion":1} -->
<!-- wp:goblocks/progress-bar {"uniqueId":"pb1","label":"Design","value":90,"generatedCss":".gb-progress-pb1 .gb-progress__fill{background:#4f46e5;}","blockVersion":1} /-->
<!-- wp:goblocks/progress-bar {"uniqueId":"pb2","label":"Development","value":75,"generatedCss":".gb-progress-pb2 .gb-progress__fill{background:#0891b2;}","blockVersion":1} /-->
<!-- wp:goblocks/progress-bar {"uniqueId":"pb3","label":"Performance","value":95,"generatedCss":".gb-progress-pb3 .gb-progress__fill{background:#059669;}","blockVersion":1} /-->
<!-- /wp:goblocks/box -->
<!-- /wp:goblocks/box -->

<!-- wp:goblocks/box {"uniqueId":"pbsec3","tagName":"section","generatedCss":".gb-box-pbsec3{padding:72px 48px;background:#fff;}","blockVersion":1} -->
<!-- wp:goblocks/heading {"uniqueId":"pbh4","content":"Alerts","tagName":"h2","level":2,"generatedCss":".gb-heading-pbh4{font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 40px;}","blockVersion":1} /-->
<!-- wp:goblocks/box {"uniqueId":"pbabox","tagName":"div","generatedCss":".gb-box-pbabox{max-width:600px;display:flex;flex-direction:column;gap:12px;}","blockVersion":1} -->
<!-- wp:goblocks/alert {"uniqueId":"a1","alertType":"info","title":"Info Alert","message":"This is an informational notice with useful context.","generatedCss":"","blockVersion":1} /-->
<!-- wp:goblocks/alert {"uniqueId":"a2","alertType":"success","title":"Success!","message":"Your changes have been saved successfully.","generatedCss":"","blockVersion":1} /-->
<!-- wp:goblocks/alert {"uniqueId":"a3","alertType":"warning","title":"Warning","message":"Please review your input before proceeding.","dismissible":true,"generatedCss":"","blockVersion":1} /-->
<!-- wp:goblocks/alert {"uniqueId":"a4","alertType":"error","title":"Error","message":"Something went wrong. Please try again.","generatedCss":"","blockVersion":1} /-->
<!-- /wp:goblocks/box -->
<!-- /wp:goblocks/box -->

<!-- wp:goblocks/box {"uniqueId":"pbsec4","tagName":"section","generatedCss":".gb-box-pbsec4{padding:72px 48px;background:#f8fafc;}","blockVersion":1} -->
<!-- wp:goblocks/heading {"uniqueId":"pbh5","content":"Pricing Cards","tagName":"h2","level":2,"generatedCss":".gb-heading-pbh5{font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 40px;}","blockVersion":1} /-->
<!-- wp:goblocks/grid {"uniqueId":"pbprgrid","tagName":"div","generatedCss":".gb-grid-pbprgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:960px;}@media(max-width:860px){.gb-grid-pbprgrid{grid-template-columns:1fr;}}","blockVersion":1} -->
<!-- wp:goblocks/pricing {"uniqueId":"pr1","planName":"Starter","price":"0","period":"/month","currency":"$","description":"Perfect for personal projects.","features":["5 pages","Basic blocks","Community support"],"ctaText":"Get Started Free","ctaUrl":"#","generatedCss":"","blockVersion":1} /-->
<!-- wp:goblocks/pricing {"uniqueId":"pr2","planName":"Pro","price":"29","period":"/month","currency":"$","description":"Everything for a growing business.","features":["Unlimited pages","All pro blocks","Priority support","Advanced CSS engine"],"ctaText":"Start Pro Trial","ctaUrl":"#","featured":true,"featuredLabel":"Most Popular","generatedCss":"","blockVersion":1} /-->
<!-- wp:goblocks/pricing {"uniqueId":"pr3","planName":"Agency","price":"79","period":"/month","currency":"$","description":"For agencies managing multiple sites.","features":["Unlimited sites","White-label","Dedicated support","Custom branding"],"ctaText":"Contact Sales","ctaUrl":"#","generatedCss":"","blockVersion":1} /-->
<!-- /wp:goblocks/grid -->
<!-- /wp:goblocks/box -->

<!-- wp:goblocks/box {"uniqueId":"pbsec5","tagName":"section","generatedCss":".gb-box-pbsec5{padding:72px 48px;background:#0f172a;}","blockVersion":1} -->
<!-- wp:goblocks/heading {"uniqueId":"pbh6","content":"Countdown Timer","tagName":"h2","level":2,"generatedCss":".gb-heading-pbh6{font-size:1.75rem;font-weight:800;color:#fff;margin:0 0 8px;text-align:center;}","blockVersion":1} /-->
<!-- wp:goblocks/text {"uniqueId":"pbcdsub","content":"Special offer ends soon!","tagName":"p","generatedCss":".gb-text-pbcdsub{font-size:1rem;color:#94a3b8;text-align:center;margin:0 0 40px;}","blockVersion":1} /-->
<!-- wp:goblocks/countdown {"uniqueId":"cd1","targetDate":"2026-12-31T23:59:59","expiredText":"Offer has expired!","generatedCss":".gb-countdown-cd1{justify-content:center;}.gb-countdown-cd1 .gb-countdown__number{color:#4f46e5;background:#1e293b;padding:16px 20px;border-radius:12px;min-width:80px;text-align:center;}.gb-countdown-cd1 .gb-countdown__label{color:#64748b;}","blockVersion":1} /-->
<!-- /wp:goblocks/box -->

<!-- wp:goblocks/box {"uniqueId":"pbsec6","tagName":"section","generatedCss":".gb-box-pbsec6{padding:72px 48px;background:#fff;}","blockVersion":1} -->
<!-- wp:goblocks/heading {"uniqueId":"pbh7","content":"Star Ratings","tagName":"h2","level":2,"generatedCss":".gb-heading-pbh7{font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 40px;}","blockVersion":1} /-->
<!-- wp:goblocks/box {"uniqueId":"pbsrbox","tagName":"div","generatedCss":".gb-box-pbsrbox{display:flex;flex-direction:column;gap:16px;}","blockVersion":1} -->
<!-- wp:goblocks/star-rating {"uniqueId":"sr1","rating":5,"showNumber":true,"label":"GoBlocks","generatedCss":"","blockVersion":1} /-->
<!-- wp:goblocks/star-rating {"uniqueId":"sr2","rating":4.5,"showNumber":true,"label":"Customer Service","generatedCss":"","blockVersion":1} /-->
<!-- wp:goblocks/star-rating {"uniqueId":"sr3","rating":4,"showNumber":true,"label":"Ease of Use","generatedCss":"","blockVersion":1} /-->
<!-- /wp:goblocks/box -->
<!-- /wp:goblocks/box -->

<!-- wp:goblocks/box {"uniqueId":"pbsec7","tagName":"section","generatedCss":".gb-box-pbsec7{padding:72px 48px;background:#f8fafc;}","blockVersion":1} -->
<!-- wp:goblocks/heading {"uniqueId":"pbh8","content":"Flip Cards (hover to reveal)","tagName":"h2","level":2,"generatedCss":".gb-heading-pbh8{font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 40px;}","blockVersion":1} /-->
<!-- wp:goblocks/grid {"uniqueId":"pbfcgrid","tagName":"div","generatedCss":".gb-grid-pbfcgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}@media(max-width:860px){.gb-grid-pbfcgrid{grid-template-columns:1fr;}}","blockVersion":1} -->
<!-- wp:goblocks/flip-card {"uniqueId":"fc1","frontTitle":"Speed","frontContent":"GoBlocks generates pure CSS — no inline styles.","backTitle":"The Result","backContent":"Lightning fast pages with perfect Core Web Vitals.","generatedCss":".gb-flip-card-fc1{min-height:200px;}","blockVersion":1} /-->
<!-- wp:goblocks/flip-card {"uniqueId":"fc2","frontTitle":"Simplicity","frontContent":"Visual controls for every CSS property.","backTitle":"The Result","backContent":"Design beautiful layouts without writing a line of CSS.","generatedCss":".gb-flip-card-fc2{min-height:200px;}","blockVersion":1} /-->
<!-- wp:goblocks/flip-card {"uniqueId":"fc3","frontTitle":"Power","frontContent":"18 free blocks + 17 pro blocks.","backTitle":"The Result","backContent":"Everything you need to build any WordPress site.","generatedCss":".gb-flip-card-fc3{min-height:200px;}","blockVersion":1} /-->
<!-- /wp:goblocks/grid -->
<!-- /wp:goblocks/box -->

<!-- wp:goblocks/box {"uniqueId":"pbsec8","tagName":"section","generatedCss":".gb-box-pbsec8{padding:72px 48px;background:#fff;}","blockVersion":1} -->
<!-- wp:goblocks/heading {"uniqueId":"pbh9","content":"Timeline","tagName":"h2","level":2,"generatedCss":".gb-heading-pbh9{font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 40px;}","blockVersion":1} /-->
<!-- wp:goblocks/timeline {"uniqueId":"tl1","generatedCss":"","blockVersion":1} -->
<!-- wp:goblocks/timeline-item {"uniqueId":"tli1","date":"2023","title":"GoBlocks Founded","content":"The idea for a zero-inline-styles block plugin was born.","generatedCss":"","blockVersion":1} /-->
<!-- wp:goblocks/timeline-item {"uniqueId":"tli2","date":"2024","title":"18 Core Blocks Released","content":"The full suite of layout and content blocks was launched.","generatedCss":"","blockVersion":1} /-->
<!-- wp:goblocks/timeline-item {"uniqueId":"tli3","date":"2025","title":"Pro Blocks Launch","content":"17 premium blocks — Slider, Modal, Pricing, Counter, Countdown, and more.","generatedCss":"","blockVersion":1} /-->
<!-- /wp:goblocks/timeline -->
<!-- /wp:goblocks/box -->

<!-- wp:goblocks/box {"uniqueId":"pbsec9","tagName":"section","generatedCss":".gb-box-pbsec9{padding:72px 48px;background:#4f46e5;text-align:center;}","blockVersion":1} -->
<!-- wp:goblocks/heading {"uniqueId":"pbh10","content":"35 Blocks. Zero Compromises.","tagName":"h2","level":2,"generatedCss":".gb-heading-pbh10{font-size:clamp(1.75rem,3vw,2.5rem);font-weight:900;color:#fff;margin:0 0 16px;}","blockVersion":1} /-->
<!-- wp:goblocks/text {"uniqueId":"pbftr","content":"GoBlocks is the fastest, cleanest block library for WordPress. Start building today.","tagName":"p","generatedCss":".gb-text-pbftr{font-size:1.1rem;color:#c7d2fe;margin:0 0 32px;max-width:480px;margin-left:auto;margin-right:auto;}","blockVersion":1} /-->
<!-- wp:goblocks/button {"uniqueId":"pbfbtn","text":"Get GoBlocks Free","href":"#","generatedCss":".gb-button-pbfbtn{background:#fff;padding:14px 32px;border-radius:10px;font-size:1rem;font-weight:700;text-decoration:none;}.gb-button-pbfbtn .gb-button__text{color:#4f46e5;}","blockVersion":1} /-->
<!-- /wp:goblocks/box -->
';

$id = wp_insert_post( array(
	'post_type'    => 'page',
	'post_status'  => 'publish',
	'post_title'   => 'Pro Blocks Demo',
	'post_name'    => 'pro-blocks-demo',
	'post_content' => $content,
) );

if ( is_wp_error( $id ) ) {
	WP_CLI::error( 'Failed: ' . $id->get_error_message() );
} else {
	WP_CLI::success( 'Created page ID ' . $id . ' at ' . get_permalink( $id ) );
}

<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals
if ( ! defined( 'ABSPATH' ) ) { exit; }
/**
 * GoBlocks Demo Home Page — Professional Redesign v3
 * Run via: wp eval-file wp-content/plugins/goblocks/bin/home-redesign.php
 *
 * Sections:
 *  s1  — Hero (badge, gradient H1, CTA buttons, stats bar)
 *  s2  — Features 3-col cards
 *  s3  — Testimonials 3-col cards
 *  s4  — All 18 Blocks chip grid (6-col)
 *  s5  — Comparison table (GoBlocks vs GenerateBlocks vs Kadence)
 *  s6  — Tabs (Performance / Dev Experience / WP Native)
 *  s7  — How It Works (3 numbered steps)
 *  s8  — FAQ two-column (sticky heading + accordion)
 *  s9  — Blog Posts query
 *  s10 — Dark gradient CTA
 */

// ── Icon SVGs (single-quoted attributes to survive wp_insert_post) ────────
$ico_bolt   = "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' width='28' height='28'><path stroke-linecap='round' stroke-linejoin='round' d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'/></svg>";
$ico_device = "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' width='28' height='28'><path stroke-linecap='round' stroke-linejoin='round' d='M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3'/></svg>";
$ico_tag    = "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' width='28' height='28'><path stroke-linecap='round' stroke-linejoin='round' d='M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L9.568 3z'/><path stroke-linecap='round' stroke-linejoin='round' d='M6 6h.008v.008H6V6z'/></svg>";
$ico_check  = "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' width='18' height='18'><circle cx='10' cy='10' r='10' fill='#dcfce7'/><path stroke='#16a34a' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' d='M6 10l3 3 5-5'/></svg>";
$ico_cross  = "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' width='18' height='18'><circle cx='10' cy='10' r='10' fill='#f1f5f9'/><path stroke='#94a3b8' stroke-width='1.8' stroke-linecap='round' d='M7 7l6 6M13 7l-6 6'/></svg>";
$ico_pro    = "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' width='18' height='18'><circle cx='10' cy='10' r='10' fill='#fef3c7'/><path stroke='#d97706' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' d='M10 5v5l3 2'/></svg>";
$stars      = '&#9733;&#9733;&#9733;&#9733;&#9733;';

$c = '';

// ── Global CSS (injected into first block only) ──────────────────────────
$g  = '.wp-block-post-title,.entry-title{display:none!important}';
$g .= '.wp-block-post-content,.entry-content{overflow:visible!important}';
$g .= 'body{background:#fff}';
$g .= '.wp-block-post-content.has-global-padding,.entry-content.has-global-padding{padding-left:0!important;padding-right:0!important}';
$g .= 'main>.wp-block-group.has-global-padding:first-child{display:none!important}';
$g .= '.wp-block-post-content{margin-top:0!important}';
foreach (['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10'] as $sid) {
    $g .= '.wp-block-post-content .gb-box-'.$sid.'{max-width:none!important;width:100%!important;margin-left:0!important;margin-right:0!important;box-sizing:border-box!important}';
}

// ╔══════════════════════════════════════════════════════════════════╗
//  S1 — HERO
// ╚══════════════════════════════════════════════════════════════════╝
$css  = $g;
$css .= '.gb-box-s1{background:#fff;padding:88px 0 72px;border-bottom:1px solid #f1f5f9;}';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s1","generatedCss":"' . addslashes($css) . '"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s1i","generatedCss":".gb-box-s1i{max-width:820px;margin:0 auto;padding:0 24px;text-align:center;}"} -->';

// Badge
$c .= '<!-- wp:goblocks/box {"uniqueId":"s1bg","generatedCss":".gb-box-s1bg{display:inline-flex;align-items:center;background:#eff6ff;border:1px solid #bfdbfe;padding:5px 14px;border-radius:100px;margin-bottom:32px;}"} -->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s1bgt","content":"&#x2728; 100% Free &middot; 18 Blocks &middot; No Subscription","generatedCss":".gb-text-s1bgt{margin:0;font-size:.75rem;font-weight:700;color:#1d4ed8;letter-spacing:.07em;text-transform:uppercase;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';

// H1 with gradient span
$c .= '<!-- wp:goblocks/heading {"uniqueId":"s1h1","tagName":"h1","content":"18 Premium Blocks.<br><span class=\'gb-grad\'>Zero Bloat.</span>","generatedCss":".gb-heading-s1h1{font-size:clamp(2.8rem,6vw,5rem);font-weight:900;line-height:1.1;letter-spacing:-0.035em;color:#0f172a;margin-bottom:24px;}.gb-heading-s1h1 br{display:block}.gb-grad{background:linear-gradient(135deg,#4f46e5 0%,#0891b2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}"} /-->';

// Subtitle
$c .= '<!-- wp:goblocks/text {"uniqueId":"s1sub","content":"A free Gutenberg block plugin with a TypeScript CSS engine, zero inline styles, and dynamic content tags &mdash; built to outperform the competition.","generatedCss":".gb-text-s1sub{font-size:1.1rem;color:#475569;line-height:1.8;max-width:580px;margin:0 auto 44px;}"} /-->';

// Buttons row
$c .= '<!-- wp:goblocks/box {"uniqueId":"s1btns","generatedCss":".gb-box-s1btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:56px;}"} -->';
$c .= '<!-- wp:goblocks/button {"uniqueId":"s1b1","text":"Get GoBlocks Free &#x2192;","href":"https://wordpress.org/plugins/goblocks/","generatedCss":".gb-button-s1b1{background:#4f46e5;color:#fff;padding:15px 32px;border-radius:10px;font-size:1rem;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(79,70,229,.35);}"} /-->';
$c .= '<!-- wp:goblocks/button {"uniqueId":"s1b2","text":"View on GitHub","href":"https://github.com/godevsltd/goblocks","generatedCss":".gb-button-s1b2{background:#fff;color:#374151;padding:15px 32px;border-radius:10px;font-size:1rem;font-weight:700;text-decoration:none;border:2px solid #e5e7eb;display:inline-flex;align-items:center;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';

// Stats bar
$css_st = '.gb-grid-s1st{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#f1f5f9;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;max-width:560px;margin:0 auto;}';
$c .= '<!-- wp:goblocks/grid {"uniqueId":"s1st","generatedCss":"' . addslashes($css_st) . '"} -->';
foreach ([['18','Blocks','#4f46e5'],['15','Patterns','#0891b2'],['0','Inline Styles','#059669'],['GPLv2','License','#7c3aed']] as [$n,$l,$col]) {
    $uid = 'ss'.md5($n.$l);
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'","generatedCss":".gb-box-'.$uid.'{background:#fff;padding:18px 12px;text-align:center;}"} -->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'n","content":"'.$n.'","generatedCss":".gb-text-'.$uid.'n{font-size:1.4rem;font-weight:800;color:'.$col.';margin:0;line-height:1;}"} /-->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'l","content":"'.$l.'","generatedCss":".gb-text-'.$uid.'l{font-size:.7rem;color:#94a3b8;font-weight:600;letter-spacing:.04em;text-transform:uppercase;margin:4px 0 0;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
}
$c .= '<!-- /wp:goblocks/grid -->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// ╔══════════════════════════════════════════════════════════════════╗
//  S2 — FEATURES (3 cards)
// ╚══════════════════════════════════════════════════════════════════╝
$c .= '<!-- wp:goblocks/box {"uniqueId":"s2","generatedCss":".gb-box-s2{background:#f8fafc;padding:88px 0;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s2i","generatedCss":".gb-box-s2i{max-width:1160px;margin:0 auto;padding:0 40px;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s2hd","generatedCss":".gb-box-s2hd{text-align:center;margin-bottom:56px;}"} -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"s2h","tagName":"h2","content":"Built for Performance. Designed for Flexibility.","generatedCss":".gb-heading-s2h{font-size:clamp(1.9rem,3.5vw,2.75rem);font-weight:800;color:#0f172a;letter-spacing:-0.025em;margin-bottom:12px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s2sub","content":"Three core principles guide every decision in GoBlocks.","generatedCss":".gb-text-s2sub{color:#64748b;font-size:1rem;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/grid {"uniqueId":"s2g","generatedCss":".gb-grid-s2g{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}@media(max-width:860px){.gb-grid-s2g{grid-template-columns:1fr;}}"} -->';
foreach ([
    ['f1','#4f46e5','#eff6ff','#c7d2fe',$ico_bolt,  'Zero Inline Styles','CSS is computed by our TypeScript engine, stored as a block attribute, and served from a cached file. No style= attributes, no render-blocking injection, one clean stylesheet link per page.'],
    ['f2','#0891b2','#ecfeff','#a5f3fc',$ico_device,'Truly Responsive','Every property — spacing, typography, sizing, layout — has independent desktop, tablet, and mobile controls. Design all three breakpoints in one clean inspector panel.'],
    ['f3','#059669','#f0fdf4','#bbf7d0',$ico_tag,   'Dynamic Content','25+ dynamic tags (post title, excerpt, author, date, featured image, custom fields, taxonomy terms) resolve live inside Query blocks. Real post data, no PHP required.'],
] as [$uid,$col,$bg,$bdr,$ico,$title,$body]) {
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'","generatedCss":".gb-box-'.$uid.'{background:#fff;border-radius:16px;padding:36px 32px;border:1px solid #e2e8f0;}"} -->';
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'ic","generatedCss":".gb-box-'.$uid.'ic{width:52px;height:52px;border-radius:12px;background:'.$bg.';border:1px solid '.$bdr.';display:flex;align-items:center;justify-content:center;margin-bottom:20px;color:'.$col.';}"} -->';
    $c .= '<!-- wp:goblocks/icon {"uniqueId":"'.$uid.'i","svgContent":'.json_encode($ico).',"generatedCss":".gb-icon-'.$uid.'i{color:'.$col.';display:block;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
    $c .= '<!-- wp:goblocks/heading {"uniqueId":"'.$uid.'h","tagName":"h3","content":"'.$title.'","generatedCss":".gb-heading-'.$uid.'h{font-size:1.15rem;font-weight:700;color:#0f172a;margin-bottom:10px;}"} /-->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'t","content":"'.$body.'","generatedCss":".gb-text-'.$uid.'t{color:#64748b;line-height:1.75;font-size:.9rem;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
}
$c .= '<!-- /wp:goblocks/grid -->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// ╔══════════════════════════════════════════════════════════════════╗
//  S3 — TESTIMONIALS (3 quote cards)
// ╚══════════════════════════════════════════════════════════════════╝
$c .= '<!-- wp:goblocks/box {"uniqueId":"s3","generatedCss":".gb-box-s3{background:#fff;padding:88px 0;border-top:1px solid #f1f5f9;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s3i","generatedCss":".gb-box-s3i{max-width:1160px;margin:0 auto;padding:0 40px;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s3hd","generatedCss":".gb-box-s3hd{text-align:center;margin-bottom:56px;}"} -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"s3h","tagName":"h2","content":"Trusted by WordPress Developers","generatedCss":".gb-heading-s3h{font-size:clamp(1.9rem,3.5vw,2.6rem);font-weight:800;color:#0f172a;letter-spacing:-0.025em;margin-bottom:12px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s3sub","content":"See why developers choose GoBlocks over the competition.","generatedCss":".gb-text-s3sub{color:#64748b;font-size:1rem;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/grid {"uniqueId":"s3g","generatedCss":".gb-grid-s3g{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}@media(max-width:860px){.gb-grid-s3g{grid-template-columns:1fr;}}"} -->';
foreach ([
    ['tm1','#4f46e5','AM','Alex Morgan','Lead Developer, AgencyXYZ','GoBlocks completely changed how I build client sites. The CSS cache system is brilliant — pages load faster and the HTML stays spotlessly clean. Nothing else comes close.'],
    ['tm2','#0891b2','SL','Sarah Lin','WordPress Freelancer','I tried GenerateBlocks, Kadence, Spectra. GoBlocks is the only one that generates zero inline styles AND has dynamic content that actually works without extra plugins. Genuinely impressed.'],
    ['tm3','#059669','DP','David Park','Performance Engineer','As someone who obsesses over Core Web Vitals, GoBlocks is the first block plugin I can recommend without caveats. One CSS file per page, no render-blocking JS, clean HTML. Done.'],
] as [$uid,$col,$init,$name,$role,$quote]) {
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'","generatedCss":".gb-box-'.$uid.'{background:#f8fafc;border-radius:16px;padding:32px;border:1px solid #e2e8f0;display:flex;flex-direction:column;}"} -->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'st","content":"'.$stars.'","generatedCss":".gb-text-'.$uid.'st{color:#f59e0b;font-size:1rem;letter-spacing:2px;margin-bottom:16px;}"} /-->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'q","content":"&ldquo;'.addslashes($quote).'&rdquo;","generatedCss":".gb-text-'.$uid.'q{color:#374151;font-size:.95rem;line-height:1.75;margin-bottom:24px;flex:1;font-style:italic;}"} /-->';
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'sep","generatedCss":".gb-box-'.$uid.'sep{height:1px;background:#e2e8f0;margin-bottom:20px;}"} --><!-- /wp:goblocks/box -->';
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'au","generatedCss":".gb-box-'.$uid.'au{display:flex;align-items:center;gap:12px;}"} -->';
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'av","generatedCss":".gb-box-'.$uid.'av{width:42px;height:42px;border-radius:50%;background:'.$col.';display:flex;align-items:center;justify-content:center;flex-shrink:0;}"} -->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'ai","content":"'.$init.'","generatedCss":".gb-text-'.$uid.'ai{font-size:.85rem;font-weight:700;color:#fff;margin:0;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'nm","generatedCss":".gb-box-'.$uid.'nm{display:flex;flex-direction:column;gap:2px;}"} -->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'na","content":"'.addslashes($name).'","generatedCss":".gb-text-'.$uid.'na{font-size:.875rem;font-weight:700;color:#0f172a;margin:0;}"} /-->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'ro","content":"'.addslashes($role).'","generatedCss":".gb-text-'.$uid.'ro{font-size:.78rem;color:#94a3b8;margin:0;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
    $c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';
}
$c .= '<!-- /wp:goblocks/grid -->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// ╔══════════════════════════════════════════════════════════════════╗
//  S4 — ALL 18 BLOCKS CHIP GRID
// ╚══════════════════════════════════════════════════════════════════╝
$c .= '<!-- wp:goblocks/box {"uniqueId":"s4","generatedCss":".gb-box-s4{background:#f8fafc;padding:88px 0;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s4i","generatedCss":".gb-box-s4i{max-width:1160px;margin:0 auto;padding:0 40px;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s4hd","generatedCss":".gb-box-s4hd{text-align:center;margin-bottom:48px;}"} -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"s4h","tagName":"h2","content":"All 18 Blocks Included","generatedCss":".gb-heading-s4h{font-size:clamp(1.9rem,3.5vw,2.6rem);font-weight:800;color:#0f172a;letter-spacing:-0.025em;margin-bottom:12px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s4sub","content":"Every block you need. No upsells. No tiers. All free forever.","generatedCss":".gb-text-s4sub{color:#64748b;font-size:1rem;max-width:480px;margin:0 auto;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/grid {"uniqueId":"s4g","generatedCss":".gb-grid-s4g{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;}@media(max-width:1024px){.gb-grid-s4g{grid-template-columns:repeat(4,1fr);}}@media(max-width:640px){.gb-grid-s4g{grid-template-columns:repeat(3,1fr);}}"} -->';
foreach ([
    ['Box','#4f46e5'],['Text','#0891b2'],['Heading','#059669'],['Button','#d97706'],['Image','#dc2626'],['Grid','#7c3aed'],
    ['Icon','#0891b2'],['Shape','#059669'],['Tabs','#4f46e5'],['Tab Panel','#7c3aed'],['Accordion','#0891b2'],['Accordion Item','#059669'],
    ['Query','#4f46e5'],['Query Loop','#d97706'],['No Results','#dc2626'],['Pagination','#7c3aed'],['Separator','#64748b'],['Spacer','#94a3b8'],
] as $i => [$bn,$bc]) {
    $bid = 'bl'.($i+1);
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$bid.'","generatedCss":".gb-box-'.$bid.'{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 10px;display:flex;align-items:center;gap:8px;}"} -->';
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$bid.'d","generatedCss":".gb-box-'.$bid.'d{width:7px;height:7px;border-radius:50%;background:'.$bc.';flex-shrink:0;}"} --><!-- /wp:goblocks/box -->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$bid.'t","content":"'.esc_attr($bn).'","generatedCss":".gb-text-'.$bid.'t{font-size:.82rem;font-weight:600;color:#374151;margin:0;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
}
$c .= '<!-- /wp:goblocks/grid -->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// ╔══════════════════════════════════════════════════════════════════╗
//  S5 — COMPARISON TABLE
// ╚══════════════════════════════════════════════════════════════════╝
$c .= '<!-- wp:goblocks/box {"uniqueId":"s5","generatedCss":".gb-box-s5{background:#fff;padding:88px 0;border-top:1px solid #f1f5f9;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s5i","generatedCss":".gb-box-s5i{max-width:860px;margin:0 auto;padding:0 40px;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s5hd","generatedCss":".gb-box-s5hd{text-align:center;margin-bottom:52px;}"} -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"s5h","tagName":"h2","content":"GoBlocks vs. The Competition","generatedCss":".gb-heading-s5h{font-size:clamp(1.9rem,3.5vw,2.6rem);font-weight:800;color:#0f172a;letter-spacing:-0.025em;margin-bottom:12px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s5sub","content":"See exactly what sets GoBlocks apart on every dimension that matters.","generatedCss":".gb-text-s5sub{color:#64748b;font-size:1rem;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s5tbl","generatedCss":".gb-box-s5tbl{border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;}"} -->';

// Header row
$css_th  = '.gb-grid-s5th{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;}';
$css_th .= '.gb-box-s5thf{padding:16px 20px;background:#0f172a;}.gb-box-s5thg{padding:16px 20px;background:#1e1b4b;}.gb-box-s5thn{padding:16px 20px;background:#0f172a;}.gb-box-s5thk{padding:16px 20px;background:#0f172a;}';
$css_th .= '.gb-text-s5thf,.gb-text-s5thg,.gb-text-s5thn,.gb-text-s5thk{font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin:0;}';
$css_th .= '.gb-text-s5thf{color:#94a3b8;}.gb-text-s5thg{color:#a5b4fc;}.gb-text-s5thn,.gb-text-s5thk{color:#64748b;}';
$c .= '<!-- wp:goblocks/grid {"uniqueId":"s5th","generatedCss":"'.addslashes($css_th).'"} -->';
foreach ([['s5thf','Feature'],['s5thg','GoBlocks'],['s5thn','GenerateBlocks'],['s5thk','Kadence']] as [$uid,$label]) {
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'","generatedCss":""} -->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'t","content":"'.$label.'","generatedCss":""} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
}
$c .= '<!-- /wp:goblocks/grid -->';

// Table data rows
$rows = [
    ['Free forever',               $ico_check,$ico_pro,  $ico_pro  ],
    ['Zero inline styles',         $ico_check,$ico_cross,$ico_cross],
    ['CSS file cache',             $ico_check,$ico_check,$ico_cross],
    ['TypeScript codebase',        $ico_check,$ico_cross,$ico_cross],
    ['18+ blocks included',        $ico_check,$ico_cross,$ico_check],
    ['15+ pattern library',        $ico_check,$ico_check,$ico_check],
    ['Dynamic content tags (25+)', $ico_check,$ico_check,$ico_check],
    ['Per-block responsive CSS',   $ico_check,$ico_check,$ico_check],
];
foreach ($rows as $ri => [$feat,$gb,$gen,$kad]) {
    $bg  = ($ri%2===0) ? '#fff' : '#f9fafb';
    $bgh = ($ri%2===0) ? '#fafaff' : '#f5f5ff';
    $uid = 'tr'.$ri;
    $css_row  = '.gb-grid-'.$uid.'{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;border-top:1px solid #f1f5f9;}';
    $css_row .= '.gb-box-'.$uid.'f{padding:14px 20px;background:'.$bg.';display:flex;align-items:center;}';
    $css_row .= '.gb-box-'.$uid.'g{padding:14px 20px;background:'.$bgh.';display:flex;align-items:center;}';
    $css_row .= '.gb-box-'.$uid.'n{padding:14px 20px;background:'.$bg.';display:flex;align-items:center;}';
    $css_row .= '.gb-box-'.$uid.'k{padding:14px 20px;background:'.$bg.';display:flex;align-items:center;}';
    $c .= '<!-- wp:goblocks/grid {"uniqueId":"'.$uid.'","generatedCss":"'.addslashes($css_row).'"} -->';
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'f","generatedCss":""} -->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'ft","content":"'.addslashes($feat).'","generatedCss":".gb-text-'.$uid.'ft{font-size:.875rem;font-weight:500;color:#374151;margin:0;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
    foreach ([['g',$gb],['n',$gen],['k',$kad]] as [$cell,$icon]) {
        $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.$cell.'","generatedCss":""} -->';
        $c .= '<!-- wp:goblocks/icon {"uniqueId":"'.$uid.$cell.'i","svgContent":'.json_encode($icon).',"generatedCss":".gb-icon-'.$uid.$cell.'i{display:block;width:18px;height:18px;}"} /-->';
        $c .= '<!-- /wp:goblocks/box -->';
    }
    $c .= '<!-- /wp:goblocks/grid -->';
}
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s5note","content":"Pro = paid plan required for core features &middot; Data based on public documentation as of 2026.","generatedCss":".gb-text-s5note{font-size:.78rem;color:#94a3b8;text-align:center;margin-top:16px;}"} /-->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// ╔══════════════════════════════════════════════════════════════════╗
//  S6 — TABS (pill-style, professional)
// ╚══════════════════════════════════════════════════════════════════╝
$c .= '<!-- wp:goblocks/box {"uniqueId":"s6","generatedCss":".gb-box-s6{background:#f8fafc;padding:88px 0;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s6i","generatedCss":".gb-box-s6i{max-width:900px;margin:0 auto;padding:0 40px;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s6hd","generatedCss":".gb-box-s6hd{text-align:center;margin-bottom:44px;}"} -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"s6h","tagName":"h2","content":"Everything a Pro Plugin Should Have","generatedCss":".gb-heading-s6h{font-size:clamp(1.8rem,3vw,2.4rem);font-weight:800;color:#0f172a;letter-spacing:-0.025em;margin-bottom:12px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s6sub","content":"GoBlocks is engineered correctly from the block editor API all the way down to the CSS cache layer.","generatedCss":".gb-text-s6sub{color:#64748b;font-size:1rem;max-width:560px;margin:0 auto;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';

$css_tabs  = '.gb-tabs-s6tabs{background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;}';
$css_tabs .= '.gb-tabs-s6tabs .gb-tabs__tablist{justify-content:center;padding:24px 24px 0;background:#fff;border-bottom:1px solid #f1f5f9;gap:8px;margin-bottom:0;}';
$css_tabs .= '.gb-tabs-s6tabs .gb-tabs__panels{background:#fff;}';
$css_tabs .= '.gb-tabs-s6tabs .gb-tabs__button{padding:10px 24px;font-size:.875rem;font-weight:600;color:#64748b;border:1.5px solid #e2e8f0;border-radius:100px;background:transparent;cursor:pointer;transition:all .2s;margin-bottom:0;}';
$css_tabs .= '.gb-tabs-s6tabs .gb-tabs__button.is-active,.gb-tabs-s6tabs .gb-tabs__button[aria-selected=true]{background:#4f46e5;color:#fff;border-color:#4f46e5;box-shadow:0 2px 8px rgba(79,70,229,.3);}';
$css_tabs .= '.gb-tabs-s6tabs .gb-tabs__button:hover:not(.is-active):not([aria-selected=true]){background:#f8fafc;border-color:#c7d2fe;color:#4f46e5;}';
$c .= '<!-- wp:goblocks/tabs {"uniqueId":"s6tabs","defaultTab":0,"generatedCss":"'.addslashes($css_tabs).'"} -->';

foreach ([
    ['s6t1','Performance','&#9889; Lightning-Fast Page Loads','GoBlocks computes all CSS once when you save a page and stores it as a block attribute. On the frontend, visitors receive a single &lt;link&gt; to a cached CSS file — identical to how any well-built WordPress theme loads its styles.',['One CSS file per page — no inline style= attributes','No render-blocking JavaScript for CSS injection','WP_Filesystem-based file cache with fallback to inline','Background batch regeneration on plugin update'],'#4f46e5'],
    ['s6t2','Developer Experience','&#128187; Built for Developers','GoBlocks is written in strict TypeScript, follows PSR-4 PHP namespacing, and has zero runtime dependencies beyond the block editor. Every REST endpoint is versioned, capability-checked, and follows WordPress REST API conventions.',['TypeScript + Zustand + @tanstack/react-query','PHPStan level 6 — zero suppressed errors','WPCS-compliant PHP — passes phpcs clean','86 PHPUnit tests + 22 Playwright E2E tests'],'#0891b2'],
    ['s6t3','WordPress Native','&#127758; 100% WordPress Native','GoBlocks is a pure Gutenberg plugin — no iframe editors, no proprietary meta boxes, no custom builder canvases. Your content is stored as clean block markup in post_content. Fully portable. Zero vendor lock-in.',['All 18 blocks use standard block.json registration','Dynamic blocks with PHP render callbacks','Context-based inner block communication','Works with any block theme or classic theme'],'#059669'],
] as [$uid,$label,$title,$body,$bullets,$col]) {
    $css_panel = '.gb-tab-panel-'.$uid.'{padding:40px;}';
    $c .= '<!-- wp:goblocks/tab-panel {"uniqueId":"'.$uid.'","label":"'.$label.'","generatedCss":"'.addslashes($css_panel).'"} -->';
    $c .= '<!-- wp:goblocks/grid {"uniqueId":"'.$uid.'g","generatedCss":".gb-grid-'.$uid.'g{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;}@media(max-width:700px){.gb-grid-'.$uid.'g{grid-template-columns:1fr;}}"} -->';
    // Left
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'l","generatedCss":".gb-box-'.$uid.'l{}"} -->';
    $c .= '<!-- wp:goblocks/heading {"uniqueId":"'.$uid.'h","tagName":"h3","content":"'.$title.'","generatedCss":".gb-heading-'.$uid.'h{font-size:1.35rem;font-weight:800;color:#0f172a;margin-bottom:14px;}"} /-->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'b","content":"'.$body.'","generatedCss":".gb-text-'.$uid.'b{color:#475569;line-height:1.75;font-size:.925rem;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
    // Right: bullet cards
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'r","generatedCss":".gb-box-'.$uid.'r{background:#f8fafc;border-radius:12px;padding:24px;border-left:3px solid '.$col.';display:flex;flex-direction:column;gap:12px;}"} -->';
    foreach ($bullets as $bi => $bullet) {
        $bid = $uid.'b'.$bi;
        $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$bid.'","generatedCss":".gb-box-'.$bid.'{display:flex;align-items:center;gap:10px;}"} -->';
        $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$bid.'d","generatedCss":".gb-box-'.$bid.'d{width:8px;height:8px;border-radius:50%;background:'.$col.';flex-shrink:0;}"} --><!-- /wp:goblocks/box -->';
        $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$bid.'t","content":"'.$bullet.'","generatedCss":".gb-text-'.$bid.'t{font-size:.875rem;color:#374151;font-weight:500;margin:0;}"} /-->';
        $c .= '<!-- /wp:goblocks/box -->';
    }
    $c .= '<!-- /wp:goblocks/box -->';
    $c .= '<!-- /wp:goblocks/grid -->';
    $c .= '<!-- /wp:goblocks/tab-panel -->';
}
$c .= '<!-- /wp:goblocks/tabs -->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// ╔══════════════════════════════════════════════════════════════════╗
//  S7 — HOW IT WORKS (3 numbered steps)
// ╚══════════════════════════════════════════════════════════════════╝
$c .= '<!-- wp:goblocks/box {"uniqueId":"s7","generatedCss":".gb-box-s7{background:#fff;padding:88px 0;border-top:1px solid #f1f5f9;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s7i","generatedCss":".gb-box-s7i{max-width:1160px;margin:0 auto;padding:0 40px;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s7hd","generatedCss":".gb-box-s7hd{text-align:center;margin-bottom:60px;}"} -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"s7h","tagName":"h2","content":"Up and Running in Minutes","generatedCss":".gb-heading-s7h{font-size:clamp(1.9rem,3.5vw,2.6rem);font-weight:800;color:#0f172a;letter-spacing:-0.025em;margin-bottom:12px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s7sub","content":"Install from WordPress.org, activate, and start building.","generatedCss":".gb-text-s7sub{color:#64748b;font-size:1rem;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/grid {"uniqueId":"s7g","generatedCss":".gb-grid-s7g{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}@media(max-width:860px){.gb-grid-s7g{grid-template-columns:1fr;}}"} -->';
foreach ([
    ['s7a','1','Install GoBlocks','Search &ldquo;GoBlocks&rdquo; in Plugins &rarr; Add New. One click to install, one click to activate. All 18 blocks appear instantly in the block editor.'],
    ['s7b','2','Design with Blocks','Open any page. Drop in a Box, Grid, Heading, or Button. Every property has per-breakpoint controls &mdash; desktop, tablet, and mobile — all from one inspector.'],
    ['s7c','3','Publish and Perform','Hit Publish. GoBlocks writes one CSS file per page to your uploads folder. Visitors get a single stylesheet link. Zero inline styles. Zero runtime JS.'],
] as [$uid,$num,$title,$body]) {
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'","generatedCss":".gb-box-'.$uid.'{background:#f8fafc;border-radius:16px;padding:36px;border:1px solid #e2e8f0;}"} -->';
    $c .= '<!-- wp:goblocks/box {"uniqueId":"'.$uid.'nb","generatedCss":".gb-box-'.$uid.'nb{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#4f46e5,#0891b2);display:flex;align-items:center;justify-content:center;margin-bottom:22px;}"} -->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'n","content":"'.$num.'","generatedCss":".gb-text-'.$uid.'n{font-size:1rem;font-weight:800;color:#fff;margin:0;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
    $c .= '<!-- wp:goblocks/heading {"uniqueId":"'.$uid.'h","tagName":"h3","content":"'.$title.'","generatedCss":".gb-heading-'.$uid.'h{font-size:1.1rem;font-weight:700;color:#0f172a;margin-bottom:10px;}"} /-->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'t","content":"'.$body.'","generatedCss":".gb-text-'.$uid.'t{color:#64748b;line-height:1.75;font-size:.9rem;}"} /-->';
    $c .= '<!-- /wp:goblocks/box -->';
}
$c .= '<!-- /wp:goblocks/grid -->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// ╔══════════════════════════════════════════════════════════════════╗
//  S8 — FAQ (two-column: sticky heading | accordion)
// ╚══════════════════════════════════════════════════════════════════╝
$c .= '<!-- wp:goblocks/box {"uniqueId":"s8","generatedCss":".gb-box-s8{background:#f8fafc;padding:88px 0;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s8i","generatedCss":".gb-box-s8i{max-width:1060px;margin:0 auto;padding:0 40px;}"} -->';
$c .= '<!-- wp:goblocks/grid {"uniqueId":"s8g","generatedCss":".gb-grid-s8g{display:grid;grid-template-columns:1fr 1.6fr;gap:64px;align-items:start;}@media(max-width:860px){.gb-grid-s8g{grid-template-columns:1fr;}}"} -->';
// Left
$c .= '<!-- wp:goblocks/box {"uniqueId":"s8l","generatedCss":".gb-box-s8l{position:sticky;top:120px;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s8lb","generatedCss":".gb-box-s8lb{display:inline-flex;background:#eff6ff;border-radius:100px;padding:4px 12px;margin-bottom:16px;}"} -->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s8lbt","content":"FAQ","generatedCss":".gb-text-s8lbt{font-size:.72rem;font-weight:700;color:#4f46e5;letter-spacing:.07em;text-transform:uppercase;margin:0;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"s8lh","tagName":"h2","content":"Common Questions","generatedCss":".gb-heading-s8lh{font-size:clamp(1.9rem,3.5vw,2.4rem);font-weight:800;color:#0f172a;letter-spacing:-0.025em;margin-bottom:14px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s8lt","content":"Can\'t find your answer? Open a thread on the WordPress.org support forum and we\'ll respond within 24 hours.","generatedCss":".gb-text-s8lt{color:#64748b;line-height:1.75;font-size:.95rem;margin-bottom:28px;}"} /-->';
$c .= '<!-- wp:goblocks/button {"uniqueId":"s8lb2","text":"Open Support Forum","href":"https://wordpress.org/support/plugin/goblocks/","generatedCss":".gb-button-s8lb2{display:inline-flex;background:#4f46e5;color:#fff;padding:12px 22px;border-radius:8px;font-size:.875rem;font-weight:700;text-decoration:none;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
// Right: accordion
$css_acc = '.gb-accordion-s8acc{background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;}';
$c .= '<!-- wp:goblocks/accordion {"uniqueId":"s8acc","generatedCss":"'.addslashes($css_acc).'"} -->';
foreach ([
    ['s8q1','Is GoBlocks really free?','Yes — completely free and open source under GPLv2. Available on the WordPress.org plugin directory with no premium tiers, license keys, or features behind a paywall. Ever.'],
    ['s8q2','Does it slow down my site?','No. GoBlocks generates CSS once per page-save and caches it as a static file in your uploads folder. Visitors receive a single stylesheet link. No JavaScript style injection. No inline styles.'],
    ['s8q3','Will it work with my theme?','Yes. All GoBlocks CSS selectors are scoped with unique per-block IDs (.gb-box-abc123) so there are zero conflicts with theme styles. Works with any block theme or classic theme.'],
    ['s8q4','Can I use it with other block plugins?','Yes. GoBlocks blocks coexist with any Gutenberg-compatible block — core blocks, WooCommerce blocks, or other third-party block plugins. No conflicts.'],
    ['s8q5','How does the CSS engine work?','When you edit a block, a TypeScript CssEngine computes the CSS for that block and stores it in the generatedCss attribute. On save, PHP collects all generatedCss values, writes one CSS file per page to uploads/goblocks/, and links it in wp_head.'],
] as [$uid,$q,$a]) {
    $css_item  = '.gb-accordion-item-'.$uid.'{border-bottom:1px solid #f1f5f9;}';
    $css_item .= '.gb-accordion-item-'.$uid.':last-child{border-bottom:none;}';
    $css_item .= '.gb-accordion-item-'.$uid.' .gb-accordion-item__trigger{padding:18px 24px;font-weight:600;font-size:.95rem;color:#0f172a;cursor:pointer;display:flex;justify-content:space-between;align-items:center;width:100%;background:none;border:none;text-align:left;}';
    $c .= '<!-- wp:goblocks/accordion-item {"uniqueId":"'.$uid.'","question":"'.addslashes($q).'","generatedCss":"'.addslashes($css_item).'"} -->';
    $c .= '<!-- wp:goblocks/text {"uniqueId":"'.$uid.'t","content":"'.addslashes($a).'","generatedCss":".gb-text-'.$uid.'t{color:#475569;line-height:1.75;font-size:.9rem;padding:0 24px 20px;}"} /-->';
    $c .= '<!-- /wp:goblocks/accordion-item -->';
}
$c .= '<!-- /wp:goblocks/accordion -->';
$c .= '<!-- /wp:goblocks/grid -->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// ╔══════════════════════════════════════════════════════════════════╗
//  S9 — BLOG POSTS (Query block)
// ╚══════════════════════════════════════════════════════════════════╝
$c .= '<!-- wp:goblocks/box {"uniqueId":"s9","generatedCss":".gb-box-s9{background:#fff;padding:88px 0;border-top:1px solid #f1f5f9;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s9i","generatedCss":".gb-box-s9i{max-width:1160px;margin:0 auto;padding:0 40px;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s9hd","generatedCss":".gb-box-s9hd{text-align:center;margin-bottom:52px;}"} -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"s9h","tagName":"h2","content":"Latest from the Blog","generatedCss":".gb-heading-s9h{font-size:clamp(1.9rem,3.5vw,2.6rem);font-weight:800;color:#0f172a;letter-spacing:-0.025em;margin-bottom:12px;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s9sub","content":"Tutorials, release notes, and tips for getting the most from GoBlocks.","generatedCss":".gb-text-s9sub{color:#64748b;font-size:1rem;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/query {"uniqueId":"s9q","query":{"perPage":3,"orderBy":"date","order":"DESC","postType":"post"},"generatedCss":".gb-query-s9q{}"} -->';
$c .= '<!-- wp:goblocks/query-loop {"uniqueId":"s9ql","generatedCss":".gb-query-loop-s9ql{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}@media(max-width:860px){.gb-query-loop-s9ql{grid-template-columns:1fr;}}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s9card","generatedCss":".gb-box-s9card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:28px;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s9tag","generatedCss":".gb-box-s9tag{display:inline-flex;background:#eff6ff;border-radius:6px;padding:3px 10px;margin-bottom:14px;}"} -->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s9tagt","content":"Article","generatedCss":".gb-text-s9tagt{font-size:.72rem;font-weight:700;color:#4f46e5;letter-spacing:.06em;text-transform:uppercase;margin:0;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"s9ct","tagName":"h3","content":"Post Title","generatedCss":".gb-heading-s9ct{font-size:1rem;font-weight:700;color:#0f172a;margin-bottom:10px;line-height:1.4;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s9ce","content":"A brief excerpt from the post appears here, giving readers a preview of what to expect.","generatedCss":".gb-text-s9ce{color:#64748b;font-size:.875rem;line-height:1.65;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- /wp:goblocks/query-loop -->';
$c .= '<!-- wp:goblocks/query-no-results {"uniqueId":"s9qnr","generatedCss":".gb-query-no-results-s9qnr{text-align:center;padding:60px 0;}"} -->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s9qnrt","content":"No posts published yet. Come back soon.","generatedCss":".gb-text-s9qnrt{color:#94a3b8;font-size:1rem;}"} /-->';
$c .= '<!-- /wp:goblocks/query-no-results -->';
$c .= '<!-- wp:goblocks/pagination {"uniqueId":"s9pag","generatedCss":".gb-pagination-s9pag{display:flex;justify-content:center;margin-top:44px;gap:8px;}"} /-->';
$c .= '<!-- /wp:goblocks/query -->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// ╔══════════════════════════════════════════════════════════════════╗
//  S10 — DARK GRADIENT CTA
// ╚══════════════════════════════════════════════════════════════════╝
$c .= '<!-- wp:goblocks/box {"uniqueId":"s10","generatedCss":".gb-box-s10{background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%);padding:100px 0;}"} -->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s10i","generatedCss":".gb-box-s10i{max-width:600px;margin:0 auto;padding:0 32px;text-align:center;}"} -->';
$c .= '<!-- wp:goblocks/heading {"uniqueId":"s10h","tagName":"h2","content":"Start Building Today.<br><span class=\'gb-cta-acc\'>It is Free Forever.</span>","generatedCss":".gb-heading-s10h{font-size:clamp(2rem,4vw,3rem);font-weight:900;color:#fff;letter-spacing:-0.03em;margin-bottom:16px;line-height:1.1;}.gb-heading-s10h br{display:block}.gb-cta-acc{background:linear-gradient(90deg,#818cf8,#67e8f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}"} /-->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s10sub","content":"No subscription. No account. No vendor lock-in. Just 18 premium blocks, free from WordPress.org.","generatedCss":".gb-text-s10sub{color:#94a3b8;font-size:1.05rem;line-height:1.7;margin-bottom:40px;}"} /-->';
$c .= '<!-- wp:goblocks/box {"uniqueId":"s10btns","generatedCss":".gb-box-s10btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}"} -->';
$c .= '<!-- wp:goblocks/button {"uniqueId":"s10b1","text":"Download Free from WordPress.org","href":"https://wordpress.org/plugins/goblocks/","generatedCss":".gb-button-s10b1{background:linear-gradient(135deg,#4f46e5,#0891b2);color:#fff;padding:16px 32px;border-radius:10px;font-weight:700;font-size:1rem;text-decoration:none;display:inline-flex;align-items:center;}"} /-->';
$c .= '<!-- /wp:goblocks/box -->';
$c .= '<!-- wp:goblocks/text {"uniqueId":"s10note","content":"Works with WordPress 6.3+ &middot; PHP 8.0+ &middot; Any theme","generatedCss":".gb-text-s10note{color:#475569;font-size:.8rem;margin-top:20px;}"} /-->';
$c .= '<!-- /wp:goblocks/box --><!-- /wp:goblocks/box -->';

// ── Create the page ────────────────────────────────────────────────────────
$existing = get_posts(['post_type'=>'page','post_status'=>['publish','draft'],'numberposts'=>20]);
foreach ($existing as $p) {
    if (stripos($p->post_title,'home') !== false || $p->ID === (int)get_option('page_on_front')) {
        wp_delete_post($p->ID, true);
        WP_CLI::log("Deleted: #{$p->ID} — {$p->post_title}");
    }
}

$page_id = wp_insert_post([
    'post_title'   => 'Home',
    'post_content' => $c,
    'post_status'  => 'publish',
    'post_type'    => 'page',
    'post_author'  => 1,
    'post_name'    => 'home',
]);
if (is_wp_error($page_id)) { WP_CLI::error($page_id->get_error_message()); }

update_option('show_on_front', 'page');
update_option('page_on_front', $page_id);

// Clear GoBlocks CSS cache
$upload = wp_upload_dir();
$dir    = trailingslashit($upload['basedir']) . 'goblocks/';
if (is_dir($dir)) { array_map('unlink', glob($dir . 'post-*.css')); }

WP_CLI::success("Home page created — ID: {$page_id}");
WP_CLI::log("Visit: http://localhost:8888/");
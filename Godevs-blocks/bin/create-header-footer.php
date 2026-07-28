<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals
if ( ! defined( 'ABSPATH' ) ) { exit; }
/**
 * Create GoBlocks-branded header + footer template parts.
 * Run via: wp eval-file wp-content/plugins/goblocks/bin/create-header-footer.php
 *
 * Overwrites TT24's header and footer with GoBlocks-branded versions.
 * Theme: twentytwentyfour
 */

// ── SVG logo mark ──────────────────────────────────────────────────────────
$logo_svg = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="28" rx="7" fill="#4f46e5"/><path d="M8 8h5.5a4.5 4.5 0 0 1 0 9H8V8Z" fill="white" opacity=".9"/><path d="M14 14h2a3 3 0 0 1 0 6h-2v-6Z" fill="white"/></svg>';

// ── HEADER ──────────────────────────────────────────────────────────────────
// Uses a mix of core blocks to avoid GoBlocks CSS dependency in template parts.
$header_content = '<!-- wp:group {"tagName":"header","style":{"border":{"bottom":{"color":"#e2e8f0","style":"solid","width":"1px"}},"spacing":{"padding":{"top":"0","bottom":"0"}}},"backgroundColor":"base","layout":{"type":"default"}} -->';
$header_content .= '<header class="wp-block-group has-base-background-color has-background" style="border-bottom-color:#e2e8f0;border-bottom-style:solid;border-bottom-width:1px;padding-top:0;padding-bottom:0;">';

$header_content .= '<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}},"layout":{"selfStretch":"fill","flexSize":null}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->';
$header_content .= '<div class="wp-block-group" style="padding-top:16px;padding-bottom:16px;padding-left:40px;padding-right:40px;">';

// Logo + brand name
$header_content .= '<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"10px"}}} -->';
$header_content .= '<div class="wp-block-group" style="gap:10px;align-items:center;">';
$header_content .= '<!-- wp:html -->' . "\n" . $logo_svg . "\n" . '<!-- /wp:html -->';
$header_content .= '<!-- wp:paragraph {"style":{"typography":{"fontWeight":"800","fontSize":"1.15rem","letterSpacing":"-0.01em"},"color":{"text":"#0f172a"}}} -->';
$header_content .= '<p style="font-weight:800;font-size:1.15rem;letter-spacing:-0.01em;color:#0f172a;margin:0;">GoBlocks</p>';
$header_content .= '<!-- /wp:paragraph -->';
$header_content .= '</div>';
$header_content .= '<!-- /wp:group -->';

// Center nav links
$header_content .= '<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"0"}}} -->';
$header_content .= '<div class="wp-block-group">';
foreach ([['Features','#s2'],['Blocks','#all-blocks'],['Patterns','#patterns'],['Docs','https://wordpress.org/plugins/goblocks/']] as [$label,$href]) {
    $header_content .= '<!-- wp:paragraph {"style":{"typography":{"fontWeight":"500","fontSize":"0.9rem"},"color":{"text":"#374151"}}} -->';
    $header_content .= '<p style="margin:0;"><a href="' . esc_attr($href) . '" style="color:#374151;text-decoration:none;padding:8px 16px;display:inline-block;border-radius:6px;font-weight:500;font-size:.9rem;transition:color .15s,background .15s;" onmouseover="this.style.color=\'#4f46e5\';this.style.background=\'#eff6ff\'" onmouseout="this.style.color=\'#374151\';this.style.background=\'transparent\'">' . esc_html($label) . '</a></p>';
    $header_content .= '<!-- /wp:paragraph -->';
}
$header_content .= '</div>';
$header_content .= '<!-- /wp:group -->';

// CTA button
$header_content .= '<!-- wp:buttons -->';
$header_content .= '<div class="wp-block-buttons">';
$header_content .= '<!-- wp:button {"backgroundColor":"primary","textColor":"base","style":{"border":{"radius":"8px"},"typography":{"fontWeight":"700","fontSize":"0.875rem"},"spacing":{"padding":{"top":"10px","bottom":"10px","left":"20px","right":"20px"}}}} -->';
$header_content .= '<div class="wp-block-button"><a class="wp-block-button__link has-primary-background-color has-base-text-color wp-element-button" href="https://wordpress.org/plugins/goblocks/" style="background:#4f46e5;color:#fff;border-radius:8px;font-weight:700;font-size:.875rem;padding:10px 20px;text-decoration:none;">Get Free →</a></div>';
$header_content .= '<!-- /wp:button -->';
$header_content .= '</div>';
$header_content .= '<!-- /wp:buttons -->';

$header_content .= '</div>';
$header_content .= '<!-- /wp:group -->';
$header_content .= '</header>';
$header_content .= '<!-- /wp:group -->';

// ── FOOTER ──────────────────────────────────────────────────────────────────
$footer_content = '<!-- wp:group {"tagName":"footer","style":{"color":{"background":"#0f172a","text":"#94a3b8"},"spacing":{"padding":{"top":"0","bottom":"0"}}},"layout":{"type":"default"}} -->';
$footer_content .= '<footer class="wp-block-group has-background" style="background:#0f172a;color:#94a3b8;padding:0;">';

// Main footer columns
$footer_content .= '<!-- wp:group {"style":{"spacing":{"padding":{"top":"64px","bottom":"48px","left":"40px","right":"40px"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"top"}} -->';
$footer_content .= '<div class="wp-block-group" style="padding:64px 40px 48px;">';

// Col 1: Brand
$footer_content .= '<!-- wp:group {"style":{"spacing":{"blockGap":"14px"}}} -->';
$footer_content .= '<div class="wp-block-group" style="gap:14px;">';
$footer_content .= '<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"10px"}}} -->';
$footer_content .= '<div class="wp-block-group">';
$footer_content .= '<!-- wp:html -->' . "\n" . $logo_svg . "\n" . '<!-- /wp:html -->';
$footer_content .= '<!-- wp:paragraph {"style":{"typography":{"fontWeight":"800","fontSize":"1.1rem"},"color":{"text":"#ffffff"}}} -->';
$footer_content .= '<p style="font-weight:800;font-size:1.1rem;color:#fff;margin:0;">GoBlocks</p>';
$footer_content .= '<!-- /wp:paragraph -->';
$footer_content .= '</div><!-- /wp:group -->';
$footer_content .= '<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem","lineHeight":"1.7"},"color":{"text":"#64748b"},"layout":{"wideSize":"200px"}}} -->';
$footer_content .= '<p style="font-size:.85rem;line-height:1.7;color:#64748b;max-width:220px;margin:0;">18 premium Gutenberg blocks. Zero inline styles. 100% free forever.</p>';
$footer_content .= '<!-- /wp:paragraph -->';
// Social icons row (text links)
$footer_content .= '<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"},"style":{"spacing":{"blockGap":"12px"}}} -->';
$footer_content .= '<div class="wp-block-group" style="margin-top:8px;">';
foreach ([['WP','https://wordpress.org/plugins/goblocks/'],['GitHub','https://github.com/godevsltd/goblocks'],['Twitter','https://twitter.com/']] as [$n,$h]) {
    $footer_content .= '<!-- wp:paragraph --><p style="margin:0;"><a href="' . esc_attr($h) . '" style="color:#475569;font-size:.8rem;font-weight:600;text-decoration:none;">' . esc_html($n) . '</a></p><!-- /wp:paragraph -->';
}
$footer_content .= '</div><!-- /wp:group -->';
$footer_content .= '</div><!-- /wp:group -->';

// Cols 2-4: Link columns
$cols = [
    'Plugin'    => [['Features','#s2'],['All Blocks','#all-blocks'],['15 Patterns','#patterns'],['Changelog','https://wordpress.org/plugins/goblocks/#developers']],
    'Resources' => [['Documentation','https://wordpress.org/plugins/goblocks/'],['Getting Started','https://wordpress.org/plugins/goblocks/'],['Support Forum','https://wordpress.org/support/plugin/goblocks/'],['Report a Bug','https://github.com/godevsltd/goblocks/issues']],
    'Legal'     => [['WordPress.org','https://wordpress.org/plugins/goblocks/'],['GPLv2 License','https://www.gnu.org/licenses/gpl-2.0.html'],['Privacy Policy','#'],['Open Source','https://github.com/godevsltd/goblocks']],
];
foreach ($cols as $heading => $links) {
    $footer_content .= '<!-- wp:group {"style":{"spacing":{"blockGap":"12px"}}} -->';
    $footer_content .= '<div class="wp-block-group">';
    $footer_content .= '<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","fontSize":"0.8rem","letterSpacing":"0.07em","textTransform":"uppercase"},"color":{"text":"#f8fafc"}}} -->';
    $footer_content .= '<p style="font-weight:700;font-size:.8rem;letter-spacing:.07em;text-transform:uppercase;color:#f8fafc;margin:0 0 4px;">' . esc_html($heading) . '</p>';
    $footer_content .= '<!-- /wp:paragraph -->';
    foreach ($links as [$label,$href]) {
        $footer_content .= '<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.875rem"},"color":{"text":"#64748b"}}} -->';
        $footer_content .= '<p style="font-size:.875rem;margin:0;"><a href="' . esc_attr($href) . '" style="color:#64748b;text-decoration:none;font-size:.875rem;">' . esc_html($label) . '</a></p>';
        $footer_content .= '<!-- /wp:paragraph -->';
    }
    $footer_content .= '</div><!-- /wp:group -->';
}

$footer_content .= '</div><!-- /wp:group -->';

// Bottom bar
$footer_content .= '<!-- wp:group {"style":{"border":{"top":{"color":"#1e293b","style":"solid","width":"1px"}},"spacing":{"padding":{"top":"20px","bottom":"20px","left":"40px","right":"40px"}}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"wrap"}} -->';
$footer_content .= '<div class="wp-block-group" style="border-top:1px solid #1e293b;padding:20px 40px;">';
$footer_content .= '<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.8rem"},"color":{"text":"#475569"}}} -->';
$footer_content .= '<p style="font-size:.8rem;color:#475569;margin:0;">© ' . gmdate('Y') . ' GoBlocks. Released under <a href="https://www.gnu.org/licenses/gpl-2.0.html" style="color:#64748b;">GPLv2</a>.</p>';
$footer_content .= '<!-- /wp:paragraph -->';
$footer_content .= '<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.8rem"},"color":{"text":"#475569"}}} -->';
$footer_content .= '<p style="font-size:.8rem;color:#475569;margin:0;">Built with ❤️ for the WordPress community.</p>';
$footer_content .= '<!-- /wp:paragraph -->';
$footer_content .= '</div><!-- /wp:group -->';

$footer_content .= '</footer>';
$footer_content .= '<!-- /wp:group -->';

// ── Insert / Update template parts ─────────────────────────────────────────
// WordPress matches DB template parts by:
//   post_name = slug (e.g. 'header'), post_type = wp_template_part,
//   taxonomy wp_theme = theme slug (e.g. 'twentytwentyfour')
// The '//'' format is only used as an external ID string, NOT as post_name.

foreach ([
    ['header', 'Header', 'header', $header_content],
    ['footer', 'Footer', 'footer', $footer_content],
] as [$slug, $title, $area, $content]) {

    // Delete all existing wp_template_part posts for this slug+theme
    $existing = get_posts([
        'post_type'   => 'wp_template_part',
        'post_status' => ['publish','draft','auto-draft'],
        'numberposts' => 20,
        'fields'      => 'ids',
    ]);
    foreach ($existing as $pid) {
        $pname = get_post_field('post_name', $pid);
        // Match both 'header' and 'twentytwentyfour-header' (old bad slugs)
        if ($pname === $slug || $pname === "twentytwentyfour-{$slug}" || $pname === "twentytwentyfour//{$slug}") {
            wp_delete_post($pid, true);
            WP_CLI::log("Deleted old template part: #{$pid} ({$pname})");
        }
    }

    // Insert with correct post_name = just the slug
    $id = wp_insert_post([
        'post_type'    => 'wp_template_part',
        'post_status'  => 'publish',
        'post_title'   => $title,
        'post_name'    => $slug,  // Must be JUST the slug, e.g. 'header'
        'post_content' => $content,
    ]);

    if (is_wp_error($id)) {
        WP_CLI::error("Failed to create {$slug}: " . $id->get_error_message());
        continue;
    }

    // Set the wp_theme taxonomy term (this is how WordPress matches DB to theme)
    wp_set_object_terms($id, 'twentytwentyfour', 'wp_theme');

    // Set area taxonomy (wp_template_part_area)
    wp_set_object_terms($id, $area, 'wp_template_part_area');

    // Also store as post_meta for compatibility
    update_post_meta($id, 'area', $area);
    update_post_meta($id, 'theme', 'twentytwentyfour');

    // Verify
    $saved = get_post($id);
    WP_CLI::success("Created {$slug} template part — ID: {$id}, post_name: {$saved->post_name}");
}

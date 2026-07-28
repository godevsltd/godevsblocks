<?php
/**
 * Default plugin settings values.
 *
 * @package GoBlocks\Settings
 */

namespace GoBlocks\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Single source of truth for all plugin setting defaults.
 *
 * Any key returned here must also be declared in Schema::get().
 * Values must be valid according to their schema type and constraints.
 */
final class Defaults {

	/**
	 * Return the full default settings array.
	 *
	 * @return array<string, mixed>
	 */
	public static function get(): array {
		return array(
			// ── Layout ───────────────────────────────────────────────────────.
			'container_width'      => 1200,

			// ── CSS output ───────────────────────────────────────────────────.
			// 'file'   → write CSS to uploads/goblocks/{post_id}.css.
			// 'inline' → print <style> in <head> as fallback.
			'css_print_method'     => 'file',

			// ── Responsive breakpoints (min-width, mobile-first) ─────────────.
			'breakpoints'          => array(
				'xs'  => 480,
				'sm'  => 640,
				'md'  => 768,
				'lg'  => 1024,
				'xl'  => 1280,
				'2xl' => 1536,
			),

			// ── Editor behaviour ─────────────────────────────────────────────.
			'sync_responsive'      => true,   // Mirror WP preview device to active breakpoint.

			// ── Fonts ────────────────────────────────────────────────────────.
			'disable_google_fonts' => false,

			// ── Dark mode ────────────────────────────────────────────────────.
			'enable_dark_mode'     => false,

			// ── Global color palette ─────────────────────────────────────────.
			// Array of { slug, name, color } objects (same shape as theme.json palette).
			'global_color_palette' => array(),

			// ── Global typography presets ────────────────────────────────────.
			// Array of { slug, label, fontFamily, fontSize, fontWeight, lineHeight }.
			'global_typography'    => array(),
		);
	}
}

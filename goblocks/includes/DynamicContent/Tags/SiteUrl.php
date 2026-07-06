<?php
/**
 * Resolves the site URL from WordPress settings.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Resolves the site URL from WordPress settings.
 */
class SiteUrl extends TagBase {
	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'site_url'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Site URL', 'goblocks' ); }
	/**
	 * Group for the tag picker.
	 *
	 * @return string
	 */
	public function get_category(): string {
		return 'site'; }
	/**
	 * Short description for the tag picker tooltip.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return __( 'The base URL of the site.', 'goblocks' ); }
	/**
	 * Declared option schema.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public function get_options(): array {
		return array(); }
	/**
	 * Contexts in which this tag is valid.
	 *
	 * @return string[]
	 */
	public function get_contexts(): array {
		return array( 'any' ); }
	/**
	 * Output escape type applied after resolve().
	 *
	 * @return string
	 */
	public function get_escape_type(): string {
		return 'url'; }

	/**
	 * Resolve the tag to a string for frontend output.
	 *
	 * @param  array<string, mixed>  $context Dynamic content context.
	 * @param  array<string, string> $options Parsed option key→value pairs.
	 * @return string Unescaped resolved value.
	 */
	public function resolve( array $context, array $options ): string {
		return (string) home_url( '/' );
	}
}

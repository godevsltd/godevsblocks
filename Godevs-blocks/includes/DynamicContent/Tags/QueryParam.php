<?php
/**
 * Resolves a URL query-string parameter from the current request.
 *
 * @package GoBlocks\DynamicContent\Tags
 */

namespace GoBlocks\DynamicContent\Tags;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\TagBase;

/**
 * Reads a URL query string parameter ($_GET), NOT $_SERVER.
 * Strongly sanitized — only alphanumeric/hyphen/underscore keys allowed.
 */
class QueryParam extends TagBase {
	/**
	 * Unique machine-readable slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'query_param'; }
	/**
	 * Human-readable label shown in the tag picker.
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'URL Query Param', 'godevs-block-library' ); }
	/**
	 * Group for the tag picker.
	 *
	 * @return string
	 */
	public function get_category(): string {
		return 'query'; }
	/**
	 * Short description for the tag picker tooltip.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return __( 'A value from the URL query string (?key=value).', 'godevs-block-library' ); }
	/**
	 * Output escape type applied after resolve().
	 *
	 * @return string
	 */
	public function get_escape_type(): string {
		return 'html'; }
	/**
	 * Contexts in which this tag is valid.
	 *
	 * @return string[]
	 */
	public function get_contexts(): array {
		return array( 'any' ); }

	/**
	 * Declared option schema.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public function get_options(): array {
		return array(
			array(
				'key'         => 'key',
				'type'        => 'string',
				'default'     => '',
				'description' => __( 'Query parameter name (required).', 'godevs-block-library' ),
			),
			array(
				'key'         => 'fallback',
				'type'        => 'string',
				'default'     => '',
				'description' => __( 'Value when parameter is absent.', 'godevs-block-library' ),
			),
		);
	}

	/**
	 * Resolve the tag to a string for frontend output.
	 *
	 * @param  array<string, mixed>  $context Dynamic content context.
	 * @param  array<string, string> $options Parsed option key→value pairs.
	 * @return string Unescaped resolved value.
	 */
	public function resolve( array $context, array $options ): string {
		$key = $this->opt( 'key', $options );

		// Key must be safe: alphanumeric + underscore + hyphen only.
		if ( ! preg_match( '/^[a-zA-Z0-9_-]+$/', $key ) ) {
			return '';
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$raw = sanitize_text_field( wp_unslash( $_GET[ $key ] ?? '' ) );

		if ( '' === $raw ) {
			return $this->opt( 'fallback', $options );
		}

		return $raw;
	}
}

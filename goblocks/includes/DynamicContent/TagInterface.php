<?php
/**
 * Tag Interface.
 *
 * @package GoBlocks\DynamicContent
 */

namespace GoBlocks\DynamicContent;

defined( 'ABSPATH' ) || exit;

/**
 * Contract every dynamic content tag must fulfil.
 */
interface TagInterface {

	/**
	 * Unique machine-readable slug.  Pattern: [a-z][a-z0-9_]*.
	 */
	public function get_slug(): string;

	/** Human-readable label shown in the tag picker. */
	public function get_label(): string;

	/**
	 * Group for the tag picker.
	 * One of: 'post' | 'author' | 'term' | 'user' | 'site' | 'date' | 'query'.
	 */
	public function get_category(): string;

	/** Short description for the tag picker tooltip. */
	public function get_description(): string;

	/**
	 * Declared option schema.
	 *
	 * Each entry:
	 * [
	 *   'key'         => string,             // option key
	 *   'type'        => 'string'|'int'|'bool',
	 *   'default'     => mixed,
	 *   'description' => string,
	 * ]
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public function get_options(): array;

	/**
	 * Contexts in which this tag is valid.
	 * One or more of: 'loop' | 'single' | 'archive' | 'any'.
	 *
	 * @return string[]
	 */
	public function get_contexts(): array;

	/**
	 * Output escape type applied AFTER resolve() returns.
	 * One of: 'html' | 'attr' | 'url' | 'raw'.
	 * 'raw' still runs through wp_kses_post() — 'none' is not allowed.
	 */
	public function get_escape_type(): string;

	/**
	 * Resolve the tag to a string for frontend output.
	 *
	 * @param  array<string, mixed>  $context Dynamic content context (post_id, is_loop, …).
	 * @param  array<string, string> $options Parsed option key→value from the tag string.
	 * @return string  Unescaped resolved value; TagRegistry applies escaping.
	 */
	public function resolve( array $context, array $options ): string;

	/**
	 * Return a preview value for the editor REST endpoint.
	 *
	 * May differ from resolve() (e.g., truncated, placeholder-safe).
	 *
	 * @param  array<string, mixed>  $context Dynamic content context.
	 * @param  array<string, string> $options Parsed option key-value pairs.
	 * @return string                         Preview value for the editor.
	 */
	public function preview( array $context, array $options ): string;
}

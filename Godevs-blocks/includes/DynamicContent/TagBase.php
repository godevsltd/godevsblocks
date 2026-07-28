<?php
/**
 * Tag Base.
 *
 * @package GoBlocks\DynamicContent
 */

namespace GoBlocks\DynamicContent;

defined( 'ABSPATH' ) || exit;

/**
 * Abstract base providing shared helpers for all tag implementations.
 *
 * Concrete tags only need to implement get_slug(), get_label(),
 * get_category(), get_description(), get_options(), get_contexts(),
 * get_escape_type(), and resolve(). The default preview() delegates
 * to resolve(), which is sufficient for most tags.
 */
abstract class TagBase implements TagInterface {

	/**
	 * Default preview delegates to resolve().
	 *
	 * @param  array<string, mixed>  $context Dynamic content context.
	 * @param  array<string, string> $options Parsed option key-value pairs.
	 * @return string                         Resolved preview value.
	 */
	public function preview( array $context, array $options ): string {
		return $this->resolve( $context, $options );
	}

	// ── Protected helpers ─────────────────────────────────────────────────────.

	/**
	 * Get the WP_Post for the given context.
	 *
	 * @param  array<string, mixed> $context Dynamic content context.
	 * @return \WP_Post|null                 Post object or null if not found.
	 */
	protected function get_post( array $context ): ?\WP_Post {
		$post_id = absint( $context['post_id'] ?? 0 );
		return $post_id ? get_post( $post_id ) : get_post();
	}

	/**
	 * Get the WP_User author for the context post.
	 *
	 * @param  array<string, mixed> $context Dynamic content context.
	 * @return \WP_User|false                Author user object, or false if not found.
	 */
	protected function get_author( array $context ) {
		$post = $this->get_post( $context );
		if ( ! $post ) {
			return false;
		}
		return get_user_by( 'id', (int) $post->post_author );
	}

	/**
	 * Get terms for the context post in the given taxonomy.
	 *
	 * @param  array<string, mixed> $context  Dynamic content context.
	 * @param  string               $taxonomy Taxonomy slug.
	 * @return \WP_Term[]                     Array of term objects.
	 */
	protected function get_terms_for_post( array $context, string $taxonomy ): array {
		$post = $this->get_post( $context );
		if ( ! $post ) {
			return array();
		}

		$terms = get_the_terms( $post, $taxonomy );
		return ( $terms && ! is_wp_error( $terms ) ) ? $terms : array();
	}

	/**
	 * Return a safe date-formatted string.
	 *
	 * @param  string $format    PHP date format.
	 * @param  int    $timestamp Unix timestamp.
	 * @return string            Formatted date string.
	 */
	protected function format_date( string $format, int $timestamp ): string {
		$format    = $format ? $format : get_option( 'date_format', 'F j, Y' );
		$formatted = wp_date( $format, $timestamp );
		return $formatted ? $formatted : '';
	}

	/**
	 * Retrieve an option with its declared default.
	 *
	 * @param  string                $key     Option key.
	 * @param  array<string, string> $options User-supplied options.
	 * @return string
	 */
	protected function opt( string $key, array $options ): string {
		if ( array_key_exists( $key, $options ) ) {
			return (string) $options[ $key ];
		}

		foreach ( $this->get_options() as $decl ) {
			if ( $decl['key'] === $key ) {
				return (string) ( $decl['default'] ?? '' );
			}
		}

		return '';
	}
}

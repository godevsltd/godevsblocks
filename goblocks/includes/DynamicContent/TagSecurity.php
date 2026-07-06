<?php
/**
 * Tag Security.
 *
 * @package GoBlocks\DynamicContent
 */

namespace GoBlocks\DynamicContent;

defined( 'ABSPATH' ) || exit;

/**
 * Security validator for dynamic content tag resolution.
 *
 * Called by TagRegistry::replace() before every resolve() call.
 * Returns false if any check fails; caller substitutes an empty string.
 */
class TagSecurity {

	/**
	 * Validate that a tag call is safe to resolve.
	 *
	 * Checks:
	 *  1. Option keys are on the tag's declared allowlist.
	 *  2. Option values pass type checks.
	 *  3. Capability requirements (e.g., user_meta requires logged-in user).
	 *  4. Context requirements (loop-only tags outside the loop return false).
	 *
	 * @param  TagInterface          $tag     Tag implementation.
	 * @param  array<string, string> $options Parsed option key→value.
	 * @param  array<string, mixed>  $context Dynamic content context.
	 * @return bool  True = safe to resolve.
	 */
	public static function validate(
		TagInterface $tag,
		array $options,
		array $context
	): bool {
		$declared = $tag->get_options();

		// Build a slug→declaration map.
		$decl_map = array();
		foreach ( $declared as $decl ) {
			$decl_map[ $decl['key'] ] = $decl;
		}

		// 1. Unknown option keys are rejected.
		foreach ( $options as $key => $value ) {
			if ( ! isset( $decl_map[ $key ] ) ) {
				return false;
			}
		}

		// 2. Type validation.
		foreach ( $options as $key => $value ) {
			$type = $decl_map[ $key ]['type'] ?? 'string';

			switch ( $type ) {
				case 'int':
					if ( ! is_numeric( $value ) ) {
						return false;
					}
					break;

				case 'bool':
					if ( ! in_array( strtolower( $value ), array( '0', '1', 'true', 'false', 'yes', 'no' ), true ) ) {
						return false;
					}
					break;

				case 'string':
				default:
					// String: prevent shell characters and null bytes.
					if ( str_contains( $value, "\0" ) ) {
						return false;
					}
					break;
			}
		}

		// 3. Capability checks per tag.
		if ( ! self::check_capabilities( $tag->get_slug() ) ) {
			return false;
		}

		// 4. Context check.
		if ( ! self::check_context( $tag->get_contexts(), $context ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Per-slug capability requirements.
	 *
	 * @param  string $slug Tag slug to check.
	 * @return bool         True if capability requirements are satisfied.
	 */
	private static function check_capabilities( string $slug ): bool {
		return match ( $slug ) {
			'user_meta' => is_user_logged_in(),
			default     => true,
		};
	}

	/**
	 * Verify the current page context matches the tag's declared contexts.
	 *
	 * @param  string[]             $tag_contexts  Declared tag contexts.
	 * @param  array<string, mixed> $context       Current request context.
	 * @return bool
	 */
	private static function check_context( array $tag_contexts, array $context ): bool {
		if ( in_array( 'any', $tag_contexts, true ) ) {
			return true;
		}

		$is_loop    = ! empty( $context['is_loop'] );
		$is_archive = ! empty( $context['is_archive'] );
		$post_id    = absint( $context['post_id'] ?? 0 );

		foreach ( $tag_contexts as $ctx ) {
			switch ( $ctx ) {
				case 'loop':
					if ( $is_loop ) {
						return true;
					}
					break;
				case 'single':
					if ( ! $is_loop && $post_id > 0 ) {
						return true;
					}
					break;
				case 'archive':
					if ( $is_archive ) {
						return true;
					}
					break;
			}
		}

		return false;
	}
}

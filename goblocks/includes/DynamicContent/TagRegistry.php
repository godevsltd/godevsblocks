<?php
/**
 * Tag Registry.
 *
 * @package GoBlocks\DynamicContent
 */

namespace GoBlocks\DynamicContent;

defined( 'ABSPATH' ) || exit;

/**
 * Singleton registry for dynamic content tags.
 *
 * Usage:
 *   TagRegistry::register( new PostTitle() );
 *   $resolved = TagRegistry::replace( $content, $context );
 *
 * Pattern parsed: {slug} or {slug|key:value|key2:value2}
 * Regex: /{([a-z][a-z0-9_]*)(?:\|([^}]*))?}/
 */
class TagRegistry {

	/**
	 * Map of tag slug to TagInterface implementation.
	 *
	 * @var array<string, TagInterface>
	 */
	private static array $tags = array();

	/**
	 * Register a tag implementation.
	 *
	 * @param  TagInterface $tag Tag implementation to register.
	 * @return void
	 */
	public static function register( TagInterface $tag ): void {
		self::$tags[ $tag->get_slug() ] = $tag;
	}

	/**
	 * Retrieve a tag by slug.
	 *
	 * @param  string $slug Tag slug to look up.
	 * @return TagInterface|null Tag implementation or null if not registered.
	 */
	public static function get( string $slug ): ?TagInterface {
		return self::$tags[ $slug ] ?? null;
	}

	/**
	 * Return all registered tags.
	 *
	 * @return TagInterface[]
	 */
	public static function all(): array {
		return array_values( self::$tags );
	}

	/**
	 * Replace all {tag} occurrences in a string.
	 *
	 * Tags that are unknown or fail security checks are left as-is or replaced
	 * with an empty string, never with raw user input.
	 *
	 * Recursive resolution is blocked — tags inside resolved values are never
	 * re-parsed (preg_replace_callback is not recursive).
	 *
	 * @param  string               $content Arbitrary text that may contain {tags}.
	 * @param  array<string, mixed> $context Dynamic content context.
	 * @return string                        Content with tags resolved.
	 */
	public static function replace( string $content, array $context ): string {
		if ( false === strpos( $content, '{' ) ) {
			return $content;
		}

		$result = preg_replace_callback(
			'/{([a-z][a-z0-9_]*)(?:\|([^}]*))?}/',
			static function ( array $matches ) use ( $context ): string {
				$slug    = $matches[1];
				$opt_raw = $matches[2] ?? '';

				$tag = self::get( $slug );

				// Leave unknown tags unchanged so they don't silently disappear.
				if ( ! $tag ) {
					return $matches[0];
				}

				// Parse pipe-separated key:value options.
				$options = array();
				if ( '' !== $opt_raw ) {
					foreach ( explode( '|', $opt_raw ) as $pair ) {
						if ( ! str_contains( $pair, ':' ) ) {
							continue;
						}
						[ $key, $value ]         = explode( ':', $pair, 2 );
						$options[ trim( $key ) ] = trim( $value );
					}
				}

				// Security gate — returns false if options or capabilities fail.
				if ( ! TagSecurity::validate( $tag, $options, $context ) ) {
					return '';
				}

				$resolved = $tag->resolve( $context, $options );

				// Apply escape type declared by the tag.
				return match ( $tag->get_escape_type() ) {
					'attr' => esc_attr( $resolved ),
					'url'  => esc_url( $resolved ),
					'raw'  => wp_kses_post( $resolved ),
					default => esc_html( $resolved ),
				};
			},
			$content
		);

		return $result ?? $content;
	}

	/**
	 * Serialize all tags to the array format used by the REST tags endpoint.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function to_rest_list(): array {
		$out = array();
		foreach ( self::all() as $tag ) {
			$out[] = array(
				'slug'        => $tag->get_slug(),
				'label'       => $tag->get_label(),
				'category'    => $tag->get_category(),
				'description' => $tag->get_description(),
				'options'     => $tag->get_options(),
				'contexts'    => $tag->get_contexts(),
				'escape_type' => $tag->get_escape_type(),
			);
		}
		return $out;
	}
}

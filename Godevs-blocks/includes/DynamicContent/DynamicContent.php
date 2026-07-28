<?php
/**
 * Dynamic Content.
 *
 * @package GoBlocks\DynamicContent
 */

namespace GoBlocks\DynamicContent;

defined( 'ABSPATH' ) || exit;

use GoBlocks\DynamicContent\Tags\PostTitle;
use GoBlocks\DynamicContent\Tags\PostExcerpt;
use GoBlocks\DynamicContent\Tags\PostDate;
use GoBlocks\DynamicContent\Tags\PostModified;
use GoBlocks\DynamicContent\Tags\PostUrl;
use GoBlocks\DynamicContent\Tags\PostId;
use GoBlocks\DynamicContent\Tags\PostStatus;
use GoBlocks\DynamicContent\Tags\PostType;
use GoBlocks\DynamicContent\Tags\PostMeta;
use GoBlocks\DynamicContent\Tags\FeaturedImage;
use GoBlocks\DynamicContent\Tags\AuthorName;
use GoBlocks\DynamicContent\Tags\AuthorMeta;
use GoBlocks\DynamicContent\Tags\AuthorUrl;
use GoBlocks\DynamicContent\Tags\AuthorAvatar;
use GoBlocks\DynamicContent\Tags\TermName;
use GoBlocks\DynamicContent\Tags\TermUrl;
use GoBlocks\DynamicContent\Tags\TermCount;
use GoBlocks\DynamicContent\Tags\UserMeta;
use GoBlocks\DynamicContent\Tags\CurrentDate;
use GoBlocks\DynamicContent\Tags\SiteTitle;
use GoBlocks\DynamicContent\Tags\SiteUrl;
use GoBlocks\DynamicContent\Tags\QueryParam;

/**
 * Bootstraps the Dynamic Content subsystem.
 *
 * Call DynamicContent::boot() from Plugin::boot(). It:
 *  - Registers all built-in tags with TagRegistry.
 *  - Fires 'goblocks_register_dynamic_tags' so third-party tags can be added.
 *  - Hooks into the REST controller's filter placeholders.
 */
class DynamicContent {

	/**
	 * Initialise the subsystem. Called once during plugin boot.
	 *
	 * @return void
	 */
	public static function boot(): void {
		self::register_built_in_tags();

		/**
		 * Allow third-party plugins/themes to register custom tags.
		 *
		 * @param TagRegistry $registry Use TagRegistry::register( new MyTag() ).
		 */
		do_action( 'goblocks_register_dynamic_tags', TagRegistry::class );

		// Fulfil the REST controller's filter contracts.
		add_filter( 'goblocks_dynamic_content_preview', array( self::class, 'handle_preview' ), 10, 4 );
		add_filter( 'goblocks_dynamic_content_tags', array( self::class, 'handle_tags_list' ), 10, 1 );
	}

	// ── Filter handlers ───────────────────────────────────────────────────────.

	/**
	 * Resolve a single tag for the REST preview endpoint.
	 *
	 * @param  string|null          $preview  Previous filter value (null = not handled).
	 * @param  string               $slug     Tag slug.
	 * @param  \WP_Post|null        $post     Context post.
	 * @param  array<string,string> $options Tag options.
	 * @return string|null
	 */
	public static function handle_preview(
		?string $preview,
		string $slug,
		?\WP_Post $post,
		array $options
	): ?string {
		$tag = TagRegistry::get( $slug );
		if ( ! $tag ) {
			return $preview; // Unknown tag — leave for other handlers.
		}

		$post_id = $post ? $post->ID : (int) get_the_ID();

		$context = self::make_preview_context( $post_id );

		if ( ! TagSecurity::validate( $tag, $options, $context ) ) {
			return '';
		}

		$resolved = $tag->preview( $context, $options );

		return match ( $tag->get_escape_type() ) {
			'attr' => esc_attr( $resolved ),
			'url'  => esc_url( $resolved ),
			'raw'  => wp_kses_post( $resolved ),
			default => esc_html( $resolved ),
		};
	}

	/**
	 * Return the full tag list for the REST tags endpoint.
	 *
	 * @param  array<mixed> $tags Existing tags (from previous filters).
	 * @return array<int, array<string, mixed>>
	 */
	public static function handle_tags_list( array $tags ): array {
		return array_merge( $tags, TagRegistry::to_rest_list() );
	}

	// ── Context helpers ───────────────────────────────────────────────────────.

	/**
	 * Build a dynamic content context from a block's WP_Block instance.
	 *
	 * @param  \WP_Block $block Block instance with context values.
	 * @return array<string, mixed> Dynamic content context array.
	 */
	public static function make_context( \WP_Block $block ): array {
		$post_id = absint( $block->context['postId'] ?? get_the_ID() ?? 0 );

		return array(
			'post_id'    => $post_id,
			'post_type'  => (string) ( $block->context['postType'] ?? get_post_type( $post_id ) ),
			'loop_index' => null,
			'is_loop'    => ! empty( $block->context['goblocks/queryId'] ),
			'is_archive' => is_archive(),
		);
	}

	/**
	 * Build a context for REST preview (editor-side).
	 *
	 * @param  int $post_id Post ID for preview context.
	 * @return array<string, mixed> Dynamic content context array.
	 */
	public static function make_preview_context( int $post_id ): array {
		return array(
			'post_id'    => $post_id,
			'post_type'  => (string) get_post_type( $post_id ),
			'loop_index' => null,
			'is_loop'    => false,
			'is_archive' => false,
		);
	}

	// ── Private helpers ───────────────────────────────────────────────────────.

	/**
	 * Register all built-in dynamic content tags.
	 *
	 * @return void
	 */
	private static function register_built_in_tags(): void {
		$built_in = array(
			// Post.
			new PostTitle(),
			new PostExcerpt(),
			new PostDate(),
			new PostModified(),
			new PostUrl(),
			new PostId(),
			new PostStatus(),
			new PostType(),
			new PostMeta(),
			new FeaturedImage(),
			// Author.
			new AuthorName(),
			new AuthorMeta(),
			new AuthorUrl(),
			new AuthorAvatar(),
			// Term.
			new TermName(),
			new TermUrl(),
			new TermCount(),
			// User.
			new UserMeta(),
			// Date.
			new CurrentDate(),
			// Site.
			new SiteTitle(),
			new SiteUrl(),
			// Query.
			new QueryParam(),
		);

		foreach ( $built_in as $tag ) {
			TagRegistry::register( $tag );
		}
	}
}

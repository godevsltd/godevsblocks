<?php
namespace GoBlocks\Patterns;

defined( 'ABSPATH' ) || exit;

/**
 * Pattern Library — registers GoBlocks block patterns and the patterns admin page.
 *
 * Pattern files live in patterns/{category}/{slug}.php and follow the WordPress
 * block-pattern file-header convention. Paths are hardcoded constants, never
 * user-supplied, so dynamic include is safe here.
 */
class PatternLibrary {

	private const CATEGORY_SLUG = 'goblocks';

	/**
	 * @return void
	 */
	public static function boot(): void {
		add_action( 'init',                  [ self::class, 'register_category' ], 5 );
		add_action( 'init',                  [ self::class, 'register_patterns' ], 10 );
		// admin_menu registration is handled centrally by Admin::register_all_menus()
		// to guarantee the parent page exists before this submenu is added.
		add_action( 'admin_enqueue_scripts', [ self::class, 'enqueue_admin_assets' ] );
	}

	/**
	 * @return void
	 */
	public static function register_category(): void {
		register_block_pattern_category(
			self::CATEGORY_SLUG,
			[ 'label' => __( 'GoBlocks', 'goblocks' ) ]
		);
	}

	/**
	 * Register all plugin-provided block patterns.
	 *
	 * @return void
	 */
	public static function register_patterns(): void {
		$files = [
			GOBLOCKS_DIR . 'patterns/hero/hero-centered.php',
			GOBLOCKS_DIR . 'patterns/cards/card-grid-3col.php',
			GOBLOCKS_DIR . 'patterns/cta/cta-with-image.php',
			GOBLOCKS_DIR . 'patterns/stats/stats-4col.php',
			GOBLOCKS_DIR . 'patterns/testimonials/testimonial-card.php',
			GOBLOCKS_DIR . 'patterns/pricing/pricing-3tier.php',
			GOBLOCKS_DIR . 'patterns/newsletter/newsletter-banner.php',
			GOBLOCKS_DIR . 'patterns/team/team-grid.php',
			GOBLOCKS_DIR . 'patterns/blog/blog-posts-grid.php',
			GOBLOCKS_DIR . 'patterns/faq/faq-accordion.php',
			GOBLOCKS_DIR . 'patterns/features/how-it-works.php',
			GOBLOCKS_DIR . 'patterns/testimonials/testimonials-grid.php',
			GOBLOCKS_DIR . 'patterns/logos/logo-cloud.php',
			GOBLOCKS_DIR . 'patterns/contact/contact-cta.php',
			GOBLOCKS_DIR . 'patterns/portfolio/portfolio-grid.php',
		];

		foreach ( $files as $file ) {
			self::load_pattern( $file );
		}
	}

	/**
	 * Parse a pattern file's WordPress-standard headers and register it.
	 *
	 * @param string $file Absolute path — always a hardcoded constant, never user input.
	 * @return void
	 */
	private static function load_pattern( string $file ): void {
		if ( ! is_readable( $file ) ) {
			return;
		}

		$headers = get_file_data(
			$file,
			[
				'title'          => 'Title',
				'slug'           => 'Slug',
				'description'    => 'Description',
				'categories'     => 'Categories',
				'keywords'       => 'Keywords',
				'viewport_width' => 'Viewport Width',
				'inserter'       => 'Inserter',
			]
		);

		if ( empty( $headers['title'] ) || empty( $headers['slug'] ) ) {
			return;
		}

		ob_start();
		// phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.IncludingNonPHPFile -- hardcoded path, not user input.
		include $file;
		$content = (string) ob_get_clean();

		$categories = array_values(
			array_filter( array_map( 'trim', explode( ',', $headers['categories'] ?? '' ) ) )
		);

		$keywords = array_values(
			array_filter( array_map( 'trim', explode( ',', $headers['keywords'] ?? '' ) ) )
		);

		register_block_pattern(
			$headers['slug'],
			[
				'title'          => $headers['title'],
				'content'        => $content,
				'description'    => $headers['description'] ?? '',
				'categories'     => $categories,
				'keywords'       => $keywords,
				'inserter'       => 'false' !== strtolower( $headers['inserter'] ?? 'true' ),
				'viewport_width' => absint( $headers['viewport_width'] ?: 1280 ),
			]
		);
	}

	/**
	 * @return void
	 */
	public static function add_submenu_page(): void {
		add_submenu_page(
			'goblocks-settings',
			__( 'Pattern Library', 'goblocks' ),
			__( 'Patterns', 'goblocks' ),
			'edit_posts',
			'goblocks-patterns',
			[ self::class, 'render_page' ]
		);
	}

	/**
	 * Render the patterns browser admin page shell.
	 *
	 * @return void
	 */
	public static function render_page(): void {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static empty div, no user data.
		echo '<div id="goblocks-patterns-root"></div>';
	}

	/**
	 * Enqueue the patterns React SPA only on the patterns admin page.
	 *
	 * @param string $hook Current admin page hook suffix.
	 * @return void
	 */
	public static function enqueue_admin_assets( string $hook ): void {
		if ( 'goblocks_page_goblocks-patterns' !== $hook ) {
			return;
		}

		$asset_file = GOBLOCKS_DIR . 'build/patterns.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		// phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.IncludingNonPHPFile -- hardcoded build path.
		$asset = require $asset_file;

		wp_enqueue_style(
			'goblocks-tokens',
			GOBLOCKS_URL . 'assets/css/tokens.css',
			array(),
			GOBLOCKS_VERSION
		);

		wp_enqueue_style(
			'goblocks-admin',
			GOBLOCKS_URL . 'assets/css/admin.css',
			array( 'goblocks-tokens' ),
			GOBLOCKS_VERSION
		);

		wp_enqueue_style(
			'goblocks-patterns-page',
			GOBLOCKS_URL . 'assets/css/patterns.css',
			array( 'goblocks-admin' ),
			GOBLOCKS_VERSION
		);

		wp_enqueue_script(
			'goblocks-patterns',
			GOBLOCKS_URL . 'build/patterns.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_add_inline_script(
			'goblocks-patterns',
			'window.goblocksPatterns = ' . wp_json_encode(
				[
					'restUrl' => rest_url( 'goblocks/v1/' ),
					'nonce'   => wp_create_nonce( 'wp_rest' ),
				]
			) . ';',
			'before'
		);
	}
}

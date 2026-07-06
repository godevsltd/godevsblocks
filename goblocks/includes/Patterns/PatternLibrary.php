<?php
/**
 * Pattern Library.
 *
 * @package GoBlocks\Patterns
 */

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
	 * Register hooks to boot the pattern library.
	 *
	 * @return void
	 */
	public static function boot(): void {
		add_action( 'init', array( self::class, 'register_category' ), 5 );
		add_action( 'init', array( self::class, 'register_patterns' ), 10 );
		add_filter( 'block_editor_settings_all', array( self::class, 'inject_pattern_preview_css' ), 10, 1 );
		// admin_menu registration is handled centrally by Admin::register_all_menus().
		// to guarantee the parent page exists before this submenu is added.
		add_action( 'admin_enqueue_scripts', array( self::class, 'enqueue_admin_assets' ) );
	}

	/**
	 * Register the GoBlocks block pattern category.
	 *
	 * @return void
	 */
	public static function register_category(): void {
		register_block_pattern_category(
			self::CATEGORY_SLUG,
			array( 'label' => __( 'GoBlocks', 'goblocks' ) )
		);
	}

	/**
	 * All pattern file paths — single source of truth used by both
	 * register_patterns() and inject_pattern_preview_css().
	 *
	 * @return string[]
	 */
	private static function pattern_files(): array {
		return array(
			// Hero.
			GOBLOCKS_DIR . 'patterns/hero/hero-centered.php',
			GOBLOCKS_DIR . 'patterns/hero/hero-split.php',
			GOBLOCKS_DIR . 'patterns/hero/hero-minimal.php',
			GOBLOCKS_DIR . 'patterns/hero/hero-video.php',
			// Features.
			GOBLOCKS_DIR . 'patterns/features/how-it-works.php',
			GOBLOCKS_DIR . 'patterns/features/features-3col-icons.php',
			GOBLOCKS_DIR . 'patterns/features/features-alternating.php',
			GOBLOCKS_DIR . 'patterns/features/features-dark.php',
			// Cards.
			GOBLOCKS_DIR . 'patterns/cards/card-grid-3col.php',
			GOBLOCKS_DIR . 'patterns/cards/cards-with-image.php',
			// Stats.
			GOBLOCKS_DIR . 'patterns/stats/stats-4col.php',
			GOBLOCKS_DIR . 'patterns/stats/stats-dark.php',
			GOBLOCKS_DIR . 'patterns/stats/stats-light.php',
			// Pricing.
			GOBLOCKS_DIR . 'patterns/pricing/pricing-3tier.php',
			GOBLOCKS_DIR . 'patterns/pricing/pricing-2col.php',
			// CTA.
			GOBLOCKS_DIR . 'patterns/cta/cta-with-image.php',
			GOBLOCKS_DIR . 'patterns/cta/cta-centered.php',
			GOBLOCKS_DIR . 'patterns/cta/cta-split-dark.php',
			// FAQ.
			GOBLOCKS_DIR . 'patterns/faq/faq-accordion.php',
			GOBLOCKS_DIR . 'patterns/faq/faq-with-cta.php',
			// Testimonials.
			GOBLOCKS_DIR . 'patterns/testimonials/testimonial-card.php',
			GOBLOCKS_DIR . 'patterns/testimonials/testimonials-grid.php',
			GOBLOCKS_DIR . 'patterns/testimonials/testimonial-single.php',
			GOBLOCKS_DIR . 'patterns/testimonials/testimonial-fullwidth.php',
			// Social proof / Logos.
			GOBLOCKS_DIR . 'patterns/logos/logo-cloud.php',
			GOBLOCKS_DIR . 'patterns/logos/logos-with-cta.php',
			// Blog / Portfolio.
			GOBLOCKS_DIR . 'patterns/blog/blog-posts-grid.php',
			GOBLOCKS_DIR . 'patterns/blog/blog-featured.php',
			GOBLOCKS_DIR . 'patterns/portfolio/portfolio-grid.php',
			GOBLOCKS_DIR . 'patterns/portfolio/portfolio-case-study.php',
			// Team / About / Services.
			GOBLOCKS_DIR . 'patterns/team/team-grid.php',
			GOBLOCKS_DIR . 'patterns/team/team-minimal.php',
			GOBLOCKS_DIR . 'patterns/about/about-mission.php',
			GOBLOCKS_DIR . 'patterns/services/services-cards.php',
			// Contact.
			GOBLOCKS_DIR . 'patterns/contact/contact-cta.php',
			GOBLOCKS_DIR . 'patterns/contact/contact-split.php',
			GOBLOCKS_DIR . 'patterns/contact/contact-simple.php',
			// Newsletter.
			GOBLOCKS_DIR . 'patterns/newsletter/newsletter-banner.php',
			GOBLOCKS_DIR . 'patterns/newsletter/newsletter-inline.php',
			// Video / Announcement.
			GOBLOCKS_DIR . 'patterns/video/video-section.php',
			GOBLOCKS_DIR . 'patterns/announcement/announcement-bar.php',
		);
	}

	/**
	 * Register all plugin-provided block patterns.
	 *
	 * @return void
	 */
	public static function register_patterns(): void {
		foreach ( self::pattern_files() as $file ) {
			self::load_pattern( $file );
		}
	}

	/**
	 * Inject all pattern generatedCss values into the block editor settings.
	 *
	 * WordPress passes these styles into EVERY editor iframe — including the
	 * pattern inserter's BlockPreview thumbnail iframe — so pattern thumbnails
	 * render with full visual fidelity. Without this, the JS useCssEngine hook
	 * cannot reach the pattern-preview iframe (it is separate from the main
	 * editor canvas) and the thumbnails show unstyled block skeletons.
	 *
	 * @param  array<string, mixed> $settings Block editor settings.
	 * @return array<string, mixed>
	 */
	public static function inject_pattern_preview_css( array $settings ): array {
		static $css = null;
		if ( null === $css ) {
			$css = self::collect_pattern_css();
		}
		if ( '' !== $css ) {
			if ( ! isset( $settings['styles'] ) || ! is_array( $settings['styles'] ) ) {
				$settings['styles'] = array();
			}
			$settings['styles'][] = array( 'css' => $css );
		}
		return $settings;
	}

	/**
	 * Scan all pattern PHP files and extract their generatedCss values.
	 *
	 * Pattern files contain WordPress block comment markup with JSON attributes.
	 * Each block's "generatedCss" value is a plain CSS string (no `"` inside,
	 * so a simple greedy regex captures it reliably). Results are concatenated
	 * and returned as a single CSS string ready for injection.
	 *
	 * @return string
	 */
	private static function collect_pattern_css(): string {
		$css = '';
		foreach ( self::pattern_files() as $file ) {
			if ( ! is_readable( $file ) ) {
				continue;
			}
			$content = file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- hardcoded plugin path, not user input.
			if ( false === $content ) {
				continue;
			}
			// Match "generatedCss":"<value>" — value is CSS with no unescaped double-quotes.
			preg_match_all( '/"generatedCss":"((?:[^"\\\\]|\\\\.)*)"/', $content, $matches );
			foreach ( $matches[1] as $raw ) {
				if ( '' === $raw ) {
					continue;
				}
				// Decode JSON string escapes (e.g. \n, \\, \") if any.
				$decoded = json_decode( '"' . $raw . '"' );
				if ( is_string( $decoded ) && '' !== $decoded ) {
					$css .= $decoded;
				}
			}
		}
		return $css;
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
			array(
				'title'          => 'Title',
				'slug'           => 'Slug',
				'description'    => 'Description',
				'categories'     => 'Categories',
				'keywords'       => 'Keywords',
				'viewport_width' => 'Viewport Width',
				'inserter'       => 'Inserter',
			)
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
			array(
				'title'          => $headers['title'],
				'content'        => $content,
				'description'    => $headers['description'] ?? '',
				'categories'     => $categories,
				'keywords'       => $keywords,
				'inserter'       => 'false' !== strtolower( $headers['inserter'] ?? 'true' ),
				'viewport_width' => absint( $headers['viewport_width'] ? $headers['viewport_width'] : 1280 ),
			)
		);
	}

	/**
	 * Register the patterns browser as an admin submenu page.
	 *
	 * @return void
	 */
	public static function add_submenu_page(): void {
		add_submenu_page(
			'goblocks-settings',
			__( 'Pattern Library', 'goblocks' ),
			__( 'Patterns', 'goblocks' ),
			'edit_posts',
			'goblocks-patterns',
			array( self::class, 'render_page' )
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
				array(
					'restUrl' => rest_url( 'goblocks/v1/' ),
					'nonce'   => wp_create_nonce( 'wp_rest' ),
				)
			) . ';',
			'before'
		);
	}
}

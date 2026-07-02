<?php
namespace GoBlocks\Core;

defined( 'ABSPATH' ) || exit;

use GoBlocks\Utils\Singleton;
use GoBlocks\CSS\CssEnqueue;
use GoBlocks\REST\SettingsController;
use GoBlocks\REST\StylesController;
use GoBlocks\REST\QueryController;
use GoBlocks\REST\DynamicContentController;
use GoBlocks\Admin\Admin;
use GoBlocks\Admin\EditorAssets;
use GoBlocks\DynamicContent\DynamicContent;
use GoBlocks\GlobalStyles\GlobalStyles;
use GoBlocks\GlobalStyles\ThemeJsonBridge;
use GoBlocks\Patterns\PatternLibrary;
use GoBlocks\REST\PatternsController;

/**
 * Main plugin orchestrator.
 *
 * Boots all GoBlocks subsystems in the correct order.
 * Called once from goblocks_bootstrap() on plugins_loaded.
 */
class Plugin extends Singleton {

	/**
	 * Boot the plugin.
	 *
	 * @return void
	 */
	public function boot(): void {
		$this->register_css_pipeline();
		$this->register_block_category();
		DynamicContent::boot();
		GlobalStyles::boot();
		ThemeJsonBridge::boot();
		PatternLibrary::boot();
		$this->register_rest_api();
		$this->register_admin();
		$this->register_blocks();

		do_action( 'goblocks_loaded' );
	}

	/**
	 * Add "GoBlocks" group to the Gutenberg block inserter.
	 *
	 * @return void
	 */
	private function register_block_category(): void {
		add_filter(
			'block_categories_all',
			static function ( array $categories ): array {
				array_unshift(
					$categories,
					array(
						'slug'  => 'goblocks',
						'title' => __( 'GoBlocks', 'goblocks' ),
						'icon'  => null,
					)
				);
				return $categories;
			},
			10,
			1
		);
	}

	/**
	 * Initialise CSS collection and enqueue subsystem.
	 *
	 * @return void
	 */
	private function register_css_pipeline(): void {
		CssEnqueue::get_instance()->register_hooks();
	}

	/**
	 * Register all REST API controllers.
	 *
	 * @return void
	 */
	private function register_rest_api(): void {
		add_action(
			'rest_api_init',
			static function (): void {
				( new SettingsController() )->register_routes();
				( new StylesController() )->register_routes();
				( new QueryController() )->register_routes();
				( new DynamicContentController() )->register_routes();
				( new PatternsController() )->register_routes();
			}
		);
	}

	/**
	 * Initialise the admin area (menu page + asset enqueue).
	 *
	 * @return void
	 */
	private function register_admin(): void {
		EditorAssets::get_instance()->register_hooks();

		if ( is_admin() ) {
			Admin::get_instance()->register_hooks();
		}
	}

	/**
	 * Register all block types from the build directory.
	 *
	 * Blocks are registered individually by their block class in Step 6+.
	 * This is a placeholder that will grow as blocks are added.
	 *
	 * @return void
	 */
	private function register_blocks(): void {
		add_action( 'init', array( $this, 'register_block_types' ) );
	}

	/**
	 * Called on the init hook — registers each block type.
	 *
	 * @return void
	 */
	public function register_block_types(): void {
		/**
		 * Filter the list of GoBlocks block class names to register.
		 *
		 * @param string[] $block_classes Fully-qualified class names.
		 */
		$block_classes = apply_filters(
			'goblocks_block_classes',
			array(
				\GoBlocks\Blocks\Group::class,
				\GoBlocks\Blocks\Column::class,
				\GoBlocks\Blocks\Text::class,
				\GoBlocks\Blocks\Heading::class,
				\GoBlocks\Blocks\Button::class,
				\GoBlocks\Blocks\Image::class,
				\GoBlocks\Blocks\Icon::class,
				\GoBlocks\Blocks\Shape::class,
				\GoBlocks\Blocks\Tabs::class,
				\GoBlocks\Blocks\TabPanel::class,
				\GoBlocks\Blocks\Accordion::class,
				\GoBlocks\Blocks\AccordionItem::class,
				\GoBlocks\Blocks\Query::class,
				\GoBlocks\Blocks\QueryLoop::class,
				\GoBlocks\Blocks\QueryNoResults::class,
				\GoBlocks\Blocks\Pagination::class,
				\GoBlocks\Blocks\Separator::class,
				\GoBlocks\Blocks\Spacer::class,
				\GoBlocks\Blocks\Counter::class,
				\GoBlocks\Blocks\ProgressBar::class,
				\GoBlocks\Blocks\Alert::class,
				\GoBlocks\Blocks\StarRating::class,
				\GoBlocks\Blocks\Lottie::class,
				\GoBlocks\Blocks\FlipCard::class,
				\GoBlocks\Blocks\Countdown::class,
				\GoBlocks\Blocks\SocialShare::class,
				\GoBlocks\Blocks\TableOfContents::class,
				\GoBlocks\Blocks\Slider::class,
				\GoBlocks\Blocks\Slide::class,
				\GoBlocks\Blocks\Modal::class,
				\GoBlocks\Blocks\Pricing::class,
				\GoBlocks\Blocks\Timeline::class,
				\GoBlocks\Blocks\TimelineItem::class,
				\GoBlocks\Blocks\Navigation::class,
				\GoBlocks\Blocks\Video::class,
				\GoBlocks\Blocks\Container::class,
			)
		);

		foreach ( $block_classes as $class ) {
			try {
				if ( class_exists( $class ) ) {
					( new $class() )->register();
				}
			} catch ( \Throwable $e ) {
				// A parse error or fatal in one block class must not take down the whole site.
				// Log the problem and continue with remaining blocks.
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					error_log( 'GoBlocks: failed to register ' . $class . ' — ' . $e->getMessage() );
				}
			}
		}
	}
}

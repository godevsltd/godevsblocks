/**
 * GoBlocks Webpack Configuration
 *
 * Extends @wordpress/scripts default config.
 * Block entries are added here as each block is built (Step 6+).
 * Non-block entries (editor, settings, patterns, global-styles) are registered now.
 */

const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );

/** @type {import('webpack').Configuration} */
module.exports = {
	...defaultConfig,

	entry: {
		// ── Non-block entries ───────────────────────────────────────────────
		// Editor bootstrap: addFilter calls, sidebar registration, store init
		editor: './src/editor.ts',

		// Shared scroll-triggered animation observer (used by Group and Column).
		// Registered as handle 'goblocks-anim-observer' so WordPress loads it once
		// even when both block types appear on the same page.
		'anim-observer': './src/utils/animation-observer.ts',

		// Admin settings page React SPA
		settings: './src/settings.ts',

		// Pattern library admin page React SPA
		patterns: './src/patterns.ts',

		// Global styles admin panel React SPA
		'global-styles': './src/global-styles.ts',

		// ── Block entries (added below as each block is scaffolded) ─────────
		// Uncomment each line when the corresponding block src files exist.
		//
		'blocks/group/index':          './src/blocks/group/index.ts',
		'blocks/column/index':         './src/blocks/column/index.ts',
		'blocks/text/index':           './src/blocks/text/index.ts',
		'blocks/heading/index':        './src/blocks/heading/index.ts',
		'blocks/button/index':         './src/blocks/button/index.ts',
		'blocks/image/index':          './src/blocks/image/index.ts',
		// 'blocks/grid/index' removed — replaced by group/column
		'blocks/query/index':          './src/blocks/query/index.ts',
		'blocks/query-loop/index':        './src/blocks/query-loop/index.ts',
		'blocks/query-no-results/index':  './src/blocks/query-no-results/index.ts',
		'blocks/pagination/index':        './src/blocks/pagination/index.ts',
		'blocks/icon/index':           './src/blocks/icon/index.ts',
		'blocks/shape/index':          './src/blocks/shape/index.ts',
		'blocks/tabs/index':           './src/blocks/tabs/index.ts',
		'blocks/tabs/view':            './src/blocks/tabs/view.ts',
		'blocks/tab-panel/index':      './src/blocks/tab-panel/index.ts',
		'blocks/accordion/index':      './src/blocks/accordion/index.ts',
		'blocks/accordion/view':       './src/blocks/accordion/view.ts',
		'blocks/accordion-item/index': './src/blocks/accordion-item/index.ts',
		'blocks/separator/index':      './src/blocks/separator/index.ts',
		'blocks/spacer/index':         './src/blocks/spacer/index.ts',

		// ── Pro blocks ──────────────────────────────────────────────────────────
		'blocks/counter/index':              './src/blocks/counter/index.ts',
		'blocks/counter/view':               './src/blocks/counter/view.ts',
		'blocks/progress-bar/index':         './src/blocks/progress-bar/index.ts',
		'blocks/progress-bar/view':          './src/blocks/progress-bar/view.ts',
		'blocks/alert/index':                './src/blocks/alert/index.ts',
		'blocks/alert/view':                 './src/blocks/alert/view.ts',
		'blocks/star-rating/index':          './src/blocks/star-rating/index.ts',
		'blocks/star-rating/view':           './src/blocks/star-rating/view.ts',
		'blocks/lottie/index':               './src/blocks/lottie/index.ts',
		'blocks/lottie/view':                './src/blocks/lottie/view.ts',
		'blocks/flip-card/index':            './src/blocks/flip-card/index.ts',
		'blocks/flip-card/view':             './src/blocks/flip-card/view.ts',
		'blocks/countdown/index':            './src/blocks/countdown/index.ts',
		'blocks/countdown/view':             './src/blocks/countdown/view.ts',
		'blocks/social-share/index':         './src/blocks/social-share/index.ts',
		'blocks/social-share/view':          './src/blocks/social-share/view.ts',
		'blocks/table-of-contents/index':    './src/blocks/table-of-contents/index.ts',
		'blocks/table-of-contents/view':     './src/blocks/table-of-contents/view.ts',
		'blocks/slider/index':               './src/blocks/slider/index.ts',
		'blocks/slider/view':                './src/blocks/slider/view.ts',
		'blocks/slide/index':                './src/blocks/slide/index.ts',
		'blocks/modal/index':                './src/blocks/modal/index.ts',
		'blocks/modal/view':                 './src/blocks/modal/view.ts',
		'blocks/pricing/index':              './src/blocks/pricing/index.ts',
		'blocks/pricing/view':               './src/blocks/pricing/view.ts',
		'blocks/timeline/index':             './src/blocks/timeline/index.ts',
		'blocks/timeline/view':              './src/blocks/timeline/view.ts',
		'blocks/timeline-item/index':        './src/blocks/timeline-item/index.ts',
		'blocks/navigation/index':           './src/blocks/navigation/index.ts',
		'blocks/navigation/view':            './src/blocks/navigation/view.ts',
		'blocks/video/index':                './src/blocks/video/index.ts',
		'blocks/video/view':                 './src/blocks/video/view.ts',

		// ── Layout blocks ───────────────────────────────────────────────────────
		'blocks/container/index':     './src/blocks/container/index.ts',
	},

	output: {
		...defaultConfig.output,
		path: path.resolve( __dirname, 'build' ),
		filename: '[name].js',
		// Clean build directory on each build
		clean: true,
	},

	resolve: {
		...defaultConfig.resolve,
		alias: {
			...( defaultConfig.resolve?.alias ?? {} ),
			// Path aliases — must match tsconfig.json paths
			'@utils':      path.resolve( __dirname, 'src/utils' ),
			'@components': path.resolve( __dirname, 'src/components' ),
			'@hooks':      path.resolve( __dirname, 'src/hooks' ),
			'@store':      path.resolve( __dirname, 'src/store' ),
		},
		extensions: [ '.ts', '.tsx', '.js', '.jsx', '.json' ],
	},

	plugins: [
		// Remove default RemoveEmptyScriptsPlugin instance and re-add ours
		...( defaultConfig.plugins ?? [] ).filter(
			( plugin ) => plugin.constructor.name !== 'RemoveEmptyScriptsPlugin'
		),
		new RemoveEmptyScriptsPlugin(),
	],

	optimization: {
		...defaultConfig.optimization,
		splitChunks: {
			...defaultConfig.optimization?.splitChunks,
			cacheGroups: {
				...defaultConfig.optimization?.splitChunks?.cacheGroups,
				// Disable automatic chunk naming to prevent conflicts when an entry
				// name (e.g. blocks/text/style-index) matches the cache group name.
				style: {
					...defaultConfig.optimization?.splitChunks?.cacheGroups?.style,
					name: false,
				},
			},
		},
	},

	// Produce source maps in development, none in production
	devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
};

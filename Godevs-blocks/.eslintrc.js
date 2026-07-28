'use strict';

module.exports = {
	root: true,
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	rules: {
		// WordPress externals are webpack-provided at runtime and can't be
		// resolved by ESLint's static import resolver. tsconfig paths aliases
		// (@store/, @utils/, etc.) are also unknown to the ESLint resolver.
		'import/no-unresolved': [
			'error',
			{
				ignore: [
					'^@wordpress/',
					'^@store/',
					'^@utils/',
					'^@components/',
					'^@hooks/',
					'^@types/',
				],
			},
		],
	},
	overrides: [
		{
			files: [ '**/@(test|__tests__)/**/*.js', '**/?(*.)test.js' ],
			extends: [ 'plugin:@wordpress/eslint-plugin/test-unit' ],
		},
	],
};

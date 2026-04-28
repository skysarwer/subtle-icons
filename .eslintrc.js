module.exports = {
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	env: {
		browser: true,
	},
	globals: {
		// Newer browser APIs not in all ESLint browser globals lists.
		ResizeObserver: 'readonly',
		IntersectionObserver: 'readonly',
		// jQuery is enqueued by WordPress.
		jQuery: 'readonly',
		// Standard ECMAScript globals sometimes missing from env definitions.
		globalThis: 'readonly',
	},
	settings: {
		jsdoc: {
			mode: 'typescript',
		},
	},
	rules: {
		// @wordpress/* packages are provided by the WordPress runtime
		// and are not installed as npm dependencies.
		'import/no-unresolved': [ 'error', { ignore: [ '^@wordpress/' ] } ],
		'import/no-extraneous-dependencies': 'off',
		// This project intentionally uses experimental WordPress APIs.
		'@wordpress/no-unsafe-wp-apis': 'off',
		// WPElement, React, JSX, ParentNode are all valid but not resolvable by ESLint.
		'jsdoc/no-undefined-types': [
			'error',
			{
				definedTypes: [
					'WPElement',
					'React',
					'JSX',
					'ParentNode',
					'int',
				],
			},
		],
		// JSDoc type annotations and descriptions are informational, not enforced.
		'jsdoc/require-param-type': 'off',
		'jsdoc/require-returns-description': 'off',
		'jsdoc/check-param-names': 'warn',
	},
};

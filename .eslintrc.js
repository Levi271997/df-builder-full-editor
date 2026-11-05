module.exports = {
	root: true,
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	rules: {
		// Plain-JS project: JSDoc types are optional.
		'jsdoc/require-param-type': 'off',
		'jsdoc/require-param': 'off',
	},
	overrides: [
		{
			files: [ '**/test/**/*.js' ],
			extends: [ 'plugin:@wordpress/eslint-plugin/test-unit' ],
		},
	],
};

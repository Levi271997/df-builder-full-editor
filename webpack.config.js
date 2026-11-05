const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

const defaultEntries =
	typeof defaultConfig.entry === 'function' ? defaultConfig.entry() : defaultConfig.entry;

module.exports = {
	...defaultConfig,
	entry: {
		// block.json-discovered block entries (build/blocks/*).
		...defaultEntries,
		'editor/index': './src/editor/index.js',
		'admin/settings': './src/admin/settings/index.js',
		'full-editor/index': './src/full-editor/index.js',
	},
};

// Enable the Script Modules compiler so viewScriptModule files (Interactivity API)
// are built as native ES Modules alongside the classic compiler.
process.env.WP_EXPERIMENTAL_MODULES = 'true';

const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

// In @wordpress/scripts v29+, defaultConfig is an array when Script Module
// support is needed (i.e. blocks using viewScriptModule / Interactivity API).
// Index 0 = classic scripts config, index 1 = ES Script Modules config.
const classicConfig = Array.isArray( defaultConfig ) ? defaultConfig[ 0 ] : defaultConfig;
const moduleConfig  = Array.isArray( defaultConfig ) ? defaultConfig[ 1 ] : null;

const customClassicConfig = {
	...classicConfig,
	entry: {
		...classicConfig.entry(),
		'sass/blocks-editor': path.resolve(process.cwd(), 'src/sass', 'blocks-editor.scss'),
		'editor/index': path.resolve(process.cwd(), 'src/editor', 'index.js'),
		'acf/icon-picker-field/index': path.resolve(process.cwd(), 'src/acf/icon-picker-field', 'index.js'),
	},
	output: {
		...classicConfig.output,
		chunkFilename: 'vendors/[name].js',
	},
	optimization: {
		...classicConfig.optimization,
		minimize: true,
	},
};

// Export an array so both compilers run; the module config handles view.js files
// for the Interactivity API. If no module config exists (older wp-scripts), fall
// back to exporting just the classic config object.
module.exports = moduleConfig ? [ customClassicConfig, moduleConfig ] : customClassicConfig;

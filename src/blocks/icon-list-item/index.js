/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';
import save from './save';
import deprecatedVersions from './deprecated';

const icon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" style={{transform: 'scale(1.5)'}}>
		<polyline fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="5.210,11.498 6.710,13.000 9.710,10.000"/>
		<line fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" x1="12.288" y1="11.395" x2="17.342" y2="11.395"/>
	</svg>
);

registerBlockType( metadata.name, {
	...metadata,
	icon,
	edit,
	save,
	deprecated: deprecatedVersions,
} );

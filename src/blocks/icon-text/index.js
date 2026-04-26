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
import './style.scss';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';
import save from './save';
import transforms from './transforms';

const icon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" style={{transform: 'scale(1.75)'}}>
		<circle fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" cx="7.584" cy="11.717" r="3.305"/>
		<path fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M7.584 13.039l0 -1.322m0 -1.322l0.002 0"/>
		<path fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M15.91 9.074l0 5.287m-2.642 -4.296l0 -0.662c0,-0.182 0.149,-0.329 0.331,-0.329l4.625 0c0.182,0 0.331,0.146 0.331,0.329l0 0.662m-3.636 4.296l1.982 0"/>
	</svg>
);

registerBlockType( metadata.name, {
    ...metadata,
    icon,
    edit,
    save,
    transforms,
    example: {
        attributes: {
            content: 'Did you know?',
            level: 2,
        },
    },
} );
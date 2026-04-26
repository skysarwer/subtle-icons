import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import './style.scss';
import edit from './edit';
import metadata from './block.json';
import save from './save';
import transforms from './transforms';

const icon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" style={{transform: 'scale(1.375)'}}>
		<path fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M15.586 13.805l1.769 -1.769 -1.769 -1.769m-2.186 1.769l3.955 0"/>
		<g>
			<path fill="currentColor" d="M18.482 7.020l-12.862 0c-1.016,0 -1.838,0.823 -1.838,1.838l0 5.973c0,1.015 0.823,1.838 1.838,1.838l12.862 0c1.016,0 1.838,-0.823 1.838,-1.838l0 -5.973c0,-1.015 -0.823,-1.838 -1.838,-1.838l0 0zm-12.862 1.381l12.862 0c0.254,0 0.459,0.204 0.459,0.459l0 5.973c0,0.254 -0.204,0.459 -0.459,0.459l-12.862 0c-0.254,0 -0.459,-0.204 -0.459,-0.459l-0.002 -5.973c0.002,-0.254 0.206,-0.459 0.460,-0.459l0 0zm0 0l0 0 0 0z"/>
		</g>
		<line fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" x1="6.439" y1="12.010" x2="10.882" y2="12.010"/>
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
			className: 'is-style-fill',
			text: __( 'Call to action', 'subtle-icons' ),
		},
	},
} );

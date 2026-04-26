/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';
import save from './save';
import deprecated from './deprecated';
import transforms from './transforms';
import './style.scss';

const icon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		aria-hidden="true"
		focusable="false"
		style={ { transform: 'scale(1.5)' } }
	>
		<polyline
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			points="5.134,9.005 6.636,10.505 9.634,7.505"
		/>
		<polyline
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			points="5.246,14.141 6.749,15.641 9.746,12.641"
		/>
		<line
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			x1="12.194"
			y1="14.328"
			x2="17.249"
			y2="14.328"
		/>
		<line
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			x1="12.214"
			y1="8.902"
			x2="17.266"
			y2="8.902"
		/>
	</svg>
);

registerBlockType( metadata.name, {
	...metadata,
	icon,
	edit,
	save,
	deprecated,
	transforms,
	example: {
		innerBlocks: [
			{
				name: 'sbtl/icon-list-item',
				attributes: { content: __( 'Alice.' ) },
			},
			{
				name: 'sbtl/icon-list-item',
				attributes: { content: __( 'The White Rabbit.' ) },
			},
			{
				name: 'sbtl/icon-list-item',
				attributes: { content: __( 'The Cheshire Cat.' ) },
			},
		],
	},
} );

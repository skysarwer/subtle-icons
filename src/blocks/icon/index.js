
import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import edit from './edit';
import save from './save';
import deprecated from './deprecated';
import transforms from './transforms';
import json from './block.json';

const { name, ...settings } = json;

const icon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M6 3a3 3 0 0 0-3 3v.75a.75.75 0 0 0 1.5 0V6A1.5 1.5 0 0 1 6 4.5h.75a.75.75 0 0 0 0-1.5zm12 0h-.75a.75.75 0 0 0 0 1.5H18A1.5 1.5 0 0 1 19.5 6v.75a.75.75 0 0 0 1.5 0V6a3 3 0 0 0-3-3M6.75 19.5H6A1.5 1.5 0 0 1 4.5 18v-.75a.75.75 0 0 0-1.5 0V18a3 3 0 0 0 3 3h.75a.75.75 0 0 0 0-1.5m10.5 0a.75.75 0 0 0 0 1.5H18a3 3 0 0 0 3-3v-.75a.75.75 0 0 0-1.5 0V18a1.5 1.5 0 0 1-1.5 1.5zM10.5 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75m-6 7.5a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0zm6 8.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75m10.5-8.25a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0z"
        />
	</svg>
);

registerBlockType(name, {
    ...settings,
    icon,
    edit,
    save,
    deprecated,
    transforms,
    example: {
        attributes: {
            iconMarkup: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 14c.2-1 .7-1.7 1.5-2.5c1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5c.7.7 1.3 1.5 1.5 2.5m0 4h6m-5 4h4"/></svg>',
        },
    }
});

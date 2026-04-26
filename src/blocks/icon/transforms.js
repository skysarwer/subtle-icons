import { createBlock } from '@wordpress/blocks';

/**
 * Build a partial iconOptions object from icon block size/stroke values.
 * Returns null when neither is set, so callers can skip spreading the key.
 *
 * @param {string|undefined} size
 * @param {number|undefined} stroke
 * @return {Object|null}
 */
function iconOptionsFromIconBlock( size, stroke ) {
	const options = {};
	if ( size ) options.size = size;
	if ( stroke !== undefined ) options.stroke = stroke;
	return Object.keys( options ).length ? options : null;
}

const transforms = {
	to: [
		{
			type: 'block',
			blocks: [ 'sbtl/icon-text' ],
			priority: 5,
			transform( { iconMarkup, iconSlug, size, stroke } ) {
				const iconOptions = iconOptionsFromIconBlock( size, stroke );
				return createBlock( 'sbtl/icon-text', {
					...( iconMarkup ? { icon: iconMarkup } : {} ),
					...( iconSlug ? { iconSlug } : {} ),
					...( iconOptions ? { iconOptions } : {} ),
				} );
			},
		},
		{
			type: 'block',
			blocks: [ 'sbtl/icon-list' ],
			priority: 7,
			transform( { iconMarkup, iconSlug, size, stroke } ) {
				const iconOptions = iconOptionsFromIconBlock( size, stroke );
				const listItem = createBlock( 'sbtl/icon-list-item' );
				return createBlock(
					'sbtl/icon-list',
					{
						...( iconMarkup ? { icon: iconMarkup } : {} ),
						...( iconSlug ? { iconSlug } : {} ),
						...( iconOptions ? { iconOptions } : {} ),
					},
					[ listItem ]
				);
			},
		},
		{
			type: 'block',
			blocks: [ 'sbtl/icon-button' ],
			priority: 7,
			transform( { iconMarkup, iconSlug, size, stroke } ) {
				const slotOptions = iconOptionsFromIconBlock( size, stroke );
				return createBlock( 'sbtl/icon-button', {
					tagName: 'a',
					...( iconMarkup ? { leadingIcon: iconMarkup } : {} ),
					...( iconSlug ? { leadingIconSlug: iconSlug } : {} ),
					...( slotOptions
						? { iconOptions: { leading: slotOptions } }
						: {} ),
					disabledDefaultTrailingIcon: true,
				} );
			},
		},
		{
			type: 'block',
			blocks: [ 'sbtl/accordions' ],
			priority: 15,
			transform( { iconMarkup, iconSlug, size, stroke } ) {
				const featureIconOptions =
					iconOptionsFromIconBlock( size, stroke ) ?? {};
				const groupName = `sbtl-accordions-${ Math.random()
					.toString( 36 )
					.substring( 2, 10 ) }`;
				const accordionItem = createBlock( 'sbtl/accordion', {
					groupName,
					...( iconMarkup ? { featureIcon: iconMarkup } : {} ),
					...( iconSlug ? { featureIconSlug: iconSlug } : {} ),
				} );
				return createBlock(
					'sbtl/accordions',
					{
						groupName,
						...( Object.keys( featureIconOptions ).length
							? { featureIconOptions }
							: {} ),
					},
					[ accordionItem ]
				);
			},
		},
		{
			type: 'block',
			blocks: [ 'sbtl/tabs' ],
			priority: 15,
			transform( { iconMarkup, iconSlug, size, stroke } ) {
				const iconOptions = iconOptionsFromIconBlock( size, stroke );
				const tabItem = createBlock( 'sbtl/tab', {
					...( iconMarkup ? { featureIcon: iconMarkup } : {} ),
					...( iconSlug ? { featureIconSlug: iconSlug } : {} ),
				} );
				return createBlock(
					'sbtl/tabs',
					{
						groupName: `sbtl-tabs-${ Math.random()
							.toString( 36 )
							.substring( 2, 10 ) }`,
						...( iconOptions ? { IconOptions: iconOptions } : {} ),
					},
					[ tabItem ]
				);
			},
		},
	],
};

export default transforms;

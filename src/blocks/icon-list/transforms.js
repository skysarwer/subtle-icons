/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';

/**
 * Recursively convert a sbtl/icon-list-item (and any nested sbtl/icon-list
 * inner blocks) into a core/list-item.
 *
 * @param {Object} block A sbtl/icon-list-item block object.
 * @return {Object} Equivalent core/list-item block.
 */
function iconListItemToCoreListItem( block ) {
	const nestedInnerBlocks = block.innerBlocks.map( ( inner ) => {
		if ( inner.name === 'sbtl/icon-list' ) {
			return iconListToCoreList( inner );
		}
		return inner;
	} );

	return createBlock(
		'core/list-item',
		{ content: block.attributes.content || '' },
		nestedInnerBlocks
	);
}

/**
 * Recursively convert a core/list-item (and any nested core/list inner
 * blocks) into a sbtl/icon-list-item.
 *
 * @param {Object} block A core/list-item block object.
 * @return {Object} Equivalent sbtl/icon-list-item block.
 */
function coreListItemToIconListItem( block ) {
	const nestedInnerBlocks = block.innerBlocks.map( ( inner ) => {
		if ( inner.name === 'core/list' ) {
			return coreListToIconList( inner );
		}
		return inner;
	} );

	return createBlock(
		'sbtl/icon-list-item',
		{ content: block.attributes.content || '' },
		nestedInnerBlocks
	);
}

/**
 * Convert a sbtl/icon-list block into a core/list block.
 *
 * @param {Object} block A sbtl/icon-list block object.
 * @return {Object} Equivalent core/list block.
 */
function iconListToCoreList( block ) {
	return createBlock(
		'core/list',
		{
			ordered: block.attributes.ordered || false,
			type: block.attributes.type,
			start: block.attributes.start,
			reversed: block.attributes.reversed,
		},
		block.innerBlocks.map( iconListItemToCoreListItem )
	);
}

/**
 * Convert a core/list block into a sbtl/icon-list block.
 *
 * @param {Object} block A core/list block object.
 * @return {Object} Equivalent sbtl/icon-list block.
 */
function coreListToIconList( block ) {
	return createBlock(
		'sbtl/icon-list',
		{
			ordered: block.attributes.ordered || false,
			type: block.attributes.type,
			start: block.attributes.start,
			reversed: block.attributes.reversed,
		},
		block.innerBlocks.map( coreListItemToIconListItem )
	);
}

const transforms = {
	to: [
		{
			type: 'block',
			blocks: [ 'sbtl/icon-text' ],
			priority: 7,
			transform( attributes, innerBlocks ) {
				const sharedAttrs = {
					...( attributes.icon ? { icon: attributes.icon } : {} ),
					...( attributes.iconSlug ? { iconSlug: attributes.iconSlug } : {} ),
					...( attributes.iconOptions && Object.keys( attributes.iconOptions ).length
						? { iconOptions: attributes.iconOptions } : {} ),
					...( attributes.iconColor ? { iconColor: attributes.iconColor } : {} ),
				};

				if ( ! innerBlocks.length ) {
					return createBlock( 'sbtl/icon-text', sharedAttrs );
				}

				return innerBlocks.map( ( item ) => {
					const itemAttrs = item.attributes;
					return createBlock(
						'sbtl/icon-text',
						{
							...sharedAttrs,
							...( itemAttrs.content !== undefined ? { content: itemAttrs.content } : {} ),
							...( itemAttrs.url ? {
								url: itemAttrs.url,
								linkTarget: itemAttrs.linkTarget,
								rel: itemAttrs.rel,
							} : {} ),
						}
					);
				} );
			},
		},
		{
			type: 'block',
			blocks: [ 'sbtl/icon-button' ],
			priority: 10,
			transform( attributes, innerBlocks ) {
				const sharedAttrs = {
					disabledDefaultTrailingIcon: true,
					...( attributes.icon ? { leadingIcon: attributes.icon } : {} ),
					...( attributes.iconSlug ? { leadingIconSlug: attributes.iconSlug } : {} ),
					...( attributes.icon && attributes.iconOptions && Object.keys( attributes.iconOptions ).length
						? { iconOptions: { leading: attributes.iconOptions } } : {} ),
					...( attributes.anchor ? { anchor: attributes.anchor } : {} ),
				};

				if ( ! innerBlocks.length ) {
					return createBlock( 'sbtl/icon-button', sharedAttrs );
				}

				return innerBlocks.map( ( item ) => {
					const itemAttrs = item.attributes;
					return createBlock(
						'sbtl/icon-button',
						{
							...sharedAttrs,
							...( itemAttrs.content !== undefined ? { text: itemAttrs.content } : {} ),
							tagName: 'a',
							...( itemAttrs.url ? {
								url: itemAttrs.url,
								linkTarget: itemAttrs.linkTarget,
								rel: itemAttrs.rel,
							} : {} ),
						}
					);
				} );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/list' ],
			priority: 5,
			transform( attributes, innerBlocks ) {
				return createBlock(
					'core/list',
					{
						ordered: attributes.ordered || false,
						type: attributes.type,
						start: attributes.start,
						reversed: attributes.reversed,
					},
					innerBlocks.map( iconListItemToCoreListItem )
				);
			},
		},
	],
	from: [
		{
			type: 'block',
			blocks: [ 'core/list' ],
			priority: 5,
			transform( attributes, innerBlocks ) {
				return createBlock(
					'sbtl/icon-list',
					{
						ordered: attributes.ordered || false,
						type: attributes.type,
						start: attributes.start,
						reversed: attributes.reversed,
					},
					innerBlocks.map( coreListItemToIconListItem )
				);
			},
		},
		{
			type: 'block',
			blocks: [ 'sbtl/icon-text' ],
			priority: 7,
			transform( attributes ) {
				const listItem = createBlock(
					'sbtl/icon-list-item',
					{
						...( attributes.content !== undefined ? { content: attributes.content } : {} ),
						...( attributes.url ? {
							url: attributes.url,
							linkTarget: attributes.linkTarget,
							rel: attributes.rel,
						} : {} ),
					}
				);
				return createBlock(
					'sbtl/icon-list',
					{
						...( attributes.icon ? { icon: attributes.icon } : {} ),
						...( attributes.iconSlug ? { iconSlug: attributes.iconSlug } : {} ),
						...( attributes.iconOptions && Object.keys( attributes.iconOptions ).length
							? { iconOptions: attributes.iconOptions } : {} ),
						...( attributes.iconColor ? { iconColor: attributes.iconColor } : {} ),
						...( attributes.anchor ? { anchor: attributes.anchor } : {} ),
					},
					[ listItem ]
				);
			},
		},
		{
			type: 'block',
			isMultiBlock: true,
			blocks: [ 'sbtl/icon-button' ],
			priority: 10,
			transform( blocksAttributesList ) {
				const first = blocksAttributesList[ 0 ] ?? {};
				const hasLeading = !! first.leadingIcon;
				const icon = hasLeading ? first.leadingIcon : first.trailingIcon;
				const iconSlug = hasLeading ? first.leadingIconSlug : first.trailingIconSlug;
				const slotOptions = hasLeading
					? first.iconOptions?.leading
					: first.iconOptions?.trailing;
				const listItems = blocksAttributesList.map( ( attrs ) =>
					createBlock(
						'sbtl/icon-list-item',
						{
							...( attrs.text !== undefined ? { content: attrs.text } : {} ),
							...( attrs.tagName === 'a' && attrs.url ? {
								url: attrs.url,
								linkTarget: attrs.linkTarget,
								rel: attrs.rel,
							} : {} ),
						}
					)
				);
				return createBlock(
					'sbtl/icon-list',
					{
						...( icon ? { icon } : {} ),
						...( iconSlug ? { iconSlug } : {} ),
						...( slotOptions && Object.keys( slotOptions ).length
							? { iconOptions: slotOptions } : {} ),
						...( first.anchor ? { anchor: first.anchor } : {} ),
					},
					listItems
				);
			},
		},
		{
			type: 'block',
			isMultiBlock: true,
			blocks: [ 'sbtl/icon-text' ],
			priority: 10,
			transform( blocksAttributesList ) {
				const first = blocksAttributesList[ 0 ] ?? {};
				const listItems = blocksAttributesList.map( ( attrs ) =>
					createBlock(
						'sbtl/icon-list-item',
						{
							...( attrs.content !== undefined ? { content: attrs.content } : {} ),
							...( attrs.url ? {
								url: attrs.url,
								linkTarget: attrs.linkTarget,
								rel: attrs.rel,
							} : {} ),
						}
					)
				);
				return createBlock(
					'sbtl/icon-list',
					{
						...( first.icon ? { icon: first.icon } : {} ),
						...( first.iconSlug ? { iconSlug: first.iconSlug } : {} ),
						...( first.iconOptions && Object.keys( first.iconOptions ).length
							? { iconOptions: first.iconOptions } : {} ),
						...( first.iconColor ? { iconColor: first.iconColor } : {} ),
						...( first.anchor ? { anchor: first.anchor } : {} ),
					},
					listItems
				);
			},
		},
	],
};

export default transforms;

/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		ordered,
		type,
		reversed,
		start,
		iconOptions,
		iconColor,
		iconLinkHoverColor,
	} = attributes;
	const TagName = ordered ? 'ol' : 'ul';
	return (
		<TagName
			{ ...useBlockProps.save( {
				reversed,
				start,
				style: {
					listStyleType:
						ordered && type !== 'decimal' ? type : undefined,
					'--sbtl-icon-size': iconOptions?.size || undefined,
					'--sbtl-icon-gap': iconOptions?.gap || undefined,
					'--sbtl-icon-color': iconColor || undefined,
					'--sbtl-icon-link-hover-color':
						iconLinkHoverColor || undefined,
					'--sbtl-icon-stroke': iconOptions?.stroke || undefined,
					'--sbtl-icon-align': iconOptions?.align || undefined,
				},
			} ) }
		>
			<InnerBlocks.Content />
		</TagName>
	);
}

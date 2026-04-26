import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

const v1 = {
	attributes: {
		ordered: {
			type: 'boolean',
			default: false,
			role: 'content',
		},
		values: {
			type: 'string',
			source: 'html',
			selector: 'ol,ul',
			multiline: 'li',
			default: '',
			role: 'content',
		},
		type: {
			type: 'string',
		},
		start: {
			type: 'number',
		},
		reversed: {
			type: 'boolean',
		},
		placeholder: {
			type: 'string',
		},
		icon: {
			type: 'string',
			default: '',
		},
		iconSize: {
			type: 'number',
			default: 24,
		},
		iconGap: {
			type: 'string',
			default: '',
		},
		iconColor: {
			type: 'string',
			default: '',
		},
		iconLinkHoverColor: {
			type: 'string',
			default: '',
		},
		iconThickness: {
			type: 'number',
			default: 2,
		},
		disabledDefaultIcon: {
			type: 'boolean',
			default: false,
		},
	},

	save( { attributes } ) {
		const {
			ordered,
			type,
			reversed,
			start,
			iconSize,
			iconColor,
			iconLinkHoverColor,
			iconThickness,
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
						'--sbtl-icon-size': iconSize ? `${ iconSize }px` : undefined,
						'--sbtl-icon-color': iconColor || undefined,
						'--sbtl-icon-link-hover-color':
							iconLinkHoverColor || undefined,
						'--sbtl-icon-stroke': iconThickness ?? undefined,
					},
				} ) }
			>
				<InnerBlocks.Content />
			</TagName>
		);
	},

	migrate( { iconSize, iconGap, iconThickness, iconOptions = {}, ...rest } ) {
		const migratedOptions = { ...iconOptions };
		if ( iconSize ) migratedOptions.size = `${ iconSize }px`;
		if ( iconThickness != null ) migratedOptions.stroke = iconThickness;
		return { ...rest, iconOptions: migratedOptions };
	},
};

export default [ v1 ];

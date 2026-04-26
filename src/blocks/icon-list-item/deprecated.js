import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

const v1 = {
	attributes: {
		placeholder: { type: 'string' },
		content: {
			type: 'rich-text',
			source: 'rich-text',
			selector: 'li > div',
			role: 'content',
		},
		icon: { type: 'string', default: '' },
		iconSlug: { type: 'string', default: '' },
		hasCustomIcon: { type: 'boolean', default: false },
		iconColor: { type: 'string', default: '' },
		iconLinkHoverColor: { type: 'string', default: '' },
	},

	save( { attributes } ) {
		const { content, icon, iconColor, iconLinkHoverColor } = attributes;
		return (
			<li
				{ ...useBlockProps.save( {
					style: {
						'--sbtl-icon-color': iconColor || undefined,
						'--sbtl-icon-link-hover-color': iconLinkHoverColor || undefined,
					},
				} ) }
			>
				{ icon && (
					<span
						className="sbtl-icon-list-item__icon"
						dangerouslySetInnerHTML={ { __html: icon } }
						aria-hidden="true"
					/>
				) }
				<RichText.Content tagName="div" value={ content } />
				<InnerBlocks.Content />
			</li>
		);
	},

	migrate( attributes ) {
		return attributes;
	},
};

const deprecated = [ v1 ];

export default deprecated;

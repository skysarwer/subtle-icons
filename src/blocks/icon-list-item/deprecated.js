import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

// v2: old structure with sbtl-icon-list-item__icon span and classless div.
// Uses isEligible so Gutenberg doesn't need save() to match exactly.
// Sources icon from the HTML span so encoding differences don't matter.
const v2 = {
	attributes: {
		placeholder: { type: 'string' },
		content: {
			type: 'rich-text',
			source: 'rich-text',
			selector: 'div',
			role: 'content',
		},
		icon: {
			type: 'string',
			source: 'html',
			selector: '.sbtl-icon-list-item__icon',
			default: '',
		},
		iconSlug: { type: 'string', default: '' },
		hasCustomIcon: { type: 'boolean', default: false },
		iconColor: { type: 'string', default: '' },
		iconLinkHoverColor: { type: 'string', default: '' },
	},

	isEligible( _attributes, _innerBlocks, { originalContent = '' } = {} ) {
		return (
			!! originalContent &&
			originalContent.includes( 'sbtl-icon-list-item__icon' )
		);
	},

	save( { attributes } ) {
		const { content, icon } = attributes;
		return (
			<li>
				{ icon && (
					<span
						className="sbtl-icon-list-item__icon"
						dangerouslySetInnerHTML={ { __html: icon } }
						aria-hidden="true"
					/>
				) }
				<RichText.Content tagName="div" value={ content } />
			</li>
		);
	},

	migrate( attributes ) {
		return attributes;
	},
};

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
						'--sbtl-icon-link-hover-color':
							iconLinkHoverColor || undefined,
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

const deprecated = [ v2, v1 ];

export default deprecated;

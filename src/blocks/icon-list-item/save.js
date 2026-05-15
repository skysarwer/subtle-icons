/**
 * WordPress dependencies
 */
import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		content,
		icon,
		iconColor,
		iconLinkHoverColor,
		iconAlign,
		url,
		linkTarget,
		rel,
	} = attributes;

	const iconMarkup = icon ? (
		<span
			className="sbtl-icon"
			dangerouslySetInnerHTML={ { __html: icon } }
			aria-hidden="true"
			style={ iconAlign ? { alignSelf: iconAlign } : undefined }
		/>
	) : null;

	const contentMarkup = (
		<RichText.Content
			tagName="div"
			className="sbtl-icon-list-item__content"
			value={ content }
		/>
	);

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
			{ url ? (
				<a
					href={ url }
					className="sbtl-icon-region"
					target={ linkTarget || undefined }
					rel={ rel || undefined }
				>
					{ iconMarkup }
					{ contentMarkup }
				</a>
			) : (
				<span className="sbtl-icon-region">
					{ iconMarkup }
					{ contentMarkup }
				</span>
			) }
			<InnerBlocks.Content />
		</li>
	);
}

import { createBlock } from '@wordpress/blocks';

import { cleanObject } from '../../utils/object';

function parseHTML( html = '' ) {
	const container = document.createElement( 'div' );
	container.innerHTML = html;
	return container;
}

function isMeaningfulNode( node ) {
	if ( ! node ) {
		return false;
	}

	if ( node.nodeType === Node.TEXT_NODE ) {
		return !! node.textContent?.trim();
	}

	return node.nodeType === Node.ELEMENT_NODE;
}

function getMeaningfulNodes( root ) {
	return Array.from( root.childNodes ).filter( isMeaningfulNode );
}

function isLineBreak( node ) {
	return node?.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR';
}

function getTextAlignFromClassName( className ) {
	if ( typeof className !== 'string' ) {
		return undefined;
	}

	const match = className.match( /(?:^|\s)has-text-align-([\w-]+)(?=\s|$)/ );

	return match?.[ 1 ];
}

function stripTextAlignClasses( className ) {
	if ( typeof className !== 'string' ) {
		return className;
	}

	const normalizedClassName = className
		.replace( /(?:^|\s)has-text-align-[\w-]+(?=\s|$)/g, ' ' )
		.trim()
		.replace( /\s+/g, ' ' );

	return normalizedClassName || undefined;
}

function normalizeTextAlignStyle( style, className, deprecatedTextAlign ) {
	const textAlign =
		style?.typography?.textAlign ||
		deprecatedTextAlign ||
		getTextAlignFromClassName( className );

	if ( ! textAlign ) {
		return style;
	}

	return cleanObject( {
		...( style || {} ),
		typography: cleanObject( {
			...( style?.typography || {} ),
			textAlign,
		} ),
	} );
}

function getSharedRichTextAttributes( attributes = {} ) {
	return cleanObject( {
		align: attributes.align,
		anchor: attributes.anchor,
		backgroundColor: attributes.backgroundColor,
		className: stripTextAlignClasses( attributes.className ),
		fontSize: attributes.fontSize,
		gradient: attributes.gradient,
		placeholder: attributes.placeholder,
		style: normalizeTextAlignStyle(
			attributes.style,
			attributes.className,
			attributes.textAlign
		),
		textColor: attributes.textColor,
	} );
}

function getIconMarkupFromNode( node ) {
	if ( node?.nodeType !== Node.ELEMENT_NODE ) {
		return undefined;
	}

	if ( node.tagName === 'SVG' ) {
		return node.outerHTML;
	}

	const svg = node.matches( '.sbtl-icon' )
		? node.querySelector( 'svg' )
		: node.childElementCount === 1 && node.firstElementChild?.tagName === 'SVG'
			? node.firstElementChild
			: undefined;

	if ( svg && ! node.textContent?.trim() ) {
		return svg.outerHTML;
	}

	return undefined;
}

function extractSingleWrapperLink( html = '' ) {
	const container = parseHTML( html );
	const anchors = container.querySelectorAll( 'a' );

	if ( ! anchors.length ) {
		return {
			content: container.innerHTML,
		};
	}

	if ( anchors.length !== 1 ) {
		return undefined;
	}

	const meaningfulNodes = getMeaningfulNodes( container );

	if (
		meaningfulNodes.length !== 1 ||
		meaningfulNodes[ 0 ]?.nodeType !== Node.ELEMENT_NODE ||
		meaningfulNodes[ 0 ]?.tagName !== 'A'
	) {
		return undefined;
	}

	const anchor = meaningfulNodes[ 0 ];

	return {
		content: anchor.innerHTML,
		url: anchor.getAttribute( 'href' ) || undefined,
		linkTarget: anchor.getAttribute( 'target' ) || undefined,
		rel: anchor.getAttribute( 'rel' ) || undefined,
	};
}

function extractBoundaryIcon( html = '' ) {
	const container = parseHTML( html );
	const meaningfulNodes = getMeaningfulNodes( container );

	if ( ! meaningfulNodes.length ) {
		return { content: '' };
	}

	const firstNode = meaningfulNodes[ 0 ];
	const lastNode = meaningfulNodes[ meaningfulNodes.length - 1 ];
	const firstIcon = getIconMarkupFromNode( firstNode );
	const lastIcon = meaningfulNodes.length > 1
		? getIconMarkupFromNode( lastNode )
		: undefined;

	if ( firstIcon && lastIcon ) {
		return { invalid: true };
	}

	if ( firstIcon ) {
		firstNode.remove();

		let iconPosition = 'left';
		const nextNode = getMeaningfulNodes( container )[ 0 ];

		if ( isLineBreak( nextNode ) ) {
			nextNode.remove();
			iconPosition = 'top';
		}

		if ( container.querySelector( 'svg' ) ) {
			return { invalid: true };
		}

		return {
			content: container.innerHTML,
			icon: firstIcon,
			iconPosition,
		};
	}

	if ( lastIcon ) {
		lastNode.remove();

		if ( container.querySelector( 'svg' ) ) {
			return { invalid: true };
		}

		return {
			content: container.innerHTML,
			icon: lastIcon,
			iconPosition: 'right',
		};
	}

	if ( container.querySelector( 'svg' ) ) {
		return { invalid: true };
	}

	return {
		content: container.innerHTML,
	};
}

function richTextBlockToIconTextAttributes( attributes = {}, level = 0 ) {
	const linkedContent = extractSingleWrapperLink( attributes.content || '' );

	if ( ! linkedContent ) {
		return undefined;
	}

	const extractedIcon = extractBoundaryIcon( linkedContent.content );

	if ( extractedIcon.invalid ) {
		return undefined;
	}

	return cleanObject( {
		...getSharedRichTextAttributes( attributes ),
		content: extractedIcon.content,
		icon: extractedIcon.icon,
		iconPosition: extractedIcon.iconPosition,
		level,
		url: linkedContent.url,
		linkTarget: linkedContent.linkTarget,
		rel: linkedContent.rel,
	} );
}

function serializeIconTextContent( attributes = {} ) {
	const { content = '', icon = '', iconPosition = 'left', url, linkTarget, rel } =
		attributes;

	let innerHTML = content || '';

	if ( icon ) {
		if ( iconPosition === 'right' ) {
			innerHTML = `${ innerHTML }${ icon }`;
		} else if ( iconPosition === 'top' ) {
			innerHTML = `${ icon }${ innerHTML ? '<br />' : '' }${ innerHTML }`;
		} else {
			innerHTML = `${ icon }${ innerHTML }`;
		}
	}

	if ( ! url ) {
		return innerHTML;
	}

	const anchor = document.createElement( 'a' );
	anchor.setAttribute( 'href', url );

	if ( linkTarget ) {
		anchor.setAttribute( 'target', linkTarget );
	}

	if ( rel ) {
		anchor.setAttribute( 'rel', rel );
	}

	anchor.innerHTML = innerHTML || url;

	return anchor.outerHTML;
}

function iconTextToParagraphAttributes( attributes = {} ) {
	return cleanObject( {
		...getSharedRichTextAttributes( attributes ),
		content: serializeIconTextContent( attributes ),
	} );
}

function iconTextToHeadingAttributes( attributes = {} ) {
	const level = Number.isFinite( attributes.level ) && attributes.level >= 1 && attributes.level <= 6
		? attributes.level
		: 2;

	return cleanObject( {
		...getSharedRichTextAttributes( attributes ),
		content: serializeIconTextContent( attributes ),
		level,
	} );
}

function getIconButtonSlot( iconPosition = 'left' ) {
	return iconPosition === 'right' ? 'trailing' : 'leading';
}

function getIconTextIconOptionsFromButton( attributes = {} ) {
	const hasLeadingIcon = !! attributes.leadingIcon;
	const hasTrailingIcon = !! attributes.trailingIcon;
	const hasToggleIcon =
		!! attributes.iconOptions?.leading?.toggleIcon ||
		!! attributes.iconOptions?.trailing?.toggleIcon;

	if ( hasToggleIcon ) {
		return { unsupported: true };
	}

	const useTrailingIcon = ! hasLeadingIcon && hasTrailingIcon;
	const slotOptions = useTrailingIcon
		? attributes.iconOptions?.trailing
		: attributes.iconOptions?.leading;

	return {
		icon: useTrailingIcon ? attributes.trailingIcon : attributes.leadingIcon,
		iconPosition: useTrailingIcon
			? attributes.iconLayout === 'vertical'
				? 'top'
				: 'right'
			: attributes.iconLayout === 'vertical'
				? 'top'
				: 'left',
		iconOptions: cleanObject( {
			size: slotOptions?.size,
			gap: slotOptions?.gap,
			stroke: slotOptions?.stroke,
			align: slotOptions?.align,
		} ),
	};
}

function iconButtonToIconTextAttributes( attributes = {} ) {
	const iconData = getIconTextIconOptionsFromButton( attributes );

	if ( iconData.unsupported ) {
		return undefined;
	}

	return {
		...cleanObject( {
			anchor: attributes.anchor,
			icon: iconData.icon,
			iconOptions: iconData.iconOptions,
			iconPosition: iconData.iconPosition,
			level: 0,
			linkTarget: attributes.tagName === 'a' ? attributes.linkTarget : undefined,
			placeholder: attributes.placeholder,
			rel: attributes.tagName === 'a' ? attributes.rel : undefined,
			shadow: attributes.stateAppearance?.shadow,
			url: attributes.tagName === 'a' ? attributes.url : undefined,
			width:
				typeof attributes.width === 'number'
					? `${ attributes.width }%`
					: undefined,
		} ),
		...( attributes.text !== undefined ? { content: attributes.text } : {} ),
	};
}

function getIconButtonWidth( width ) {
	if ( typeof width !== 'string' ) {
		return undefined;
	}

	const match = width.trim().match( /^(25|50|75|100)%$/ );

	if ( ! match ) {
		return undefined;
	}

	return Number( match[ 1 ] );
}

function iconTextToIconButtonAttributes( attributes = {} ) {
	const slot = getIconButtonSlot( attributes.iconPosition );
	const iconLayout = attributes.iconPosition === 'top' ? 'vertical' : 'horizontal';

	return {
		...cleanObject( {
			anchor: attributes.anchor,
			iconLayout,
			iconOptions: attributes.icon
				? {
					[ slot ]: cleanObject( {
						size: attributes.iconOptions?.size,
						gap: attributes.iconOptions?.gap,
						stroke: attributes.iconOptions?.stroke,
						align: attributes.iconOptions?.align,
					} ),
				}
				: undefined,
			leadingIcon: slot === 'leading' ? attributes.icon : undefined,
			linkTarget: attributes.url ? attributes.linkTarget : undefined,
			placeholder: attributes.placeholder,
			rel: attributes.url ? attributes.rel : undefined,
			stateAppearance: attributes.shadow
				? {
					shadow: attributes.shadow,
				}
				: undefined,
			disabledDefaultTrailingIcon: true,
			tagName: 'a',
			trailingIcon: slot === 'trailing' ? attributes.icon : undefined,
			url: attributes.url,
			width: getIconButtonWidth( attributes.width ),
		} ),
		...( attributes.content !== undefined ? { text: attributes.content } : {} ),
	};
}

const transforms = {
	from: [
		{
			type: 'block',
			blocks: [ 'sbtl/icon-list' ],
			priority: 7,
			isMatch: ( attributes, innerBlocks ) => innerBlocks.length <= 1,
			transform( attributes, innerBlocks ) {
				const firstItem = innerBlocks[ 0 ]?.attributes ?? {};
				return createBlock(
					'sbtl/icon-text',
					{
						...cleanObject( {
							anchor: attributes.anchor,
							icon: attributes.icon,
							iconColor: attributes.iconColor,
							iconOptions: attributes.iconOptions && Object.keys( attributes.iconOptions ).length
								? attributes.iconOptions : undefined,
							iconSlug: attributes.iconSlug,
							linkTarget: firstItem.url ? firstItem.linkTarget : undefined,
							rel: firstItem.url ? firstItem.rel : undefined,
							url: firstItem.url,
						} ),
						...( firstItem.content !== undefined ? { content: firstItem.content } : {} ),
					}
				);
			},
		},
		{
			type: 'block',
			blocks: [ 'core/paragraph' ],
			priority: 10,
			isMatch: ( attributes ) => !! richTextBlockToIconTextAttributes( attributes, 0 ),
			transform: ( attributes ) =>
				createBlock(
					'sbtl/icon-text',
					richTextBlockToIconTextAttributes( attributes, 0 )
				),
		},
		{
			type: 'block',
			blocks: [ 'core/heading' ],
			priority: 10,
			isMatch: ( attributes ) =>
				!! richTextBlockToIconTextAttributes( attributes, attributes.level || 2 ),
			transform: ( attributes ) =>
				createBlock(
					'sbtl/icon-text',
					richTextBlockToIconTextAttributes( attributes, attributes.level || 2 )
				),
		},
		{
			type: 'block',
			blocks: [ 'sbtl/icon-button' ],
			priority: 5,
			isMatch: ( attributes ) => !! iconButtonToIconTextAttributes( attributes ),
			transform: ( attributes ) =>
				createBlock(
					'sbtl/icon-text',
					iconButtonToIconTextAttributes( attributes )
				),
		},
	],
	to: [
		{
			type: 'block',
			blocks: [ 'core/paragraph' ],
			priority: 10,
			transform: ( attributes ) =>
				createBlock( 'core/paragraph', iconTextToParagraphAttributes( attributes ) ),
		},
		{
			type: 'block',
			blocks: [ 'core/heading' ],
			priority: 10,
			transform: ( attributes ) =>
				createBlock( 'core/heading', iconTextToHeadingAttributes( attributes ) ),
		},
		{
			type: 'block',
			blocks: [ 'sbtl/icon-button' ],
			priority: 5,
			transform: ( attributes ) =>
				createBlock(
					'sbtl/icon-button',
					iconTextToIconButtonAttributes( attributes )
				),
		},
		{
			type: 'block',
			blocks: [ 'sbtl/icon-list' ],
			priority: 7,
			transform: ( attributes ) => {
				const listItem = createBlock(
					'sbtl/icon-list-item',
					{
						...cleanObject( {
							url: attributes.url,
							linkTarget: attributes.linkTarget,
							rel: attributes.rel,
						} ),
						...( attributes.content !== undefined ? { content: attributes.content } : {} ),
					}
				);
				return createBlock(
					'sbtl/icon-list',
					cleanObject( {
						icon: attributes.icon,
						iconSlug: attributes.iconSlug,
						iconOptions: attributes.iconOptions,
						iconColor: attributes.iconColor,
						anchor: attributes.anchor,
					} ),
					[ listItem ]
				);
			},
		},
	],
};

export default transforms;
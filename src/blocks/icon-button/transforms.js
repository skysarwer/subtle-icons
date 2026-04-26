import { createBlock } from '@wordpress/blocks';

import { cleanObject } from '../../utils/object';

/**
 * Parses an HTML fragment into a detached DOM container.
 *
 * Detached parsing keeps the transform logic simple when extracting link
 * attributes or normalizing inline markup, without mutating editor content in
 * place.
 *
 * @param {string} [html=''] Raw HTML to parse.
 * @return {HTMLDivElement} A container whose child nodes represent the markup.
 */
function parseHTML( html = '' ) {
	const container = document.createElement( 'div' );
	container.innerHTML = html;
	return container;
}

/**
 * Removes anchor elements while preserving their child nodes.
 *
 * Paragraph-to-button transforms need the human-visible text without nested
 * links so the resulting RichText value stays valid regardless of whether the
 * source paragraph was linked.
 *
 * @param {ParentNode} root Parsed markup container to normalize in place.
 */
function unwrapAnchors( root ) {
	root.querySelectorAll( 'a' ).forEach( ( anchor ) => {
		anchor.replaceWith( ...anchor.childNodes );
	} );
}

/**
 * Extracts a legacy text alignment value from generated block classes.
 *
 * Gutenberg historically persisted text alignment as `has-text-align-*`
 * classes. During transforms those classes can survive even when the canonical
 * `style.typography.textAlign` attribute is missing, so we recover the semantic
 * value here before removing the generated class names.
 *
 * @param {string|undefined} className Block className attribute.
 * @return {string|undefined} Parsed text alignment value.
 */
function getTextAlignFromClassName( className ) {
	if ( typeof className !== 'string' ) {
		return undefined;
	}

	const match = className.match( /(?:^|\s)has-text-align-([\w-]+)(?=\s|$)/ );

	return match?.[ 1 ];
}

/**
 * Removes generated text alignment classes from a block className string.
 *
 * Alignment classes should be derived from `style.typography.textAlign`, not
 * persisted independently. Stripping them during transforms prevents stale class
 * names from accumulating and causing duplicate alignment classes after several
 * round trips.
 *
 * @param {string|undefined} className Block className attribute.
 * @return {string|undefined} className without generated text alignment classes.
 */
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

/**
 * Ensures text alignment is stored in the canonical typography style attribute.
 *
 * Some transformed blocks arrive with alignment encoded only as a generated
 * class name. Promoting that class back into `style.typography.textAlign` keeps
 * the semantic attribute and rendered classes in sync.
 *
 * @param {Object|undefined} style Existing block style object.
 * @param {string|undefined} className Block className attribute.
 * @param {string|undefined} deprecatedTextAlign Legacy top-level textAlign attribute.
 * @return {Object|undefined} Style object with normalized text alignment.
 */
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

/**
 * Builds a CSS variable reference for a WordPress preset slug.
 *
 * Core button blocks store preset selections as slugs, while this block needs a
 * concrete CSS value during transformation. Converting here preserves the link
 * back to theme presets instead of flattening them to hard-coded colors.
 *
 * @param {string} slug Preset slug from block attributes.
 * @param {string} type Preset group, typically color or gradient.
 * @return {string|undefined} CSS variable reference when a slug is present.
 */
function getPresetCSSValue( slug, type ) {
	if ( ! slug ) {
		return undefined;
	}

	return `var(--wp--preset--${ type }--${ slug })`;
}

/**
 * Detects whether a value is a literal CSS gradient declaration.
 *
 * Core and custom blocks can represent gradients either as preset references or
 * as raw CSS. This helper covers the raw CSS case so both formats survive round
 * trips between blocks.
 *
 * @param {*} value Value to inspect.
 * @return {boolean} True when the value contains a CSS gradient function.
 */
function isGradientValue( value ) {
	return typeof value === 'string' && /gradient\s*\(/i.test( value );
}

/**
 * Extracts preset metadata from a WordPress preset CSS variable.
 *
 * When converting back to core/button we need to know whether a stored value is
 * still a theme preset so it can be written back to the dedicated preset
 * attributes instead of the generic inline style object.
 *
 * @param {*} value Style value that may reference a preset variable.
 * @return {{ type: string, slug: string }|undefined} Parsed preset info.
 */
function getPresetInfo( value ) {
	if ( typeof value !== 'string' ) {
		return undefined;
	}

	const match = value
		.trim()
		.match( /^var\(--wp--preset--(color|gradient)--([^)]+)\)$/ );

	if ( ! match ) {
		return undefined;
	}

	return {
		type: match[ 1 ],
		slug: match[ 2 ],
	};
}

/**
 * Determines whether a background value should be treated as a gradient.
 *
 * Backgrounds may come from either preset CSS variables or literal gradient
 * strings. The transform code needs a single decision point so it can map the
 * value to `gradient` or `background` consistently.
 *
 * @param {*} value Background style value.
 * @return {boolean} True when the value represents a gradient background.
 */
function isGradientBackgroundValue( value ) {
	const presetInfo = getPresetInfo( value );
	return presetInfo?.type === 'gradient' || isGradientValue( value );
}

/**
 * Collects the visual defaults represented by a core/button block.
 *
 * Core button styling is split between dedicated preset attributes and the style
 * object. This helper resolves those sources into the icon-button block's
 * `stateAppearance.default` shape so the visual result survives the transform.
 *
 * @param {Object} attributes Core button style-related attributes.
 * @return {Object|undefined} Normalized default appearance payload.
 */
function getCoreButtonDefaultAppearance( {
	backgroundColor,
	textColor,
	gradient,
	style,
} ) {
	return cleanObject( {
		background:
			style?.color?.gradient ||
			getPresetCSSValue( gradient, 'gradient' ) ||
			style?.color?.background ||
			getPresetCSSValue( backgroundColor, 'color' ),
		text: style?.color?.text || getPresetCSSValue( textColor, 'color' ),
		color: style?.border?.color,
		shadow: style?.shadow,
	} );
}

/**
 * Removes default visual styling from the core/button style object.
 *
 * After copying a core button's default look into `stateAppearance`, we
 * strip the overlapping properties from `style` to avoid storing the same visual
 * state twice in the icon-button attributes.
 *
 * @param {Object|undefined} style Original core/button style object.
 * @return {Object|undefined} Remaining non-default style data.
 */
function stripCoreButtonDefaultAppearance( style ) {
	const nextStyle = { ...( style || {} ) };
	delete nextStyle.color;
	delete nextStyle.shadow;

	if ( nextStyle.border ) {
		nextStyle.border = cleanObject( {
			...nextStyle.border,
			color: undefined,
		} );
	}

	return cleanObject( nextStyle );
}

/**
 * Resolves the icon-button default appearance from the current schema.
 *
 * The icon-button block stores its default visuals at the root of
 * `stateAppearance`.
 * Transforms should use that canonical source.
 *
 * @param {Object|undefined} stateAppearance Stateful appearance settings.
 * @return {Object|undefined} Normalized default appearance values.
 */
function getIconButtonDefaultAppearance( stateAppearance ) {
	const defaultAppearance = stateAppearance || {};

	return cleanObject( {
		background: defaultAppearance.background,
		text: defaultAppearance.text,
		color: defaultAppearance.color,
		leadingIcon: defaultAppearance.leadingIcon,
		trailingIcon: defaultAppearance.trailingIcon,
		shadow: defaultAppearance.shadow,
	} );
}

/**
 * Normalizes RichText-like values into an HTML string.
 *
 * Block transforms can receive plain strings, RichText values exposing
 * `toHTMLString()`, or arrays of mixed fragments. Normalizing them here keeps
 * downstream helpers focused on attribute mapping rather than editor data shapes.
 *
 * @param {*} value RichText-compatible value.
 * @return {string|undefined} HTML string representation of the value.
 */
function normalizeRichTextValue( value ) {
	if ( typeof value === 'string' ) {
		return value;
	}

	if ( value && typeof value.toHTMLString === 'function' ) {
		return value.toHTMLString();
	}

	if ( Array.isArray( value ) ) {
		const container = document.createElement( 'div' );
		container.innerHTML = value.map( normalizeRichTextValue ).join( '' );

		return container.innerHTML;
	}

	return undefined;
}

/**
 * Removes the icon-button text wrapper when rich text arrives as serialized block HTML.
 *
 * Icon-button saves its label inside `.wp-block-button__link-text`, while
 * core/button stores label markup directly on the link element. During repeated
 * transforms Gutenberg can hand us either shape, so this normalizes back to the
 * raw label markup both blocks expect in their `text` attribute.
 *
 * @param {string|undefined} value Normalized rich-text HTML.
 * @return {string|undefined} Label markup without the icon-button wrapper span.
 */
function unwrapButtonTextValue( value ) {
	if ( typeof value !== 'string' || ! value.trim() ) {
		return value;
	}

	const container = parseHTML( value );
	const wrapper = container.firstElementChild;

	if (
		container.childNodes.length !== 1 ||
		! wrapper ||
		wrapper.tagName !== 'SPAN' ||
		! wrapper.classList.contains( 'wp-block-button__link-text' )
	) {
		return value;
	}

	return wrapper.innerHTML;
}

/**
 * Reads the button label from whichever attribute shape is available.
 *
 * Different source blocks and editor versions may expose button text as `text`
 * or `content`. This helper centralizes that fallback so transforms remain
 * tolerant of both shapes.
 *
 * @param {Object} [attributes={}] Block attributes containing RichText fields.
 * @return {string|undefined} Normalized button label markup.
 */
function getButtonText( attributes = {} ) {
	return unwrapButtonTextValue(
		normalizeRichTextValue( attributes.text ) ??
			normalizeRichTextValue( attributes.content )
	);
}

/**
 * Converts core/button attributes into the icon-button attribute schema.
 *
 * This maps core's split style model into the icon-button block's default state
 * appearance while preserving non-visual attributes and normalizing text into a
 * single field.
 *
 * @param {Object} attributes Attributes from a core/button block instance.
 * @return {Object|undefined} Attributes suitable for sbtl/icon-button.
 */
function coreButtonToIconButtonAttributes( attributes ) {
	const {
		backgroundColor,
		className,
		content,
		textColor,
		textAlign,
		gradient,
		style,
		...coreAttributes
	} = attributes;

	const defaultAppearance = getCoreButtonDefaultAppearance( {
		backgroundColor,
		textColor,
		gradient,
		style,
	} );
	const normalizedStyle = normalizeTextAlignStyle(
		style,
		className,
		textAlign
	);
	const nextAttributes = cleanObject( {
		...coreAttributes,
		className: stripTextAlignClasses( className ),
		text: getButtonText( attributes ),
		style: stripCoreButtonDefaultAppearance( normalizedStyle ),
		stateAppearance: defaultAppearance || undefined,
	} );

	return nextAttributes;
}

/**
 * Converts icon-button attributes back into the core/button schema.
 *
 * Core/button expects preset slugs to live in dedicated attributes and custom
 * values to live in `style.color`. This helper reconstructs that split while
 * omitting icon-specific data that core/button cannot represent.
 *
 * @param {Object} attributes Attributes from an sbtl/icon-button block instance.
 * @return {Object|undefined} Attributes suitable for core/button.
 */
function iconButtonToCoreButtonAttributes( attributes ) {
	const {
		className,
		icon,
		iconMarkup,
		text,
		textAlign,
		toggleIcon,
		endIcon,
		iconPosition,
		iconSize,
		stateAppearance,
		style,
		...coreAttributes
	} = attributes;
	const normalizedStyle = normalizeTextAlignStyle(
		style,
		className,
		textAlign
	);
	const normalizedTextAlign = normalizedStyle?.typography?.textAlign;
	const defaultAppearance = getIconButtonDefaultAppearance( stateAppearance );
	const backgroundPreset = getPresetInfo( defaultAppearance?.background );
	const textPreset = getPresetInfo( defaultAppearance?.text );
	const backgroundIsGradient = isGradientBackgroundValue(
		defaultAppearance?.background
	);
	const nextAttributes = cleanObject( {
		...coreAttributes,
		className: stripTextAlignClasses( className ),
		text: getButtonText( attributes ),
		textAlign: normalizedTextAlign,
		backgroundColor:
			backgroundPreset?.type === 'color'
				? backgroundPreset.slug
				: undefined,
		textColor: textPreset?.type === 'color' ? textPreset.slug : undefined,
		gradient:
			backgroundPreset?.type === 'gradient'
				? backgroundPreset.slug
				: undefined,
		style: cleanObject( {
			...( normalizedStyle || {} ),
			color: cleanObject( {
				...( normalizedStyle?.color || {} ),
				background:
					defaultAppearance?.background &&
					! backgroundIsGradient &&
					backgroundPreset?.type !== 'color'
						? defaultAppearance.background
						: undefined,
				text:
					defaultAppearance?.text && textPreset?.type !== 'color'
						? defaultAppearance.text
						: undefined,
				gradient:
					defaultAppearance?.background &&
					backgroundIsGradient &&
					backgroundPreset?.type !== 'gradient'
						? defaultAppearance.background
						: undefined,
			} ),
			border: cleanObject( {
				...( normalizedStyle?.border || {} ),
				color: defaultAppearance?.color,
			} ),
			shadow: defaultAppearance?.shadow ?? normalizedStyle?.shadow,
		} ),
	} );

	return nextAttributes;
}

/**
 * Converts a paragraph block into the subset of icon-button link attributes it can represent.
 *
 * The source paragraph may contain inline markup and optionally a single link.
 * We preserve the visible content as button text, extract the first anchor's
 * metadata, and infer an anchor tag only when a link exists.
 *
 * @param {Object} attributes Attributes from a core/paragraph block instance.
 * @return {Object} Partial icon-button attribute payload.
 */
function paragraphToIconButtonAttributes( attributes ) {
	const { content = '' } = attributes;
	const container = parseHTML( content );
	const link = container.querySelector( 'a' );
	const textRoot = parseHTML( content );
	unwrapAnchors( textRoot );
	const nextAttributes = {
		text: textRoot.innerHTML || '',
		tagName: link ? 'a' : undefined,
		url: link?.getAttribute( 'href' ) || undefined,
		title: link?.getAttribute( 'title' ) || undefined,
		linkTarget: link?.getAttribute( 'target' ) || undefined,
		rel: link?.getAttribute( 'rel' ) || undefined,
	};

	return nextAttributes;
}

/**
 * Converts icon-button text and link attributes into paragraph content markup.
 *
 * Paragraph blocks cannot represent icon state, button semantics, or the custom
 * appearance model. This helper intentionally reduces the block to plain text or
 * a single anchor element, which is the closest safe paragraph equivalent.
 *
 * @param {Object} attributes Attributes from an sbtl/icon-button block instance.
 * @return {{ content: string }} Paragraph attributes containing serialized HTML.
 */
function iconButtonToParagraphAttributes( attributes ) {
	const { tagName, text, url, title, linkTarget, rel } = attributes;

	if ( ! text && ! url ) {
		return { content: '' };
	}

	if ( ! url || tagName === 'button' ) {
		return { content: text || '' };
	}

	const anchor = document.createElement( 'a' );
	anchor.setAttribute( 'href', url );

	if ( title ) {
		anchor.setAttribute( 'title', title );
	}

	if ( linkTarget ) {
		anchor.setAttribute( 'target', linkTarget );
	}

	if ( rel ) {
		anchor.setAttribute( 'rel', rel );
	}

	anchor.innerHTML = text || url;

	return {
		content: anchor.outerHTML,
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
				return createBlock( 'sbtl/icon-button', {
					disabledDefaultTrailingIcon: true,
					...( attributes.icon
						? { leadingIcon: attributes.icon }
						: {} ),
					...( attributes.iconSlug
						? { leadingIconSlug: attributes.iconSlug }
						: {} ),
					...( attributes.icon &&
					attributes.iconOptions &&
					Object.keys( attributes.iconOptions ).length
						? { iconOptions: { leading: attributes.iconOptions } }
						: {} ),
					...( attributes.anchor
						? { anchor: attributes.anchor }
						: {} ),
					...( firstItem.content !== undefined
						? { text: firstItem.content }
						: {} ),
					tagName: firstItem.url ? 'a' : 'button',
					...( firstItem.url
						? {
								url: firstItem.url,
								linkTarget: firstItem.linkTarget,
								rel: firstItem.rel,
						  }
						: {} ),
				} );
			},
		},
		{
			type: 'block',
			blocks: [ 'core/button' ],
			priority: 5,
			transform: ( attributes ) =>
				createBlock( 'sbtl/icon-button', {
					disabledDefaultTrailingIcon: true,
					...coreButtonToIconButtonAttributes( attributes ),
				} ),
		},
		{
			type: 'block',
			blocks: [ 'core/paragraph' ],
			priority: 20,
			isMatch: ( { content = '' } ) => {
				const container = parseHTML( content );
				const textRoot = parseHTML( content );
				unwrapAnchors( textRoot );
				const text = textRoot.textContent || '';
				const links = container.querySelectorAll( 'a' );

				return text.length <= 30 && links.length <= 1;
			},
			transform: ( attributes ) =>
				createBlock( 'sbtl/icon-button', {
					disabledDefaultTrailingIcon: true,
					...paragraphToIconButtonAttributes( attributes ),
				} ),
		},
	],
	to: [
		{
			type: 'block',
			blocks: [ 'sbtl/icon-list' ],
			priority: 10,
			transform( attributes ) {
				const hasLeading = !! attributes.leadingIcon;
				const icon = hasLeading
					? attributes.leadingIcon
					: attributes.trailingIcon;
				const iconSlug = hasLeading
					? attributes.leadingIconSlug
					: attributes.trailingIconSlug;
				const slotOptions = hasLeading
					? attributes.iconOptions?.leading
					: attributes.iconOptions?.trailing;
				const listItem = createBlock( 'sbtl/icon-list-item', {
					...( attributes.text !== undefined
						? { content: attributes.text }
						: {} ),
					...( attributes.tagName === 'a' && attributes.url
						? {
								url: attributes.url,
								linkTarget: attributes.linkTarget,
								rel: attributes.rel,
						  }
						: {} ),
				} );
				return createBlock(
					'sbtl/icon-list',
					{
						...( icon ? { icon } : {} ),
						...( iconSlug ? { iconSlug } : {} ),
						...( slotOptions && Object.keys( slotOptions ).length
							? { iconOptions: slotOptions }
							: {} ),
						...( attributes.anchor
							? { anchor: attributes.anchor }
							: {} ),
					},
					[ listItem ]
				);
			},
		},
		{
			type: 'block',
			blocks: [ 'core/button' ],
			priority: 5,
			transform: ( attributes ) =>
				createBlock(
					'core/button',
					iconButtonToCoreButtonAttributes( attributes )
				),
		},
		/*{
			type: 'block',
			blocks: [ 'core/paragraph' ],
			priority: 20,
			transform: ( attributes ) =>
				createBlock(
					'core/paragraph',
					iconButtonToParagraphAttributes( attributes )
				),
		},*/
	],
};

export default transforms;

/**
 * WordPress dependencies
 */
import {
	RichText,
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	InspectorControls,
	PanelColorSettings,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { isRTL, __ } from '@wordpress/i18n';
import {
	PanelBody,
	ToolbarButton,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from '@wordpress/components';
import {
	formatOutdent,
	formatOutdentRTL,
	formatIndentRTL,
	formatIndent,
	justifyTop,
	justifyCenterVertical,
	justifyBottom,
} from '@wordpress/icons';
import { useMergeRefs } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { displayShortcut } from '@wordpress/keycodes';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	useEnter,
	useSpace,
	useIndentListItem,
	useOutdentListItem,
	useMerge,
} from './hooks';
import {
	IconPickerTrigger,
	IconPickerPreview,
} from '../../components/IconPicker';
import IconPickerModal from '../../components/IconPicker/IconPickerModal';
import useIconAutoResolve from '../../components/IconPicker/useIconAutoResolve';
import LinkControl from '../../components/LinkControl';
import InlineLinksConflictNotice from '../../components/InlineLinksConflictNotice';
import {
	hasInlineAnchors,
	removeInlineAnchors,
} from '../../utils/inline-links';

const NEW_TAB_REL = 'noreferrer noopener';
const NOFOLLOW_REL = 'nofollow';

function getUpdatedLinkAttributes( {
	rel = '',
	url = '',
	opensInNewTab,
	nofollow,
} ) {
	let newLinkTarget;
	let updatedRel = rel;

	if ( opensInNewTab ) {
		newLinkTarget = '_blank';
		updatedRel = updatedRel?.includes( NEW_TAB_REL )
			? updatedRel
			: `${ updatedRel } ${ NEW_TAB_REL }`.trim();
	} else {
		updatedRel = updatedRel
			?.replace( new RegExp( `\\b${ NEW_TAB_REL }\\s*`, 'g' ), '' )
			.trim();
	}

	if ( nofollow ) {
		updatedRel = updatedRel?.includes( NOFOLLOW_REL )
			? updatedRel
			: `${ updatedRel } ${ NOFOLLOW_REL }`.trim();
	} else {
		updatedRel = updatedRel
			?.replace( new RegExp( `\\b${ NOFOLLOW_REL }\\s*`, 'g' ), '' )
			.trim();
	}

	return {
		url,
		linkTarget: newLinkTarget,
		rel: updatedRel || undefined,
	};
}

export function IndentUI( { clientId } ) {
	const indentListItem = useIndentListItem( clientId );
	const outdentListItem = useOutdentListItem();
	const { canIndent, canOutdent } = useSelect(
		( select ) => {
			const { getBlockIndex, getBlockRootClientId, getBlockName } =
				select( blockEditorStore );
			return {
				canIndent: getBlockIndex( clientId ) > 0,
				canOutdent:
					getBlockName(
						getBlockRootClientId( getBlockRootClientId( clientId ) )
					) === 'sbtl/icon-list-item',
			};
		},
		[ clientId ]
	);

	return (
		<>
			<ToolbarButton
				icon={ isRTL() ? formatOutdentRTL : formatOutdent }
				title={ __( 'Outdent' ) }
				shortcut={ displayShortcut.shift( 'Tab' ) }
				description={ __( 'Outdent list item' ) }
				disabled={ ! canOutdent }
				onClick={ () => outdentListItem() }
			/>
			<ToolbarButton
				icon={ isRTL() ? formatIndentRTL : formatIndent }
				title={ __( 'Indent' ) }
				shortcut="Tab"
				description={ __( 'Indent list item' ) }
				disabled={ ! canIndent }
				onClick={ () => indentListItem() }
			/>
		</>
	);
}

export default function ListItemEdit( {
	attributes,
	setAttributes,
	clientId,
	mergeBlocks,
	context,
} ) {
	const {
		placeholder,
		content,
		icon,
		iconSlug,
		hasCustomIcon,
		iconColor,
		iconLinkHoverColor,
		iconAlign,
		url,
		linkTarget,
		rel,
	} = attributes;
	const opensInNewTab = linkTarget === '_blank';
	const nofollow = !! rel?.includes( NOFOLLOW_REL );
	const hasInlineContentLinks = ! url && hasInlineAnchors( content );

	const inheritedIcon = context[ 'sbtl/icon-list/icon' ] || '';

	// When the parent icon changes and this item hasn't been customised,
	// keep the item's saved icon in sync with the inherited one.
	useEffect( () => {
		if ( ! hasCustomIcon && icon !== inheritedIcon ) {
			setAttributes( { icon: inheritedIcon } );
		}
	}, [ inheritedIcon, hasCustomIcon ] );

	// The effective icon for the editor preview is always the saved icon
	// (kept in sync above), or the inherited one before the first sync.
	const effectiveIcon = hasCustomIcon ? icon : inheritedIcon;
	const [ isIconModalOpen, setIsIconModalOpen ] = useState( false );

	useIconAutoResolve(
		icon,
		( svg ) => setAttributes( { icon: svg } ),
		( slug ) => setAttributes( { iconSlug: slug } )
	);

	const handleIconChange = ( newIcon ) => {
		if ( ! newIcon ) {
			// Clearing resets to inherited — effect will re-sync on next render.
			setAttributes( { icon: '', iconSlug: '', hasCustomIcon: false } );
		} else {
			setAttributes( { icon: newIcon, hasCustomIcon: true } );
		}
	};

	const handleIconSlugChange = ( slug ) =>
		setAttributes( { iconSlug: slug } );

	const blockProps = useBlockProps( {
		style: {
			'--sbtl-icon-color': iconColor || undefined,
			'--sbtl-icon-link-hover-color': iconLinkHoverColor || undefined,
		},
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		renderAppender: false,
		__unstableDisableDropZone: true,
	} );
	const useEnterRef = useEnter( { content, clientId } );
	const useSpaceRef = useSpace( clientId );
	const richTextRef = useMergeRefs( [ useEnterRef, useSpaceRef ] );
	const onMerge = useMerge( clientId, mergeBlocks );

	// When Gutenberg splits the list item on Enter (non-empty content), it focuses
	// the new block's first interactive element — which is the icon edit button.
	// After the split we redirect focus to the contenteditable instead.
	const handleRichTextKeyDown = ( event ) => {
		const isEnter = event.keyCode === 13;
		const isBackspace = event.keyCode === 8;
		if ( ! isEnter && ! isBackspace ) {
			return;
		}
		// Enter only applies when there is content to split.
		if ( isEnter && ! content.length ) {
			return;
		}
		// Let Gutenberg's default merge/split logic run, then fix focus.
		requestAnimationFrame( () => {
			const active =
				useEnterRef.current?.ownerDocument?.activeElement ||
				useSpaceRef.current?.ownerDocument?.activeElement;
			if (
				active &&
				active.classList.contains( 'sbtl-icon-picker-canvas__edit' )
			) {
				const editable = active
					.closest( '[data-block]' )
					?.querySelector( '[contenteditable]' );
				if ( editable ) {
					editable.focus();
				}
			}
		} );
	};

	return (
		<>
			<li { ...innerBlocksProps }>
				{ url ? (
					<span className="sbtl-icon-region">
						<IconPickerPreview
							value={ effectiveIcon }
							onOpen={ () => setIsIconModalOpen( true ) }
							showPlaceholder={ false }
							style={
								iconAlign ? { alignSelf: iconAlign } : undefined
							}
						/>
						<RichText
							ref={ richTextRef }
							identifier="content"
							tagName="div"
							onChange={ ( nextContent ) =>
								setAttributes( { content: nextContent } )
							}
							value={ content }
							aria-label={ __( 'List text' ) }
							placeholder={ placeholder || __( 'List' ) }
							onMerge={ onMerge }
							onKeyDown={ handleRichTextKeyDown }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
						/>
					</span>
				) : (
					<span className="sbtl-icon-region">
						<IconPickerPreview
							value={ effectiveIcon }
							onOpen={ () => setIsIconModalOpen( true ) }
							className="sbtl-icon-list-item__icon"
							showPlaceholder={ false }
							style={
								iconAlign ? { alignSelf: iconAlign } : undefined
							}
						/>
						<RichText
							ref={ richTextRef }
							identifier="content"
							tagName="div"
							onChange={ ( nextContent ) =>
								setAttributes( { content: nextContent } )
							}
							value={ content }
							aria-label={ __( 'List text' ) }
							placeholder={ placeholder || __( 'List' ) }
							onMerge={ onMerge }
							onKeyDown={ handleRichTextKeyDown }
						/>
					</span>
				) }
				{ innerBlocksProps.children }
			</li>
			<BlockControls group="block">
				<IndentUI clientId={ clientId } />
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'Icon', 'subtle-icons' ) }
					initialOpen={ true }
				>
					<IconPickerTrigger
						label={ __( 'Custom Icon', 'subtle-icons' ) }
						value={ icon }
						onOpen={ () => setIsIconModalOpen( true ) }
						onClear={ () => handleIconChange( '' ) }
					/>
					<ToggleGroupControl
						label={ __( 'Vertical Align', 'subtle-icons' ) }
						value={ iconAlign }
						onChange={ ( value ) =>
							setAttributes( { iconAlign: value || '' } )
						}
						isDeselectable
						className="sbtl-deselectable-toggle-group"
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOptionIcon
							value="flex-start"
							icon={ justifyTop }
							label={ __( 'Start', 'subtle-icons' ) }
						/>
						<ToggleGroupControlOptionIcon
							value="center"
							icon={ justifyCenterVertical }
							label={ __( 'Center', 'subtle-icons' ) }
						/>
						<ToggleGroupControlOptionIcon
							value="flex-end"
							icon={ justifyBottom }
							label={ __( 'End', 'subtle-icons' ) }
						/>
					</ToggleGroupControl>
				</PanelBody>{ ' ' }
				<PanelBody title={ __( 'Link', 'subtle-icons' ) }>
					<LinkControl
						label={ __( 'Link', 'subtle-icons' ) }
						value={ url }
						help={
							! url
								? __(
										'Wrap the list item in a link.',
										'subtle-icons'
								  )
								: undefined
						}
						onChange={ ( value ) => {
							const nextAttributes = { url: value };
							if ( value && hasInlineAnchors( content ) ) {
								nextAttributes.content =
									removeInlineAnchors( content );
							}
							setAttributes( nextAttributes );
						} }
						searchInputPlaceholder={ __(
							'Search or type URL',
							'subtle-icons'
						) }
						buttonLabel={ __( 'Edit Link', 'subtle-icons' ) }
						popoverContent={
							hasInlineContentLinks
								? ( { showDefaultContent, closePopover } ) => (
										<InlineLinksConflictNotice
											content={ content }
											showDefaultContent={
												showDefaultContent
											}
											closePopover={ closePopover }
											onPromote={ ( attrs ) =>
												setAttributes( attrs )
											}
										/>
								  )
								: undefined
						}
					/>
					{ url && (
						<>
							<ToggleControl
								label={ __(
									'Open in new tab',
									'subtle-icons'
								) }
								checked={ opensInNewTab }
								onChange={ ( value ) =>
									setAttributes(
										getUpdatedLinkAttributes( {
											rel,
											url,
											opensInNewTab: value,
											nofollow,
										} )
									)
								}
							/>
							<ToggleControl
								label={ __(
									'Mark as nofollow',
									'subtle-icons'
								) }
								checked={ nofollow }
								onChange={ ( value ) =>
									setAttributes(
										getUpdatedLinkAttributes( {
											rel,
											url,
											opensInNewTab,
											nofollow: value,
										} )
									)
								}
							/>
						</>
					) }
				</PanelBody>{ ' ' }
			</InspectorControls>
			<InspectorControls group="color">
				<PanelColorSettings
					title={ __( 'Icon Color', 'subtle-icons' ) }
					className="sbtl-minimal-color-panel"
					__experimentalIsRenderedInSidebar={ true }
					colorSettings={ [
						{
							value: iconColor,
							onChange: ( value ) =>
								setAttributes( { iconColor: value || '' } ),
							label: __( 'Icon', 'subtle-icons' ),
							clearable: true,
						},
						{
							value: iconLinkHoverColor,
							onChange: ( value ) =>
								setAttributes( {
									iconLinkHoverColor: value || '',
								} ),
							label: __( 'Icon Link Hover', 'subtle-icons' ),
							clearable: true,
						},
					] }
				/>
			</InspectorControls>
			<IconPickerModal
				isOpen={ isIconModalOpen }
				onClose={ () => setIsIconModalOpen( false ) }
				initialValue={ effectiveIcon }
				initialSlug={ iconSlug }
				onSelect={ ( svg ) => {
					handleIconChange( svg );
					setIsIconModalOpen( false );
				} }
				onSelectSlug={ handleIconSlugChange }
			/>
		</>
	);
}

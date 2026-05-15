import {
	BlockControls,
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { PanelBody, ToolbarButton } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { isRTL, __ } from '@wordpress/i18n';
import {
	formatListBullets,
	formatListBulletsRTL,
	formatListNumbered,
	formatListNumberedRTL,
	formatOutdent,
	formatOutdentRTL,
} from '@wordpress/icons';
import { createBlock } from '@wordpress/blocks';
import { useCallback, useEffect, Platform } from '@wordpress/element';

/**
 * Internal dependencies
 */
import IconPicker from '../../components/IconPicker';
import IconOptionsPanel from '../../components/IconOptionsPanel';
import OrderedListSettings from './ordered-list-settings';
import TagName from './tag-name';

const DEFAULT_BLOCK = {
	name: 'sbtl/icon-list-item',
};
const TEMPLATE = [ [ 'sbtl/icon-list-item' ] ];
const NATIVE_MARGIN_SPACING = 8;

function useOutdentList( clientId ) {
	const { replaceBlocks, selectionChange } = useDispatch( blockEditorStore );
	const { getBlockRootClientId, getBlockAttributes, getBlock } =
		useSelect( blockEditorStore );

	return useCallback( () => {
		const parentBlockId = getBlockRootClientId( clientId );
		const parentBlockAttributes = getBlockAttributes( parentBlockId );
		// Create a new parent block without the inner blocks.
		const newParentBlock = createBlock(
			'sbtl/icon-list-item',
			parentBlockAttributes
		);
		const { innerBlocks } = getBlock( clientId );
		// Replace the parent block with a new parent block without inner blocks,
		// and make the inner blocks siblings of the parent.
		replaceBlocks( [ parentBlockId ], [ newParentBlock, ...innerBlocks ] );
		// Select the last child of the list being outdent.
		selectionChange( innerBlocks[ innerBlocks.length - 1 ].clientId );
	}, [ clientId ] );
}

function IndentUI( { clientId } ) {
	const outdentList = useOutdentList( clientId );
	const canOutdent = useSelect(
		( select ) => {
			const { getBlockRootClientId, getBlockName } =
				select( blockEditorStore );
			return (
				getBlockName( getBlockRootClientId( clientId ) ) ===
				'sbtl/icon-list-item'
			);
		},
		[ clientId ]
	);
	return (
		<>
			<ToolbarButton
				icon={ isRTL() ? formatOutdentRTL : formatOutdent }
				title={ __( 'Outdent' ) }
				description={ __( 'Outdent list item' ) }
				disabled={ ! canOutdent }
				onClick={ outdentList }
			/>
		</>
	);
}

export default function Edit( { attributes, setAttributes, clientId, style } ) {
	const {
		ordered,
		type,
		reversed,
		start,
		icon,
		iconSlug,
		iconOptions,
		iconColor,
		iconLinkHoverColor,
		disabledDefaultIcon,
	} = attributes;

	const setIconOption = ( partial ) =>
		setAttributes( { iconOptions: { ...iconOptions, ...partial } } );

	// Detect if this is a top-level icon-list (parent is not sbtl/icon-list-item).
	const isTopLevel = useSelect(
		( select ) => {
			const { getBlockRootClientId, getBlockName } =
				select( blockEditorStore );
			const rootId = getBlockRootClientId( clientId );
			return ! rootId || getBlockName( rootId ) !== 'sbtl/icon-list-item';
		},
		[ clientId ]
	);

	// Auto-populate the default check icon for top-level lists.
	useEffect( () => {
		if (
			isTopLevel &&
			! icon &&
			! disabledDefaultIcon &&
			window.sbtl_list_icons?.check
		) {
			setAttributes( { icon: window.sbtl_list_icons.check } );
		}
	}, [ isTopLevel, icon, disabledDefaultIcon ] );

	const handleIconChange = ( newIcon ) => {
		if ( ! newIcon ) {
			// Admin explicitly removed the icon — disable the default.
			setAttributes( {
				icon: '',
				iconSlug: '',
				disabledDefaultIcon: true,
			} );
		} else {
			setAttributes( { icon: newIcon, disabledDefaultIcon: false } );
		}
	};

	const blockProps = useBlockProps( {
		style: {
			...( Platform.isNative && style ),
			listStyleType: ordered && type !== 'decimal' ? type : undefined,
			'--sbtl-icon-size': iconOptions?.size || undefined,
			'--sbtl-icon-gap': iconOptions?.gap || undefined,
			'--sbtl-icon-color': iconColor || undefined,
			'--sbtl-icon-link-hover-color': iconLinkHoverColor || undefined,
			'--sbtl-icon-stroke': iconOptions?.stroke || undefined,
			'--sbtl-icon-align': iconOptions?.align || undefined,
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		defaultBlock: DEFAULT_BLOCK,
		directInsert: true,
		template: TEMPLATE,
		templateLock: '',
		templateInsertUpdatesSelection: true,
		...( Platform.isNative && {
			marginVertical: NATIVE_MARGIN_SPACING,
			marginHorizontal: NATIVE_MARGIN_SPACING,
			renderAppender: false,
		} ),
		__experimentalCaptureToolbars: true,
	} );

	const controls = (
		<BlockControls group="block">
			<ToolbarButton
				icon={ isRTL() ? formatListBulletsRTL : formatListBullets }
				title={ __( 'Unordered' ) }
				description={ __( 'Convert to unordered list' ) }
				isActive={ ordered === false }
				onClick={ () => {
					setAttributes( { ordered: false } );
				} }
			/>
			<ToolbarButton
				icon={ isRTL() ? formatListNumberedRTL : formatListNumbered }
				title={ __( 'Ordered' ) }
				description={ __( 'Convert to ordered list' ) }
				isActive={ ordered === true }
				onClick={ () => {
					setAttributes( { ordered: true } );
				} }
			/>
			<IndentUI clientId={ clientId } />
		</BlockControls>
	);

	return (
		<>
			<TagName
				ordered={ ordered }
				reversed={ reversed }
				start={ start }
				{ ...innerBlocksProps }
			/>
			{ controls }
			<InspectorControls>
				<PanelBody title={ __( 'Icon Settings', 'subtle-icons' ) }>
					<IconPicker
						label={ __( 'List Icon', 'subtle-icons' ) }
						value={ icon }
						initialSlug={ iconSlug }
						onChange={ handleIconChange }
						onSlugChange={ ( slug ) =>
							setAttributes( { iconSlug: slug } )
						}
						allowReset={ true }
					/>
				</PanelBody>
				<IconOptionsPanel
					iconOptions={ iconOptions }
					onChange={ setIconOption }
					onResetAll={ () => setAttributes( { iconOptions: {} } ) }
				/>
			</InspectorControls>
			<InspectorControls group="color">
				<PanelColorSettings
					title={ __( 'Icon Color', 'subtle-icons' ) }
					className="sbtl-minimal-color-panel"
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
			{ ordered && (
				<OrderedListSettings
					{ ...{
						setAttributes,
						reversed,
						start,
						type,
					} }
				/>
			) }
		</>
	);
}

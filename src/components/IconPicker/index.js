/* eslint-disable @wordpress/no-base-control-with-label-without-id */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockEditingMode } from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	Tooltip,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { reset, copy, check } from '@wordpress/icons';
import IconPickerModal from './IconPickerModal';
import PlaceHolderSVG from '../PlaceHolderSVG';
import useIconAutoResolve from './useIconAutoResolve';

/**
 * IconPickerTrigger — purely visual trigger button, no modal or internal state.
 * Use this when the parent block owns the modal (multi-slot or multi-trigger cases).
 * @param {Object}   props
 * @param {string}   props.value
 * @param {string}   props.label
 * @param {Function} props.onOpen
 * @param {Function} props.onClear
 * @param {boolean}  props.isLoading
 * @param {boolean}  props.hideLabel
 */
export const IconPickerTrigger = ( {
	value,
	label = __( 'Icon', 'subtle-icons' ),
	onOpen,
	onClear,
	isLoading = false,
	hideLabel = false,
} ) => {
	const hasIcon = value && value.trim().startsWith( '<' );
	const [ isCopied, setIsCopied ] = useState( false );
	let previewContent;

	if ( isLoading ) {
		previewContent = <span className="components-spinner"></span>;
	} else if ( hasIcon ) {
		previewContent = (
			<div
				dangerouslySetInnerHTML={ { __html: value } }
				style={ { display: 'flex' } }
			/>
		);
	} else {
		previewContent = <PlaceHolderSVG style={ { display: 'contents' } } />;
	}

	return (
		<BaseControl
			label={ hideLabel ? undefined : label }
			className="sbtl-icon-picker-base-control"
		>
			<HStack gap={ 2 } className="sbtl-icon-picker-control">
				<div
					className="sbtl-icon-picker-trigger"
					onClick={ onOpen }
					role="button"
					tabIndex={ 0 }
					onKeyDown={ ( e ) => {
						if ( e.key === 'Enter' || e.key === ' ' ) {
							onOpen();
						}
					} }
				>
					<div className="sbtl-icon-picker-preview">
						{ previewContent }
					</div>
					<div className="sbtl-icon-picker-label">
						{ hasIcon
							? __( 'Change Icon', 'subtle-icons' )
							: __( 'Select Icon', 'subtle-icons' ) }
					</div>
					{ hasIcon && onClear && (
						<Button
							icon={ reset }
							label={ __( 'Remove Icon', 'subtle-icons' ) }
							className="sbtl-reset-icon-button"
							variant="link"
							onClick={ ( e ) => {
								e.stopPropagation();
								onClear();
							} }
						/>
					) }
				</div>
				{ hasIcon && (
					<Button
						icon={ isCopied ? check : copy }
						label={
							isCopied
								? __( 'SVG Copied!', 'subtle-icons' )
								: __( 'Copy SVG', 'subtle-icons' )
						}
						variant="link"
						onClick={ ( e ) => {
							e.stopPropagation();
							navigator.clipboard.writeText( value );
							setIsCopied( true );
							setTimeout( () => setIsCopied( false ), 2000 );
						} }
					/>
				) }
			</HStack>
		</BaseControl>
	);
};

/**
 * IconPickerPreview — an inline canvas-area icon preview intended for use directly
 * in the block's editor output. Always clickable; shows the icon SVG when set,
 * or a dashed placeholder when empty. Use alongside IconPickerModal.
 * @param {Object}   props
 * @param {string}   props.value
 * @param {Function} props.onOpen
 * @param {string}   props.label
 * @param {string}   props.className
 * @param {Object}   props.style
 * @param {boolean}  props.showPlaceholder
 * @param {boolean}  props.hideTabindex
 * @param {boolean}  props.showEditButton
 */
export const IconPickerPreview = ( {
	value,
	onOpen,
	label,
	className,
	style,
	showPlaceholder = true,
	hideTabindex = false,
	showEditButton = true,
} ) => {
	const hasIcon = value && value.trim().startsWith( '<' );
	const blockEditingMode = useBlockEditingMode();
	const isBlockPreview =
		blockEditingMode === 'disabled' || ! blockEditingMode;
	const editLabel =
		label ||
		( hasIcon
			? __( 'Change icon', 'subtle-icons' )
			: __( 'Select icon', 'subtle-icons' ) );
	const canEdit =
		! isBlockPreview && showEditButton && typeof onOpen === 'function';
	let previewContent = null;

	if ( hasIcon ) {
		previewContent = (
			<span
				dangerouslySetInnerHTML={ { __html: value } }
				className={ `sbtl-icon sbtl-icon--anchor${
					className ? ` ${ className }` : ''
				}` }
				style={ style }
			/>
		);
	} else if ( showPlaceholder ) {
		previewContent = (
			<PlaceHolderSVG
				className={ `sbtl-icon sbtl-icon--anchor${
					className ? ` ${ className }` : ''
				}` }
				style={ style }
			/>
		);
	}

	return (
		<>
			{ previewContent }
			{ canEdit && ( hasIcon || showPlaceholder ) && (
				<Tooltip text={ editLabel }>
					<Button
						className="sbtl-icon-picker-canvas__edit"
						label={ editLabel }
						tabIndex={ hideTabindex ? -1 : undefined }
						onClick={ onOpen }
					/>
				</Tooltip>
			) }
		</>
	);
};

/**
 * IconPicker — convenience wrapper for single-slot usage.
 * Manages its own modal state internally. For multi-slot or multi-trigger
 * scenarios, use IconPickerTrigger + IconPickerModal directly.
 * @param {Object}   props
 * @param {string}   props.value
 * @param {string}   props.label
 * @param {Function} props.onChange
 * @param {Function} props.onSlugChange
 * @param {string}   props.initialSlug
 * @param {boolean}  props.hideLabel
 */
const IconPicker = ( {
	value,
	label = __( 'Icon', 'subtle-icons' ),
	onChange,
	onSlugChange,
	initialSlug = '',
	hideLabel = false,
} ) => {
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	// Auto-resolve slug string (e.g. "lucide:home") to SVG markup on mount.
	// Also backfills the slug attribute via onSlugChange if provided.
	const isResolving = useIconAutoResolve( value, onChange, onSlugChange );

	return (
		<>
			<IconPickerTrigger
				value={ value }
				label={ label }
				hideLabel={ hideLabel }
				isLoading={ isResolving }
				onOpen={ () => setIsModalOpen( true ) }
				onClear={ () => {
					onChange( '' );
					if ( onSlugChange ) {
						onSlugChange( '' );
					}
				} }
			/>
			<IconPickerModal
				isOpen={ isModalOpen }
				onClose={ () => setIsModalOpen( false ) }
				initialValue={ value }
				initialSlug={ initialSlug }
				onSelect={ ( svg ) => {
					onChange( svg );
					setIsModalOpen( false );
				} }
				onSelectSlug={ onSlugChange }
			/>
		</>
	);
};

export default IconPicker;

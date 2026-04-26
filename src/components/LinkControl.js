import { __ } from '@wordpress/i18n';
import { BaseControl, Button, Popover, __experimentalHStack as HStack } from '@wordpress/components';
import { __experimentalLinkControl as WpLinkControl } from '@wordpress/block-editor';
import { useRef, useState } from '@wordpress/element';
import { link, reset, copy, check } from '@wordpress/icons';

function normalizeUrl( inputUrl = '' ) {
	const trimmedUrl = inputUrl.trim();
	const hasScheme = /^[a-z][a-z\d+.-]*:/i.test( trimmedUrl );
	const startsRelative = /^[/?#]/.test( trimmedUrl );
	const looksLikeDomain = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:[/?#].*)?$/i.test( trimmedUrl );

	if ( ! trimmedUrl ) {
		return '';
	}

	if ( hasScheme || startsRelative ) {
		return trimmedUrl;
	}

	if ( ! looksLikeDomain ) {
		return trimmedUrl;
	}

	return `https://${ trimmedUrl }`;
}

const LinkControl = ( {
	value,
	onChange,
	label,
	help,
	placeholder,
	buttonLabel,
	searchInputPlaceholder,
	popoverContent,
} ) => {
	const [ isVisible, setIsVisible ] = useState( false );
	const [ showCustomPopoverContent, setShowCustomPopoverContent ] = useState( true );
	const [ isCopied, setIsCopied ] = useState( false );
	const anchorRef = useRef( null );

	const openPopover = () => {
		setShowCustomPopoverContent( true );
		setIsVisible( true );
	};

	const resolvedPopoverContent = typeof popoverContent === 'function'
		? popoverContent( {
			showDefaultContent: () => setShowCustomPopoverContent( false ),
			closePopover: () => setIsVisible( false ),
		} )
		: popoverContent;

	//const { createNotice } = useDispatch( 'core/notices' );

	return (
		<>
			<BaseControl label={ label } help={ help }>
				<HStack gap={ 2 } className="sbtl-link-control">
					<div
						className="sbtl-url-input"
						onClick={ openPopover }
						role="button"
						onKeyDown={ ( event ) => {
							if ( event.key === 'Enter' || event.key === ' ' ) {
								openPopover();
							}
						} }
					>
						<Button
							ref={ anchorRef }
							icon={ link }
							label={ buttonLabel }
							type="link"
							style={ {
								pointerEvents: 'none',
							} }
						/>
						<input
							className="components-text-control__input"
							type="text"
							value={ value || '' }
							readOnly
							placeholder={ placeholder }
							style={ {
								border: 'none',
								boxShadow: 'none',
								flex: 1,
								minWidth: 0,
								cursor: 'pointer',
								backgroundColor: 'transparent',
							} }
							tabIndex={ -1 }
						/>
						{value && (
							<Button
								icon={ reset }
								label={ __( 'Remove Link', 'subtle-icons' ) }
								className="sbtl-reset-link-button"
								variant="link"
								onClick={ ( event ) => {
									event.stopPropagation();
									onChange( '' );
								} }
							/>
						) }
					</div>
					{ value && (
						<Button
							icon={ isCopied ? check : copy }
							label={ isCopied ? __( 'Link Copied!', 'subtle-icons' ) : __( 'Copy Link', 'subtle-icons' ) }
							variant="link"
							onClick={ ( event ) => {
								event.stopPropagation();
								navigator.clipboard.writeText( value );
								setIsCopied( true );
								setTimeout( () => setIsCopied( false ), 2000 );
							} }
						/>
					) }
				</HStack>
			</BaseControl>

			{ isVisible && (
				<Popover
					anchor={ anchorRef.current }
					onClose={ () => setIsVisible( false ) }
					className="sbtl-link-control-popover"
					position="bottom right"
					focusOnMount="firstElement"
				>
					<div>
						{ resolvedPopoverContent && showCustomPopoverContent ? (
							resolvedPopoverContent
						) : (
							<WpLinkControl
								searchInputPlaceholder={ searchInputPlaceholder }
								value={ { url: value || '' } }
								onChange={ ( nextValue ) => {
									if ( nextValue && nextValue.url ) {
										onChange( normalizeUrl( nextValue.url ) );
									}
								} }
								showInitialSuggestions={ true }
								withCreateSuggestion={ false }
								settings={ [] }
								forceIsEditingLink={ true }
							/>
						) }
					</div>
				</Popover>
			) }
		</>
	);
};

export default LinkControl;

import clsx from 'clsx';

import {
	BlockControls,
	InspectorControls,
	LinkControl,
	RichText,
	useBlockProps,
	__experimentalPanelColorGradientSettings as ExperimentalPanelColorGradientSettings,
	__experimentalGetSpacingClassesAndStyles as useSpacingProps,
	__experimentalGetElementClassName,
	__experimentalUseBorderProps as useBorderProps,
	getTypographyClassesAndStyles as useTypographyProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Popover,
	ToolbarButton,
	Button,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import {
	link,
	linkOff,
	arrowDown,
	arrowRight,
	reusableBlock,
} from '@wordpress/icons';

import IconPicker, {
	IconPickerTrigger,
	IconPickerPreview,
} from '../../components/IconPicker';
import IconPickerModal from '../../components/IconPicker/IconPickerModal';
import useIconAutoResolve from '../../components/IconPicker/useIconAutoResolve';
import { useBlockAttributes } from '../../hooks/use-block-attributes';
import { cleanMerge, cleanObject, cleanValue } from '../../utils/object';
import {
	getIconLayoutValue,
	getIconRootClassName,
	getObjectValue,
	getTagNameValue,
	getIconSlotStyle,
} from './shared';

function IconSlot( {
	icon,
	toggleIcon,
	className = '',
	style,
	onOpen,
	editLabel,
} ) {
	if ( ! icon && ! toggleIcon ) return null;
	if ( onOpen ) {
		return (
			<div className={ className } style={ style }>
				<IconPickerPreview
					value={ icon }
					onOpen={ onOpen }
					label={ editLabel }
					className="sbtl-button__icon"
					showPlaceholder={ false }
				/>
				{ toggleIcon && (
					<span
						className="sbtl-button__icon sbtl-icon"
						data-variant="toggle"
						dangerouslySetInnerHTML={ { __html: toggleIcon } }
						aria-hidden="true"
					/>
				) }
			</div>
		);
	}
	return (
		<div className={ className } style={ style }>
			{ icon && (
				<span
					className="sbtl-button__icon sbtl-icon"
					dangerouslySetInnerHTML={ { __html: icon } }
					aria-hidden="true"
				/>
			) }
			{ toggleIcon && (
				<span
					className="sbtl-button__icon sbtl-icon"
					data-variant="toggle"
					dangerouslySetInnerHTML={ { __html: toggleIcon } }
					aria-hidden="true"
				/>
			) }
		</div>
	);
}
import {
	getButtonAppearanceStateClassNames,
	getButtonAppearanceStateStyle,
	getDefaultAppearance,
	getIconAppearanceStateClassNames,
	getIconAppearanceStateStyle,
	mergeDefaultAppearanceState,
	swapStateAppearanceIcons,
} from './appearance';
import AppearancePanel from './panels/AppearancePanel';
import LinkedIconOptionsPanel from '../../components/LinkedIconOptionsPanel';

import './editor.scss';

const NEW_TAB_REL = 'noreferrer noopener';
const NEW_TAB_TARGET = '_blank';
const NOFOLLOW_REL = 'nofollow';
const LINK_SETTINGS = [
	...LinkControl.DEFAULT_LINK_SETTINGS,
	{
		id: 'nofollow',
		title: __( 'Mark as nofollow', 'subtle-icons' ),
	},
];
const PanelColorGradientSettings =
	wp?.blockEditor?.PanelColorGradientSettings ||
	ExperimentalPanelColorGradientSettings;
const DEFAULT_TRAILING_ICON = globalThis?.sbtl_button_icons?.arrowRight || '';

function removeAnchorTags( value = '' ) {
	return value.replace( /<\/?a\b[^>]*>/gi, '' );
}

function getUpdatedLinkAttributes( {
	rel = '',
	url = '',
	opensInNewTab,
	nofollow,
} ) {
	let newLinkTarget;
	let updatedRel = rel;

	if ( opensInNewTab ) {
		newLinkTarget = NEW_TAB_TARGET;
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

function WidthPanel( { selectedWidth, setAttributes } ) {
	return (
		<ToolsPanel
			label={ __( 'Settings', 'subtle-icons' ) }
			resetAll={ () => setAttributes( { width: undefined } ) }
		>
			<ToolsPanelItem
				label={ __( 'Width', 'subtle-icons' ) }
				isShownByDefault
				hasValue={ () => !! selectedWidth }
				onDeselect={ () => setAttributes( { width: undefined } ) }
				__nextHasNoMarginBottom
			>
				<ToggleGroupControl
					label={ __( 'Width', 'subtle-icons' ) }
					value={ selectedWidth }
					onChange={ ( newWidth ) =>
						setAttributes( { width: newWidth } )
					}
					isBlock
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				>
					{ [ 25, 50, 75, 100 ].map( ( widthValue ) => (
						<ToggleGroupControlOption
							key={ widthValue }
							value={ widthValue }
							label={ `${ widthValue }%` }
						/>
					) ) }
				</ToggleGroupControl>
			</ToolsPanelItem>
		</ToolsPanel>
	);
}

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { setClean, setNested } = useBlockAttributes(
		attributes,
		setAttributes
	);
	const {
		tagName,
		type,
		linkTarget,
		placeholder,
		rel,
		text,
		url,
		width,
		leadingIcon,
		leadingIconSlug,
		trailingIcon,
		trailingIconSlug,
		disabledDefaultTrailingIcon,
		iconLayout,
		iconOptions,
		stateAppearance,
	} = attributes;
	const normalizedIconOptions = getObjectValue( iconOptions );
	const normalizedStateAppearanceInput = getObjectValue( stateAppearance );
	const leadingIconOptions = getObjectValue( normalizedIconOptions.leading );
	const trailingIconOptions = getObjectValue(
		normalizedIconOptions.trailing
	);
	const TagName = getTagNameValue( tagName );
	const isButtonTag = TagName === 'button';
	const opensInNewTab = linkTarget === NEW_TAB_TARGET;
	const nofollow = !! rel?.includes( NOFOLLOW_REL );
	const isURLSet = !! url;
	const wrapperRef = useRef( null );
	const richTextRef = useRef( null );
	const [ popoverAnchor, setPopoverAnchor ] = useState( null );
	const [ isEditingURL, setIsEditingURL ] = useState( false );
	const [ activeIconSlot, setActiveIconSlot ] = useState( null ); // null | 'leading' | 'trailing'

	useIconAutoResolve(
		leadingIcon,
		( svg ) => setAttributes( { leadingIcon: svg } ),
		( slug ) => setAttributes( { leadingIconSlug: slug } )
	);
	useIconAutoResolve(
		trailingIcon,
		( svg ) => setAttributes( { trailingIcon: svg } ),
		( slug ) => setAttributes( { trailingIconSlug: slug } )
	);

	useEffect( () => {
		if ( ! isSelected ) {
			setIsEditingURL( false );
		}
	}, [ isSelected ] );

	useEffect( () => {
		if (
			trailingIcon ||
			disabledDefaultTrailingIcon ||
			! DEFAULT_TRAILING_ICON
		) {
			return;
		}

		setAttributes( { trailingIcon: DEFAULT_TRAILING_ICON } );
	}, [ disabledDefaultTrailingIcon, setAttributes, trailingIcon ] );

	const borderProps = useBorderProps( attributes );
	const spacingProps = useSpacingProps( attributes );
	const typographyProps = useTypographyProps( attributes );
	const normalizedStateAppearance = normalizedStateAppearanceInput;
	const defaultAppearance = getDefaultAppearance( normalizedStateAppearance );
	const hasAnyIcon = !! (
		leadingIcon ||
		trailingIcon ||
		leadingIconOptions.toggleIcon ||
		trailingIconOptions.toggleIcon
	);
	const iconLayoutValue = getIconLayoutValue( iconLayout );
	const buttonAppearanceStateClasses = getButtonAppearanceStateClassNames(
		normalizedStateAppearance
	);
	const buttonAppearanceStateStyle = getButtonAppearanceStateStyle(
		normalizedStateAppearance
	);
	const leadingIconAppearanceStateClasses = getIconAppearanceStateClassNames(
		normalizedStateAppearance,
		'leadingIcon'
	);
	const trailingIconAppearanceStateClasses = getIconAppearanceStateClassNames(
		normalizedStateAppearance,
		'trailingIcon'
	);
	const leadingIconStyle = cleanObject( {
		...getIconSlotStyle(
			leadingIconOptions,
			defaultAppearance.leadingIcon
		),
		...getIconAppearanceStateStyle(
			normalizedStateAppearance,
			'leadingIcon'
		),
	} );
	const trailingIconStyle = cleanObject( {
		...getIconSlotStyle(
			trailingIconOptions,
			defaultAppearance.trailingIcon
		),
		...getIconAppearanceStateStyle(
			normalizedStateAppearance,
			'trailingIcon'
		),
	} );

	const wrapperClasses = clsx(
		'wp-block-button',
		'sbtl-icon-button',
		width && 'has-custom-width',
		width && `wp-block-button__width-${ width }`,
		getIconRootClassName( iconLayoutValue, hasAnyIcon )
	);
	const blockProps = useBlockProps( {
		ref: useMergeRefs( [ setPopoverAnchor, wrapperRef ] ),
		className: wrapperClasses,
	} );
	const buttonClasses = clsx(
		'wp-block-button__link',
		borderProps.className,
		typographyProps.className,
		buttonAppearanceStateClasses,
		__experimentalGetElementClassName( 'button' )
	);
	const buttonStyle = {
		...borderProps.style,
		...spacingProps.style,
		...typographyProps.style,
		...buttonAppearanceStateStyle,
		background: defaultAppearance.background || undefined,
		color: defaultAppearance.text || undefined,
		borderColor: defaultAppearance.color || undefined,
		boxShadow: defaultAppearance.shadow || undefined,
		writingMode: undefined,
	};
	const linkValue = useMemo(
		() => ( { url, opensInNewTab, nofollow } ),
		[ url, opensInNewTab, nofollow ]
	);

	const setIconOptions = ( partial ) => {
		setClean( 'iconOptions', partial );
	};

	const setIconSlotOptions = ( slot, partial ) => {
		setIconOptions( {
			[ slot ]: cleanMerge(
				normalizedIconOptions?.[ slot ] || {},
				partial
			),
		} );
	};

	const setMultipleIconSlotOptions = ( partialsBySlot ) => {
		const nextIconOptions = Object.entries( partialsBySlot ).reduce(
			( accumulator, [ slot, partial ] ) => {
				accumulator[ slot ] = cleanMerge(
					normalizedIconOptions?.[ slot ] || {},
					partial
				);
				return accumulator;
			},
			{}
		);

		setIconOptions( nextIconOptions );
	};

	const resetIconOption = ( key ) => {
		setClean( 'iconOptions', {
			leading: cleanMerge( normalizedIconOptions?.leading || {}, {
				[ key ]: undefined,
			} ),
			trailing: cleanMerge( normalizedIconOptions?.trailing || {}, {
				[ key ]: undefined,
			} ),
		} );
	};

	const resetAllIconOptions = () => {
		setClean( 'iconOptions', {
			leading: cleanMerge( normalizedIconOptions?.leading || {}, {
				size: undefined,
				gap: undefined,
				stroke: undefined,
				align: undefined,
			} ),
			trailing: cleanMerge( normalizedIconOptions?.trailing || {}, {
				size: undefined,
				gap: undefined,
				stroke: undefined,
				align: undefined,
			} ),
		} );
	};

	const setDefaultAppearance = ( partial ) => {
		setAttributes( {
			stateAppearance: mergeDefaultAppearanceState(
				normalizedStateAppearance,
				partial
			),
		} );
	};

	const setInteractiveAppearance = ( stateKey, partial ) => {
		setNested( 'stateAppearance', stateKey, partial );
	};

	const handleTrailingIconChange = ( nextIcon ) => {
		if ( ! nextIcon ) {
			setAttributes( {
				trailingIcon: '',
				trailingIconSlug: '',
				disabledDefaultTrailingIcon: true,
			} );
			return;
		}

		setAttributes( {
			trailingIcon: nextIcon,
			disabledDefaultTrailingIcon: false,
		} );
	};

	const unlink = () => {
		setAttributes( {
			url: undefined,
			linkTarget: undefined,
			rel: undefined,
		} );
		setIsEditingURL( false );
		richTextRef.current?.focus();
	};

	const swapIcons = () => {
		const nextIconOptions = normalizedIconOptions || {};
		const nextTrailingIcon = leadingIcon;

		setAttributes( {
			leadingIcon: trailingIcon,
			trailingIcon: nextTrailingIcon,
			disabledDefaultTrailingIcon: ! nextTrailingIcon,
			iconOptions: cleanValue( {
				...nextIconOptions,
				leading: nextIconOptions.trailing,
				trailing: nextIconOptions.leading,
			} ),
			stateAppearance: swapStateAppearanceIcons(
				normalizedStateAppearance
			),
		} );
	};

	return (
		<>
			<div { ...blockProps }>
				<div
					className={ buttonClasses }
					href={ isButtonTag ? undefined : url }
					target={ isButtonTag ? undefined : linkTarget }
					rel={ isButtonTag ? undefined : rel }
					type={ isButtonTag ? type || 'button' : undefined }
					style={ buttonStyle }
					onClick={ ( event ) => {
						if ( ! isButtonTag ) {
							event.preventDefault();
						}
					} }
				>
					<IconSlot
						icon={ leadingIcon }
						toggleIcon={ leadingIconOptions.toggleIcon }
						className={ clsx(
							'sbtl-icon-region sbtl-leading-icon',
							leadingIconAppearanceStateClasses
						) }
						style={ leadingIconStyle }
						onOpen={ () => setActiveIconSlot( 'leading' ) }
						editLabel={ __(
							'Change leading icon',
							'subtle-icons'
						) }
					/>
					<RichText
						ref={ richTextRef }
						identifier="text"
						tagName="span"
						className="wp-block-button__link-text"
						aria-label={ __( 'Button text', 'subtle-icons' ) }
						placeholder={
							placeholder || __( 'Add text…', 'subtle-icons' )
						}
						value={ text }
						onChange={ ( value ) =>
							setAttributes( {
								text: removeAnchorTags( value ),
							} )
						}
						withoutInteractiveFormatting
					/>
					<IconSlot
						icon={ trailingIcon }
						toggleIcon={ trailingIconOptions.toggleIcon }
						className={ clsx(
							'sbtl-icon-region sbtl-trailing-icon',
							trailingIconAppearanceStateClasses
						) }
						style={ trailingIconStyle }
						onOpen={ () => setActiveIconSlot( 'trailing' ) }
						editLabel={ __(
							'Change trailing icon',
							'subtle-icons'
						) }
					/>
				</div>
			</div>
			<BlockControls group="block">
				{ ! isButtonTag && (
					<ToolbarButton
						icon={ url ? linkOff : link }
						title={
							url
								? __( 'Unlink', 'subtle-icons' )
								: __( 'Link', 'subtle-icons' )
						}
						onClick={ () => {
							if ( url ) {
								unlink();
								return;
							}

							setIsEditingURL( true );
						} }
						isActive={ isURLSet }
					/>
				) }
			</BlockControls>
			{ ! isButtonTag && isSelected && ( isEditingURL || isURLSet ) && (
				<Popover
					placement="bottom"
					onClose={ () => {
						setIsEditingURL( false );
						richTextRef.current?.focus();
					} }
					anchor={ popoverAnchor }
					focusOnMount={ isEditingURL ? 'firstElement' : false }
					__unstableSlotName="__unstable-block-tools-after"
					shift
				>
					<LinkControl
						value={ linkValue }
						settings={ LINK_SETTINGS }
						forceIsEditingLink={ isEditingURL }
						onChange={ ( nextValue = {} ) =>
							setAttributes(
								getUpdatedLinkAttributes( {
									rel,
									url: nextValue.url,
									opensInNewTab: nextValue.opensInNewTab,
									nofollow: nextValue.nofollow,
								} )
							)
						}
						onRemove={ unlink }
					/>
				</Popover>
			) }
			<InspectorControls>
				<PanelBody
					title={ __( 'Icon', 'subtle-icons' ) }
					initialOpen={ true }
				>
					<IconPickerTrigger
						label={ __( 'Leading icon', 'subtle-icons' ) }
						value={ leadingIcon }
						onOpen={ () => setActiveIconSlot( 'leading' ) }
						onClear={ () =>
							setAttributes( {
								leadingIcon: '',
								leadingIconSlug: '',
							} )
						}
					/>
					{ /* ( leadingIcon || leadingIconOptions.toggleIcon ) && (
						<IconPicker
							label={ __( 'Leading toggle icon', 'subtle-icons' ) }
							value={ leadingIconOptions.toggleIcon }
							onChange={ ( value ) =>
								setIconSlotOptions( 'leading', { toggleIcon: value } )
							}
						/>
					) */ }
					<IconPickerTrigger
						label={ __( 'Trailing icon', 'subtle-icons' ) }
						value={ trailingIcon }
						onOpen={ () => setActiveIconSlot( 'trailing' ) }
						onClear={ () => handleTrailingIconChange( '' ) }
					/>
					{ /* ( trailingIcon || trailingIconOptions.toggleIcon ) && (
						<IconPicker
							label={ __( 'Trailing toggle icon', 'subtle-icons' ) }
							value={ trailingIconOptions.toggleIcon }
							onChange={ ( value ) =>
								setIconSlotOptions( 'trailing', { toggleIcon: value } )
							}
						/>
					) */ }
					{ ( leadingIcon || trailingIcon ) && (
						<HStack
							align="bottom"
							style={ { alignItems: 'flex-end' } }
						>
							<Button
								variant="secondary"
								icon={ reusableBlock }
								className="sbtl-icon-button__swap-button"
								onClick={ swapIcons }
							>
								{ __( 'Swap', 'subtle-icons' ) }
							</Button>
							<ToggleGroupControl
								label={ __( 'Orientation', 'subtle-icons' ) }
								value={ iconLayout }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								isBlock
								onChange={ ( value ) =>
									setAttributes( { iconLayout: value } )
								}
							>
								<ToggleGroupControlOptionIcon
									icon={ arrowRight }
									value="horizontal"
									label={ __( 'Horizontal', 'subtle-icons' ) }
								/>
								<ToggleGroupControlOptionIcon
									icon={ arrowDown }
									value="vertical"
									label={ __( 'Vertical', 'subtle-icons' ) }
								/>
							</ToggleGroupControl>
						</HStack>
					) }
				</PanelBody>
				{ ( leadingIcon ||
					trailingIcon ||
					leadingIconOptions?.toggleIcon ||
					trailingIconOptions?.toggleIcon ) && (
					<LinkedIconOptionsPanel
						groups={ [
							...( leadingIcon
								? [
										{
											key: 'leading',
											label: __(
												'Leading icon',
												'subtle-icons'
											),
										},
								  ]
								: [] ),
							...( trailingIcon
								? [
										{
											key: 'trailing',
											label: __(
												'Trailing icon',
												'subtle-icons'
											),
										},
								  ]
								: [] ),
						] }
						slots={ {
							leading: leadingIconOptions,
							trailing: trailingIconOptions,
						} }
						resetAll={ resetAllIconOptions }
						resetOption={ resetIconOption }
						setSlotOptions={ setMultipleIconSlotOptions }
						alignConfig={ iconLayoutValue }
					/>
				) }
				<WidthPanel
					selectedWidth={ width }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody
					title={ __( 'Colors & Shadow', 'subtle-icons' ) }
					initialOpen={ true }
					className="sbtl-priority-styles-panel"
				>
					<AppearancePanel
						PanelColorGradientSettings={
							PanelColorGradientSettings
						}
						stateAppearance={ normalizedStateAppearance }
						hasLeadingIcon={
							!! ( leadingIcon || leadingIconOptions.toggleIcon )
						}
						hasTrailingIcon={
							!! (
								trailingIcon || trailingIconOptions.toggleIcon
							)
						}
						setDefaultAppearance={ setDefaultAppearance }
						setInteractiveAppearance={ setInteractiveAppearance }
					/>
				</PanelBody>
			</InspectorControls>
			<IconPickerModal
				isOpen={ activeIconSlot !== null }
				onClose={ () => setActiveIconSlot( null ) }
				initialValue={
					activeIconSlot === 'leading' ? leadingIcon : trailingIcon
				}
				initialSlug={
					activeIconSlot === 'leading'
						? leadingIconSlug
						: trailingIconSlug
				}
				onSelect={ ( svg ) => {
					if ( activeIconSlot === 'leading' ) {
						setAttributes( { leadingIcon: svg } );
					} else if ( activeIconSlot === 'trailing' ) {
						handleTrailingIconChange( svg );
					}
					setActiveIconSlot( null );
				} }
				onSelectSlug={ ( slug ) => {
					if ( activeIconSlot === 'leading' ) {
						setAttributes( { leadingIconSlug: slug } );
					} else if ( activeIconSlot === 'trailing' ) {
						setAttributes( { trailingIconSlug: slug } );
					}
				} }
			/>
		</>
	);
}

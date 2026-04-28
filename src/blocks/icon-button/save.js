import clsx from 'clsx';

import {
	RichText,
	useBlockProps,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	__experimentalGetSpacingClassesAndStyles as getSpacingClassesAndStyles,
	__experimentalGetElementClassName,
	getTypographyClassesAndStyles,
} from '@wordpress/block-editor';
import { cleanValue } from '../../utils/object';
import {
	getIconLayoutValue,
	getIconRootClassName,
	getObjectValue,
	getTagNameValue,
	IconSlot,
	getIconSlotStyle,
} from './shared';
import {
	getButtonAppearanceStateClassNames,
	getButtonAppearanceStateStyle,
	getDefaultAppearance,
	getIconAppearanceStateClassNames,
	getIconAppearanceStateStyle,
} from './appearance';

export default function save( { attributes } ) {
	const {
		tagName,
		type,
		linkTarget,
		rel,
		text,
		title,
		url,
		width,
		leadingIcon,
		trailingIcon,
		iconLayout,
		iconOptions,
		stateAppearance,
	} = attributes;
	const normalizedIconOptions = getObjectValue( iconOptions );
	const leadingIconOptions = getObjectValue( normalizedIconOptions.leading );
	const trailingIconOptions = getObjectValue(
		normalizedIconOptions.trailing
	);

	if (
		! text &&
		! leadingIcon &&
		! trailingIcon &&
		! leadingIconOptions.toggleIcon &&
		! trailingIconOptions.toggleIcon
	) {
		return null;
	}

	const normalizedStateAppearanceInput = getObjectValue( stateAppearance );

	const TagName = getTagNameValue( tagName );
	const isButtonTag = TagName === 'button';
	const buttonType = typeof type === 'string' && type ? type : 'button';
	const borderProps = getBorderClassesAndStyles( attributes );
	const spacingProps = getSpacingClassesAndStyles( attributes );
	const typographyProps = getTypographyClassesAndStyles( attributes );
	const iconLayoutValue = getIconLayoutValue( iconLayout );
	const hasAnyIcon = !! (
		leadingIcon ||
		trailingIcon ||
		leadingIconOptions.toggleIcon ||
		trailingIconOptions.toggleIcon
	);
	const normalizedStateAppearance = normalizedStateAppearanceInput;
	const defaultAppearance = getDefaultAppearance( normalizedStateAppearance );
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
	const leadingIconStyle = cleanValue( {
		...getIconSlotStyle(
			leadingIconOptions,
			defaultAppearance.leadingIcon
		),
		...getIconAppearanceStateStyle(
			normalizedStateAppearance,
			'leadingIcon'
		),
	} );
	const trailingIconStyle = cleanValue( {
		...getIconSlotStyle(
			trailingIconOptions,
			defaultAppearance.trailingIcon
		),
		...getIconAppearanceStateStyle(
			normalizedStateAppearance,
			'trailingIcon'
		),
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
	const wrapperClasses = clsx(
		'wp-block-button',
		'sbtl-icon-button',
		width && 'has-custom-width',
		width && `wp-block-button__width-${ width }`,
		getIconRootClassName( iconLayoutValue, hasAnyIcon )
	);
	const savedBlockProps = useBlockProps.save( {
		className: wrapperClasses,
	} );

	return (
		<div { ...savedBlockProps }>
			<TagName
				className={ buttonClasses }
				href={ isButtonTag ? undefined : url }
				title={ title }
				style={ buttonStyle }
				target={ isButtonTag ? undefined : linkTarget }
				rel={ isButtonTag ? undefined : rel }
				type={ isButtonTag ? buttonType : undefined }
			>
				<IconSlot
					icon={ leadingIcon }
					toggleIcon={ leadingIconOptions.toggleIcon }
					className={ clsx(
						'sbtl-icon-region sbtl-leading-icon',
						leadingIconAppearanceStateClasses
					) }
					style={ leadingIconStyle }
				/>
				<RichText.Content
					tagName="span"
					className="wp-block-button__link-text"
					value={ text }
				/>
				<IconSlot
					icon={ trailingIcon }
					toggleIcon={ trailingIconOptions.toggleIcon }
					className={ clsx(
						'sbtl-icon-region sbtl-trailing-icon',
						trailingIconAppearanceStateClasses
					) }
					style={ trailingIconStyle }
				/>
			</TagName>
		</div>
	);
}

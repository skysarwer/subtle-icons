import { cleanValue } from '../../utils/object';

export function getIconLayoutValue( iconLayout ) {
	if ( iconLayout === 'vertical' ) {
		return 'vertical';
	}

	return 'horizontal';
}

export function getIconRootClassName( iconLayout, hasAnyIcon ) {
	if ( ! hasAnyIcon ) {
		return undefined;
	}

	return `has-icon-layout-${ getIconLayoutValue( iconLayout ) }`;
}

export function getTagNameValue( tagName ) {
	return tagName === 'button' ? 'button' : 'a';
}

export function getObjectValue( value ) {
	return value && typeof value === 'object' && ! Array.isArray( value )
		? value
		: {};
}

export function IconPreview( { icon, variant = 'default' } ) {
	if ( ! icon ) {
		return null;
	}

	return (
		<span
			className="sbtl-button__icon sbtl-icon"
			data-variant={ variant }
			dangerouslySetInnerHTML={ { __html: icon } }
			aria-hidden="true"
		/>
	);
}

export function IconSlot( { icon, toggleIcon, className = '', style } ) {
	if ( ! icon && ! toggleIcon ) {
		return null;
	}

	return (
		<div className={ className } style={ style }>
			{ icon && <IconPreview icon={ icon } /> }
			{ toggleIcon && (
				<IconPreview icon={ toggleIcon } variant="toggle" />
			) }
		</div>
	);
}

export function getIconSlotStyle( slotOptions = {}, appearanceColor ) {
	return cleanValue( {
		width: slotOptions.size,
		alignSelf: slotOptions.align,
		'--sbtl-button-icon-gap': slotOptions.gap,
		'--sbtl-button-icon-stroke': slotOptions.stroke,
		color: appearanceColor,
	} );
}

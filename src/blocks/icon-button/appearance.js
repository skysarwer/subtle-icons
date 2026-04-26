import { cleanObject, cleanValue } from '../../utils/object';

const APPEARANCE_KEYS = [
	'background',
	'text',
	'color',
	'leadingIcon',
	'trailingIcon',
	'shadow',
];

export function getAppearanceValues( appearance = {} ) {
	return cleanObject(
		Object.fromEntries(
			APPEARANCE_KEYS.map( ( key ) => [ key, appearance?.[ key ] ?? undefined ] )
		)
	);
}

export function getDefaultAppearance( stateAppearance = {} ) {
	return getAppearanceValues( stateAppearance );
}

export function getAppearanceForState( stateAppearance = {}, stateKey = 'default' ) {
	if ( stateKey === 'default' ) {
		return getDefaultAppearance( stateAppearance );
	}

	return cleanObject( stateAppearance?.[ stateKey ] || {} );
}

export function hasAppearanceValues( appearance = {} ) {
	return !! Object.values( appearance || {} ).some( Boolean );
}

export function mergeDefaultAppearanceState( stateAppearance = {}, partial = {} ) {
	const nextDefaultAppearance = cleanValue( {
		...getDefaultAppearance( stateAppearance ),
		...partial,
	} );

	return cleanValue( {
		...nextDefaultAppearance,
		hover: stateAppearance?.hover,
		active: stateAppearance?.active,
	} );
}

function swapAppearanceIconValues( appearance = {} ) {
	return cleanValue( {
		...appearance,
		leadingIcon: appearance?.trailingIcon,
		trailingIcon: appearance?.leadingIcon,
	} );
}

export function swapStateAppearanceIcons( stateAppearance = {} ) {
	return cleanValue( {
		...stateAppearance,
		leadingIcon: stateAppearance?.trailingIcon,
		trailingIcon: stateAppearance?.leadingIcon,
		hover: stateAppearance?.hover
			? swapAppearanceIconValues( stateAppearance.hover )
			: undefined,
		active: stateAppearance?.active
			? swapAppearanceIconValues( stateAppearance.active )
			: undefined,
	} );
}

export function isGradientValue( value ) {
	return typeof value === 'string' && /gradient\s*\(/i.test( value );
}

export function getPresetInfo( value ) {
	if ( typeof value !== 'string' ) {
		return undefined;
	}

	const match = value.trim().match(
		/^var\(--wp--preset--(color|gradient)--([^)]+)\)$/
	);

	if ( ! match ) {
		return undefined;
	}

	return {
		type: match[ 1 ],
		slug: match[ 2 ],
	};
}

export function isGradientBackgroundValue( value ) {
	const presetInfo = getPresetInfo( value );
	return presetInfo?.type === 'gradient' || isGradientValue( value );
}

export function getButtonAppearanceStateStyle( stateAppearance = {} ) {
	return cleanValue( {
		'--sbtl-button-hover-bg': stateAppearance?.hover?.background,
		'--sbtl-button-hover-text': stateAppearance?.hover?.text,
		'--sbtl-button-hover-border': stateAppearance?.hover?.color,
		'--sbtl-button-hover-shadow': stateAppearance?.hover?.shadow,
		'--sbtl-button-active-bg': stateAppearance?.active?.background,
		'--sbtl-button-active-text': stateAppearance?.active?.text,
		'--sbtl-button-active-border': stateAppearance?.active?.color,
		'--sbtl-button-active-shadow': stateAppearance?.active?.shadow,
	} );
}

export function getButtonAppearanceStateClassNames( stateAppearance = {} ) {
	return cleanValue( {
		'has-hover-bg': stateAppearance?.hover?.background ? true : undefined,
		'has-hover-text': stateAppearance?.hover?.text ? true : undefined,
		'has-hover-border': stateAppearance?.hover?.color ? true : undefined,
		'has-hover-shadow': stateAppearance?.hover?.shadow ? true : undefined,
		'has-active-bg': stateAppearance?.active?.background ? true : undefined,
		'has-active-text': stateAppearance?.active?.text ? true : undefined,
		'has-active-border': stateAppearance?.active?.color ? true : undefined,
		'has-active-shadow': stateAppearance?.active?.shadow ? true : undefined,
	} );
}

export function getIconAppearanceStateStyle( stateAppearance = {}, slotKey ) {
	return cleanValue( {
		'--sbtl-button-hover-icon-color': stateAppearance?.hover?.[ slotKey ],
		'--sbtl-button-active-icon-color': stateAppearance?.active?.[ slotKey ],
	} );
}

export function getIconAppearanceStateClassNames( stateAppearance = {}, slotKey ) {
	return cleanValue( {
		'has-hover-icon-color': stateAppearance?.hover?.[ slotKey ] ? true : undefined,
		'has-active-icon-color': stateAppearance?.active?.[ slotKey ] ? true : undefined,
	} );
}
import { cleanValue, isPlainObject } from '../../utils/object';

function humanizeKey( key ) {
	if ( ! key ) return '';

	return String( key )
		.replace( /[_-]+/g, ' ' )
		.replace( /\s+/g, ' ' )
		.trim()
		.replace( /^./, ( character ) => character.toUpperCase() );
}

export function isEqualValue( left, right ) {
	if ( left === right ) return true;

	if ( Array.isArray( left ) && Array.isArray( right ) ) {
		if ( left.length !== right.length ) return false;

		return left.every( ( item, index ) =>
			isEqualValue( item, right[ index ] )
		);
	}

	if ( isPlainObject( left ) && isPlainObject( right ) ) {
		const leftKeys = Object.keys( left );
		const rightKeys = Object.keys( right );

		if ( leftKeys.length !== rightKeys.length ) return false;

		return leftKeys.every( ( key ) =>
			isEqualValue( left[ key ], right[ key ] )
		);
	}

	return false;
}

export function normalizeGroups( groups = [] ) {
	return groups
		.map( ( group, index ) => {
			if ( typeof group === 'string' ) {
				return {
					key: group,
					label: humanizeKey( group ),
					index,
				};
			}

			if ( ! group?.key ) {
				return null;
			}

			return {
				index,
				...group,
				label: group.label || humanizeKey( group.key ),
			};
		} )
		.filter( Boolean );
}

export function getManagedValues(
	values = {},
	groups = [],
	defaultValues = {}
) {
	return groups.reduce( ( accumulator, group ) => {
		const currentValue = values?.[ group.key ];
		const defaultValue = defaultValues?.[ group.key ];

		if ( currentValue !== undefined ) {
			accumulator[ group.key ] = currentValue;
			return accumulator;
		}

		if ( defaultValue !== undefined ) {
			accumulator[ group.key ] = defaultValue;
		}

		return accumulator;
	}, {} );
}

export function cleanGroupedValues( value ) {
	return cleanValue( value );
}

export function areGroupValuesEqual( values = {}, groups = [] ) {
	if ( groups.length <= 1 ) return true;

	const [ firstGroup, ...otherGroups ] = groups;
	const firstValue = values?.[ firstGroup.key ];

	return otherGroups.every( ( group ) =>
		isEqualValue( firstValue, values?.[ group.key ] )
	);
}

export function getLinkedValue( values = {}, groups = [], defaultValues = {} ) {
	for ( const group of groups ) {
		if ( values?.[ group.key ] !== undefined ) {
			return values[ group.key ];
		}

		if ( defaultValues?.[ group.key ] !== undefined ) {
			return defaultValues[ group.key ];
		}
	}

	return undefined;
}

export function applyLinkedValue( groups = [], nextValue ) {
	return groups.reduce( ( accumulator, group ) => {
		accumulator[ group.key ] = nextValue;
		return accumulator;
	}, {} );
}

export function mergeManagedValues(
	currentValues = {},
	nextManagedValues = {},
	groups = []
) {
	const nextValues = { ...currentValues };

	groups.forEach( ( group ) => {
		if ( nextManagedValues[ group.key ] === undefined ) {
			delete nextValues[ group.key ];
			return;
		}

		nextValues[ group.key ] = nextManagedValues[ group.key ];
	} );

	return nextValues;
}

export function getInitialLinkedState( {
	values,
	groups,
	defaultValues,
	defaultLinked = true,
} ) {
	const managedValues = getManagedValues( values, groups, defaultValues );
	const hasManagedValues = Object.keys( managedValues ).length > 0;

	if ( ! hasManagedValues ) {
		return defaultLinked;
	}

	return areGroupValuesEqual( managedValues, groups );
}

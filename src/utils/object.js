/**
 * Returns true when a value is a non-array object.
 *
 * @param {*} value Candidate value.
 * @return {boolean} Whether the value is a plain object-like structure.
 */
export function isPlainObject( value ) {
	return !! value && typeof value === 'object' && ! Array.isArray( value );
}

/**
 * Recursively strip null / undefined / empty-string leaves from arrays and objects.
 *
 * @param {*} value Candidate value.
 * @return {*} Cleaned value or undefined when a container becomes empty.
 */
export function cleanValue( value ) {
	if ( Array.isArray( value ) ) {
		const nextArray = value
			.map( cleanValue )
			.filter( ( item ) => item != null && item !== '' );

		return nextArray.length ? nextArray : undefined;
	}

	if ( isPlainObject( value ) ) {
		const nextObject = Object.fromEntries(
			Object.entries( value )
				.map( ( [ key, nestedValue ] ) => [
					key,
					cleanValue( nestedValue ),
				] )
				.filter(
					( [ , nestedValue ] ) =>
						nestedValue != null && nestedValue !== ''
				)
		);

		return Object.keys( nextObject ).length ? nextObject : undefined;
	}

	return value;
}

/**
 * Clean a plain object and return an empty object fallback when nothing remains.
 *
 * @param {Object} value Object to clean.
 * @return {Object} Cleaned object.
 */
export function cleanObject( value = {} ) {
	return cleanValue( value ) || {};
}

/**
 * Shallow-merge a partial object into the current object, then recursively clean it.
 *
 * @param {Object} current Existing object.
 * @param {Object} partial Partial values to merge.
 * @return {Object|undefined} Cleaned merged object.
 */
export function cleanMerge( current = {}, partial = {} ) {
	return cleanValue( {
		...current,
		...partial,
	} );
}

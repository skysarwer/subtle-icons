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
			.filter(
				( item ) => item !== null && item !== undefined && item !== ''
			);

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
						nestedValue !== null &&
						nestedValue !== undefined &&
						nestedValue !== ''
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

const DEFAULT_BLOCK_CLASS_NAME_PATTERN = /^wp-block-[^\s]+$/;

/**
 * Remove the leading default Gutenberg block class from block props.
 * Intentionally-added wp-block-* classes later in the list are preserved.
 *
 * @param {Object} blockProps Block props returned by useBlockProps.
 * @return {Object} Block props without the leading default class token.
 */
export function filterDefaultBlockClassName( blockProps = {} ) {
	const className = blockProps.className;

	if ( typeof className !== 'string' ) {
		return blockProps;
	}

	const classNames = className.trim().split( /\s+/ ).filter( Boolean );

	if ( ! DEFAULT_BLOCK_CLASS_NAME_PATTERN.test( classNames[ 0 ] ) ) {
		return blockProps;
	}

	classNames.shift();

	if ( classNames.length ) {
		return {
			...blockProps,
			className: classNames.join( ' ' ),
		};
	}

	const { className: omittedClassName, ...restBlockProps } = blockProps;

	return restBlockProps;
}

import { useCallback } from '@wordpress/element';
import { cleanMerge, cleanValue } from '../utils/object';

/**
 * Provides two memoised helpers for cleanly updating nested object attributes.
 *
 * @param {Object}   attributes    Current block attributes.
 * @param {Function} setAttributes Core `setAttributes` function.
 * @return {{ setClean: Function, setNested: Function }}
 */
export function useBlockAttributes( attributes, setAttributes ) {
	/**
	 * Merge `partial` into the top-level attribute object at `attrKey`,
	 * stripping any empty / null / undefined values that result.
	 *
	 * @param {string} attrKey       Attribute key (e.g. 'summaryOptions').
	 * @param {Object} partial       Partial values to merge.
	 */
	const setClean = useCallback(
		( attrKey, partial ) => {
			const cleaned = cleanMerge( attributes[ attrKey ] || {}, partial );
			setAttributes( { [ attrKey ]: cleaned } );
		},
		[ attributes, setAttributes ]
	);

	/**
	 * Merge `partial` into a nested state sub-object
	 * (e.g. `itemAppearance.hover.*`).
	 *
	 * @param {string} attrKey   Top-level attribute key (e.g. 'itemAppearance').
	 * @param {string} stateKey  Nested key (e.g. 'hover').
	 * @param {Object} partial   Partial values to merge into the nested object.
	 */
	const setNested = useCallback(
		( attrKey, stateKey, partial ) => {
			const current = attributes[ attrKey ] || {};
			const currentState = current[ stateKey ] || {};
			const cleanedState = cleanValue( {
				...currentState,
				...partial,
			} );
			const cleanedTop = cleanValue( {
				...current,
				[ stateKey ]: cleanedState,
			} );
			setAttributes( { [ attrKey ]: cleanedTop } );
		},
		[ attributes, setAttributes ]
	);

	return { setClean, setNested };
}

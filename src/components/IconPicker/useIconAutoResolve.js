import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import sanitizeSvg from './sanitizeSvg';

/**
 * Auto-resolves an Iconify slug string (e.g. "lucide:home") to SVG markup.
 *
 * - If `value` is already SVG markup (starts with `<`), no-ops.
 * - If `value` is a `prefix:name` slug, fetches from Iconify, sanitizes,
 *   calls `onChange( cleanSvg )` and optionally `onSlugChange( value )`.
 *
 * @param {string}        value        Current attribute value (SVG or slug).
 * @param {Function}      onChange     Called with the resolved SVG string.
 * @param {Function|null} onSlugChange Called with the original slug string (optional).
 * @return {boolean} isResolving — true while the fetch is in flight.
 */
const useIconAutoResolve = ( value, onChange, onSlugChange = null ) => {
	const [ isResolving, setIsResolving ] = useState( false );

	useEffect( () => {
		if ( ! value || typeof value !== 'string' ) {
			return;
		}
		if ( value.trim().startsWith( '<' ) ) {
			return;
		} // Already SVG markup
		if ( ! value.includes( ':' ) ) {
			return;
		} // Not a slug

		const [ prefix, name ] = value.split( ':' );

		// Basic slug validation before fetching
		if (
			! /^[a-z0-9-]+$/.test( prefix ) ||
			! /^[a-z0-9-]+$/.test( name )
		) {
			return;
		}

		const resolveIcon = async () => {
			setIsResolving( true );
			try {
				const { svg } = await apiFetch( {
					path: `/subtle-icons/v1/svg?prefix=${ encodeURIComponent(
						prefix
					) }&name=${ encodeURIComponent( name ) }`,
				} );
				const cleanSvg = sanitizeSvg( svg );
				onChange( cleanSvg );
				if ( onSlugChange ) {
					onSlugChange( value );
				}
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to resolve icon slug:', error );
			} finally {
				setIsResolving( false );
			}
		};

		resolveIcon();
	}, [ value ] ); // eslint-disable-line react-hooks/exhaustive-deps

	return isResolving;
};

export default useIconAutoResolve;

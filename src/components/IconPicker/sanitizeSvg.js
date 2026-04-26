import DOMPurify from 'dompurify';

/**
 * Sanitizes an SVG string for safe use in dangerouslySetInnerHTML.
 *
 * Extends the standard svg+svgFilters profile to allow `<use>` elements,
 * but only when their href / xlink:href value is a local fragment reference
 * (e.g. "#wing"). Any external or data URI reference on a <use> element is
 * stripped, blocking remote sprite injection attacks.
 *
 * @param {string} raw Raw SVG markup to sanitize.
 * @returns {string} Sanitized SVG markup.
 */
/**
 * Hook callback — enforces fragment-only href/xlink:href on <use> elements.
 * Registered and immediately unregistered around each sanitize() call so it
 * does not bleed into other DOMPurify consumers on the same page.
 */
const restrictUseHref = ( node ) => {
	if ( node.tagName?.toLowerCase() !== 'use' ) return;
	for ( const attrName of [ 'href', 'xlink:href' ] ) {
		const val = node.getAttribute( attrName );
		if ( val !== null && ! /^#[\w-]+$/.test( val ) ) {
			node.removeAttribute( attrName );
		}
	}
};

const sanitizeSvg = ( raw ) => {
	DOMPurify.addHook( 'beforeSanitizeAttributes', restrictUseHref );
	const result = DOMPurify.sanitize( raw, {
		USE_PROFILES: { svg: true, svgFilters: true },
		ADD_TAGS: [ 'use' ],
	} );
	DOMPurify.removeHook( 'beforeSanitizeAttributes' );
	return result;
};

export default sanitizeSvg;

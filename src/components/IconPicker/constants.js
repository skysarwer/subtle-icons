export const ICONS_PER_PAGE = 28;

/**
 * Slug convention:
 *
 *   "custom"              — pasted SVG (bare word, no category)
 *   "sbtl-sys/name"       — plugin-bundled SVG
 *   "sbtl-bookmark/..."   — user-saved bookmark; stores original slug after slash
 *                           e.g. "sbtl-bookmark/mdi:alarm"
 *   "prefix:name"         — Iconify registry icon (no slash, contains colon)
 *
 * Detection rule: anything containing "/" is a plugin slug.
 * Anything with ":" and no "/" is Iconify. "custom" is the lone bare word.
 */

/**
 * Returns true for plugin-owned slugs (slash-separated or the bare "custom").
 *
 * @param {string} slug
 * @return {boolean}
 */
export const isPluginSlug = ( slug ) =>
	slug === 'custom' || ( !! slug && slug.includes( '/' ) );

/**
 * Returns true for Iconify registry slugs ("prefix:name", no slash).
 *
 * @param {string} slug
 * @return {boolean}
 */
export const isIconifySlug = ( slug ) =>
	! isPluginSlug( slug ) && /^[a-z0-9-]+:[a-z0-9-]+$/.test( slug );

export const prettifyIconSlug = ( slug ) => {
	const name = slug.split( ':' )[ 1 ] || slug.split( '/' )[ 1 ] || slug;
	return name
		.replace( /-/g, ' ' )
		.replace( /\b\w/g, ( c ) => c.toUpperCase() );
};

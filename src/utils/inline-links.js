function parseHTML( html = '' ) {
	const container = document.createElement( 'div' );
	container.innerHTML = html;
	return container;
}

function isMeaningfulNode( node ) {
	if ( ! node ) {
		return false;
	}

	if ( node.nodeType === Node.TEXT_NODE ) {
		return node.textContent.trim().length > 0;
	}

	return node.nodeType === Node.ELEMENT_NODE;
}

function getMeaningfulNodes( container ) {
	return Array.from( container.childNodes ).filter( isMeaningfulNode );
}

/**
 * Returns true if the HTML content contains inline anchor tags (not a single
 * full-wrapper link).
 *
 * @param {string} html Serialized richtext HTML.
 * @return {boolean}
 */
export function hasInlineAnchors( html = '' ) {
	if ( ! html ) {
		return false;
	}

	const container = parseHTML( html );
	const anchors = container.querySelectorAll( 'a' );

	if ( ! anchors.length ) {
		return false;
	}

	if ( anchors.length > 1 ) {
		return true;
	}

	const meaningfulNodes = getMeaningfulNodes( container );

	return ! (
		meaningfulNodes.length === 1 &&
		meaningfulNodes[ 0 ]?.nodeType === Node.ELEMENT_NODE &&
		meaningfulNodes[ 0 ]?.tagName === 'A'
	);
}

/**
 * Returns the href, target, and rel from the first anchor tag found in the
 * HTML content.
 *
 * @param {string} html Serialized richtext HTML.
 * @return {{ url?: string, linkTarget?: string, rel?: string }}
 */
export function extractFirstInlineAnchorLink( html = '' ) {
	if ( ! html ) {
		return {};
	}

	const container = parseHTML( html );
	const firstAnchor = container.querySelector( 'a[href]' );

	if ( ! firstAnchor ) {
		return {};
	}

	return {
		url: firstAnchor.getAttribute( 'href' ) || undefined,
		linkTarget: firstAnchor.getAttribute( 'target' ) || undefined,
		rel: firstAnchor.getAttribute( 'rel' ) || undefined,
	};
}

/**
 * Strips all anchor tags from the HTML content while preserving their inner
 * text / child nodes.
 *
 * @param {string} html Serialized richtext HTML.
 * @return {string}
 */
export function removeInlineAnchors( html = '' ) {
	if ( ! html ) {
		return html;
	}

	const container = parseHTML( html );
	const anchors = Array.from( container.querySelectorAll( 'a' ) );

	anchors.forEach( ( anchor ) => {
		const fragment = document.createDocumentFragment();

		while ( anchor.firstChild ) {
			fragment.appendChild( anchor.firstChild );
		}

		anchor.replaceWith( fragment );
	} );

	return container.innerHTML;
}

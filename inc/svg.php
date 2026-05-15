<?php
/**
 * Default SVG icons.
 *
 * @package sbtl
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Returns the default chevron-down SVG icon.
 *
 * @return string SVG markup.
 */
function sbtl_default_svg__chevron_down() {
	$filtered_svg = apply_filters( 'sbtl_default_svg__chevron_down', '' );
	if ( ! empty( $filtered_svg ) ) {
		return wp_kses( $filtered_svg, sbtl_svg_kses_allowed() );
	}
	return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>';
}

/**
 * Returns the default chevron-up SVG icon.
 *
 * @return string SVG markup.
 */
function sbtl_default_svg__chevron_up() {
	$filtered_svg = apply_filters( 'sbtl_default_svg__chevron_up', '' );
	if ( ! empty( $filtered_svg ) ) {
		return wp_kses( $filtered_svg, sbtl_svg_kses_allowed() );
	}
	return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>';
}

/**
 * Returns the default chevron-right SVG icon.
 *
 * @return string SVG markup.
 */
function sbtl_default_svg__chevron_right() {
	$filtered_svg = apply_filters( 'sbtl_default_svg__chevron_right', '' );
	if ( ! empty( $filtered_svg ) ) {
		return wp_kses( $filtered_svg, sbtl_svg_kses_allowed() );
	}
	return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>';
}

/**
 * Returns the default chevron-left SVG icon.
 *
 * @return string SVG markup.
 */
function sbtl_default_svg_chevron_left() {
	$filtered_svg = apply_filters( 'sbtl_default_svg__chevron_left', '' );
	if ( ! empty( $filtered_svg ) ) {
		return wp_kses( $filtered_svg, sbtl_svg_kses_allowed() );
	}
	return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>';
}

/**
 * Returns the default close SVG icon.
 *
 * @return string SVG markup.
 */
function sbtl_default_svg__close() {
	$filtered_svg = apply_filters( 'sbtl_default_svg__close', '' );
	if ( ! empty( $filtered_svg ) ) {
		return wp_kses( $filtered_svg, sbtl_svg_kses_allowed() );
	}
	return '';
}

/**
 * Returns the default arrow-right SVG icon.
 *
 * @return string SVG markup.
 */
function sbtl_default_svg__arrow_right() {
	$filtered_svg = apply_filters( 'sbtl_default_svg__arrow_right', '' );
	if ( ! empty( $filtered_svg ) ) {
		return wp_kses( $filtered_svg, sbtl_svg_kses_allowed() );
	}
	return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';
}

/**
 * Returns the default plus SVG icon.
 *
 * @return string SVG markup.
 */
function sbtl_default_svg__plus() {
	$filtered_svg = apply_filters( 'sbtl_default_svg__plus', '' );
	if ( ! empty( $filtered_svg ) ) {
		return wp_kses( $filtered_svg, sbtl_svg_kses_allowed() );
	}
	return '';
}

/**
 * Returns the default minus SVG icon.
 *
 * @return string SVG markup.
 */
function sbtl_default_svg__minus() {
	$filtered_svg = apply_filters( 'sbtl_default_svg__minus', '' );
	if ( ! empty( $filtered_svg ) ) {
		return wp_kses( $filtered_svg, sbtl_svg_kses_allowed() );
	}
	return '';
}

/**
 * Returns the default check SVG icon.
 *
 * @return string SVG markup.
 */
function sbtl_default_svg__check() {
	$filtered_svg = apply_filters( 'sbtl_default_svg__check', '' );
	if ( ! empty( $filtered_svg ) ) {
		return wp_kses( $filtered_svg, sbtl_svg_kses_allowed() );
	}
	return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
}

/**
 * Returns the default info SVG icon.
 *
 * @return string SVG markup.
 */
function sbtl_default_svg__info() {
	$filtered_svg = apply_filters( 'sbtl_default_svg__info', '' );
	if ( ! empty( $filtered_svg ) ) {
		return wp_kses( $filtered_svg, sbtl_svg_kses_allowed() );
	}
	return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4m0-4h.01"></path></g></svg>';
}

/**
 * Returns the wp_kses allowlist for SVG icon markup.
 *
 * Used both by the ACF field class (server-side sanitization on save) and by
 * the wp_kses_allowed_html filter below (allows SVG in post content for users
 * without the unfiltered_html capability — e.g. the Author role — so icon
 * block attributes stored in post_content are not stripped on save).
 *
 * This list was cross-referenced against enshrined/svg-sanitize
 * (https://github.com/darylldoyle/svg-sanitizer), the library used by
 * WordPress core for SVG media uploads since 6.5. Intentional divergences
 * from that reference are documented below.
 *
 * Security notes:
 * - No event-handler attributes (on*) are listed; wp_kses strips them globally.
 * - `style` is intentionally omitted from child elements. Lucide and Iconify
 *   icons use SVG presentation attributes (fill, stroke, etc.) rather than
 *   inline styles on children. `style` is allowed on the <svg> root only, where
 *   it is legitimately used for sizing/theming via CSS custom properties.
 * - wp_kses lowercases attribute names before matching, so camelCase SVG attrs
 *   (e.g. viewBox, preserveAspectRatio) must be listed in lowercase here.
 *
 * Intentional divergences from enshrined/svg-sanitize:
 * - Animation elements (<animate>, <animateTransform>, <animateMotion>, <set>,
 *   <mpath>) are excluded. While not script-executable, they can be used for
 *   distracting or deceptive UI animations by editor-role users.
 * - <image> is excluded; it can load external resources (SSRF / privacy leak).
 * - <style> as an element is excluded; inline CSS injection via a style block
 *   is a broader attack surface than the `style` attribute on the SVG root.
 * - <foreignObject> is excluded; permits arbitrary HTML injection.
 * - <metadata> and obsolete glyph elements (altGlyph, glyph, hkern, tref,
 *   vkern, etc.) are excluded as unnecessary for icon SVGs.
 *
 * @return array<string, array<string, bool>>
 */
function sbtl_svg_kses_allowed() {
	// SVG presentation attributes shared by most shape and container elements.
	// `style` is deliberately excluded here — see security notes above.
	$pres = array(
		'fill'              => true,
		'fill-opacity'      => true,
		'fill-rule'         => true,
		'stroke'            => true,
		'stroke-width'      => true,
		'stroke-linecap'    => true,
		'stroke-linejoin'   => true,
		'stroke-miterlimit' => true,
		'stroke-dasharray'  => true,
		'stroke-dashoffset' => true,
		'stroke-opacity'    => true,
		'opacity'           => true,
		'color'             => true,
		'transform'         => true,
		'clip-path'         => true,
		'clip-rule'         => true,
		'mask'              => true,
		// filter="url(#id)" — references a local <filter> element by fragment id.
		'filter'            => true,
		'visibility'        => true,
		'display'           => true,
		'paint-order'       => true,
		'vector-effect'     => true,
		// Path-end marker references (used in arrow / connector icons).
		'marker-end'        => true,
		'marker-mid'        => true,
		'marker-start'      => true,
		'class'             => true,
		'id'                => true,
	);

	// Attributes common to all SVG filter primitive (fe*) elements.
	$fe_common = array(
		'id'     => true,
		'class'  => true,
		'result' => true,
		'in'     => true,
		'in2'    => true,
		'x'      => true,
		'y'      => true,
		'width'  => true,
		'height' => true,
	);

	// Attributes for feFuncA/B/G/R (feComponentTransfer children).
	$fe_func = array(
		'type'        => true,
		'tablevalues' => true,
		'slope'       => true,
		'intercept'   => true,
		'amplitude'   => true,
		'exponent'    => true,
		'offset'      => true,
	);

	return array(
		// ------------------------------------------------------------------ //
		// Root element                                                        //
		// ------------------------------------------------------------------ //
		'svg'                => array_merge(
			$pres,
			array(
				// `style` on root only — see security notes above.
				'style'               => true,
				'xmlns'               => true,
				'xmlns:xlink'         => true,
				'viewbox'             => true,
				'width'               => true,
				'height'              => true,
				'preserveaspectratio' => true,
				'overflow'            => true,
				'tabindex'            => true,
				'role'                => true,
				'aria-hidden'         => true,
				'aria-label'          => true,
				'focusable'           => true,
			)
		),

		// ------------------------------------------------------------------ //
		// Structural / container elements                                     //
		// ------------------------------------------------------------------ //
		'g'                  => $pres,
		'defs'               => array( 'id' => true, 'class' => true ),
		'title'              => array( 'id' => true ),
		'desc'               => array( 'id' => true ),
		// <switch> renders the first child whose requiredFeatures/systemLanguage
		// matches; no script execution, useful for accessible icon variants.
		'switch'             => array( 'id' => true, 'class' => true ),
		'symbol'             => array_merge(
			$pres,
			array(
				'viewbox'             => true,
				'width'               => true,
				'height'              => true,
				'preserveaspectratio' => true,
				'overflow'            => true,
			)
		),
		'use'                => array_merge(
			$pres,
			array(
				'href'       => true,
				'xlink:href' => true,
				'x'          => true,
				'y'          => true,
				'width'      => true,
				'height'     => true,
			)
		),

		// ------------------------------------------------------------------ //
		// Shape elements                                                      //
		// ------------------------------------------------------------------ //
		'path'               => array_merge( $pres, array( 'd' => true, 'pathlength' => true ) ),
		'circle'             => array_merge( $pres, array( 'cx' => true, 'cy' => true, 'r' => true ) ),
		'ellipse'            => array_merge( $pres, array( 'cx' => true, 'cy' => true, 'rx' => true, 'ry' => true ) ),
		'rect'               => array_merge( $pres, array( 'x' => true, 'y' => true, 'width' => true, 'height' => true, 'rx' => true, 'ry' => true ) ),
		'line'               => array_merge( $pres, array( 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true ) ),
		'polyline'           => array_merge( $pres, array( 'points' => true ) ),
		'polygon'            => array_merge( $pres, array( 'points' => true ) ),

		// ------------------------------------------------------------------ //
		// Text elements                                                       //
		// ------------------------------------------------------------------ //
		'text'               => array_merge(
			$pres,
			array(
				'x'                  => true,
				'y'                  => true,
				'dx'                 => true,
				'dy'                 => true,
				'text-anchor'        => true,
				'dominant-baseline'  => true,
				'alignment-baseline' => true,
				'text-decoration'    => true,
				'letter-spacing'     => true,
				'word-spacing'       => true,
				'font-size'          => true,
				'font-family'        => true,
				'font-weight'        => true,
				'font-style'         => true,
				'font-variant'       => true,
				'font-stretch'       => true,
				'rotate'             => true,
				'textlength'         => true,
				'lengthadjust'       => true,
			)
		),
		'tspan'              => array_merge(
			$pres,
			array(
				'x'                  => true,
				'y'                  => true,
				'dx'                 => true,
				'dy'                 => true,
				'text-anchor'        => true,
				'dominant-baseline'  => true,
				'alignment-baseline' => true,
				'rotate'             => true,
				'textlength'         => true,
				'lengthadjust'       => true,
			)
		),
		'textpath'           => array_merge(
			$pres,
			array(
				'href'         => true,
				'xlink:href'   => true,
				'startoffset'  => true,
				'method'       => true,
				'spacing'      => true,
				'textlength'   => true,
				'lengthadjust' => true,
			)
		),

		// ------------------------------------------------------------------ //
		// Painting / compositing helpers                                      //
		// ------------------------------------------------------------------ //
		'clippath'           => array_merge( $pres, array( 'clippathhunits' => true ) ),
		'mask'               => array_merge(
			$pres,
			array(
				'x'                => true,
				'y'                => true,
				'width'            => true,
				'height'           => true,
				'maskunits'        => true,
				'maskcontentunits' => true,
			)
		),
		'marker'             => array_merge(
			$pres,
			array(
				'markerwidth'         => true,
				'markerheight'        => true,
				'markerunits'         => true,
				'orient'              => true,
				'refx'                => true,
				'refy'                => true,
				'viewbox'             => true,
				'preserveaspectratio' => true,
			)
		),
		'pattern'            => array_merge(
			$pres,
			array(
				'x'                   => true,
				'y'                   => true,
				'width'               => true,
				'height'              => true,
				'patternunits'        => true,
				'patterncontentunits' => true,
				'patterntransform'    => true,
				'viewbox'             => true,
				'preserveaspectratio' => true,
				'href'                => true,
				'xlink:href'          => true,
			)
		),

		// ------------------------------------------------------------------ //
		// Gradient elements                                                   //
		// ------------------------------------------------------------------ //
		'lineargradient'     => array_merge(
			$pres,
			array(
				'x1'                => true,
				'y1'                => true,
				'x2'                => true,
				'y2'                => true,
				'gradientunits'     => true,
				'gradienttransform' => true,
				'spreadmethod'      => true,
				'href'              => true,
				'xlink:href'        => true,
			)
		),
		'radialgradient'     => array_merge(
			$pres,
			array(
				'cx'                => true,
				'cy'                => true,
				'r'                 => true,
				'fx'                => true,
				'fy'                => true,
				'gradientunits'     => true,
				'gradienttransform' => true,
				'spreadmethod'      => true,
				'href'              => true,
				'xlink:href'        => true,
			)
		),
		'stop'               => array_merge(
			$pres,
			array(
				'offset'       => true,
				'stop-color'   => true,
				'stop-opacity' => true,
			)
		),

		// ------------------------------------------------------------------ //
		// Filter container                                                    //
		// Included to match the svgFilters profile used by DOMPurify on the  //
		// client side. All href values are fragment-only references (#id) and //
		// no filter primitive can load external resources or execute script.  //
		// ------------------------------------------------------------------ //
		'filter'             => array(
			'id'                          => true,
			'class'                       => true,
			'x'                           => true,
			'y'                           => true,
			'width'                       => true,
			'height'                      => true,
			'filterunits'                 => true,
			'primitiveunits'              => true,
			'color-interpolation-filters' => true,
		),

		// ------------------------------------------------------------------ //
		// Filter primitives                                                   //
		// ------------------------------------------------------------------ //
		'feblend'            => array_merge( $fe_common, array( 'mode' => true ) ),
		'fecolormatrix'      => array_merge( $fe_common, array( 'type' => true, 'values' => true ) ),
		'fecomponenttransfer' => $fe_common,
		'fecomposite'        => array_merge( $fe_common, array( 'operator' => true, 'k1' => true, 'k2' => true, 'k3' => true, 'k4' => true ) ),
		'feconvolvematrix'   => array_merge(
			$fe_common,
			array(
				'order'            => true,
				'kernelmatrix'     => true,
				'divisor'          => true,
				'bias'             => true,
				'targetx'          => true,
				'targety'          => true,
				'edgemode'         => true,
				'kernelunitlength' => true,
				'preservealpha'    => true,
			)
		),
		'fediffuselighting'  => array_merge(
			$fe_common,
			array(
				'surfacescale'     => true,
				'diffuseconstant'  => true,
				'kernelunitlength' => true,
				'lighting-color'   => true,
			)
		),
		'fedisplacementmap'  => array_merge(
			$fe_common,
			array(
				'scale'            => true,
				'xchannelselector' => true,
				'ychannelselector' => true,
			)
		),
		'fedistantlight'     => array( 'id' => true, 'class' => true, 'azimuth' => true, 'elevation' => true ),
		'feflood'            => array_merge( $fe_common, array( 'flood-color' => true, 'flood-opacity' => true ) ),
		'fefunca'            => $fe_func,
		'fefuncb'            => $fe_func,
		'fefuncg'            => $fe_func,
		'fefuncr'            => $fe_func,
		'fegaussianblur'     => array_merge( $fe_common, array( 'stddeviation' => true, 'edgemode' => true ) ),
		'femerge'            => $fe_common,
		'femergenode'        => array( 'id' => true, 'in' => true ),
		'femorphology'       => array_merge( $fe_common, array( 'operator' => true, 'radius' => true ) ),
		'feoffset'           => array_merge( $fe_common, array( 'dx' => true, 'dy' => true ) ),
		'fepointlight'       => array( 'id' => true, 'class' => true, 'x' => true, 'y' => true, 'z' => true ),
		'fespecularlighting' => array_merge(
			$fe_common,
			array(
				'surfacescale'     => true,
				'specularconstant' => true,
				'specularexponent' => true,
				'kernelunitlength' => true,
				'lighting-color'   => true,
			)
		),
		'fespotlight'        => array(
			'id'                => true,
			'class'             => true,
			'x'                 => true,
			'y'                 => true,
			'z'                 => true,
			'pointsatx'         => true,
			'pointsaty'         => true,
			'pointsatz'         => true,
			'specularexponent'  => true,
			'limitingconeangle' => true,
		),
		'fetile'             => $fe_common,
		'feturbulence'       => array_merge(
			$fe_common,
			array(
				'basefrequency' => true,
				'numoctaves'    => true,
				'seed'          => true,
				'stitchtiles'   => true,
				'type'          => true,
			)
		),
	);
}

/**
 * Extend the wp_kses 'post' allowlist to include SVG icon elements.
 *
 * Why this is necessary
 * ---------------------
 * WordPress calls wp_kses_post() on post_content when saving for any user who
 * lacks the unfiltered_html capability (Editors and below). The default 'post'
 * allowlist contains no SVG elements, so SVG markup stored inside Gutenberg
 * block attributes (e.g. iconMarkup, featureIcon) is silently stripped, causing
 * icons to disappear after the first save by an Author or Editor.
 *
 * Why this approach is safe
 * -------------------------
 * - Only the 'post' context is modified; all other kses contexts are unchanged.
 * - Only users who can already edit posts trigger this path.
 * - The allowlist is a strict, explicit whitelist: no <script>, no <iframe>,
 *   no <foreignObject>, no on* event attributes, no javascript: URIs.
 * - Inline `style` is permitted on the <svg> root only (not child elements),
 *   limiting CSS-injection surface while still allowing sizing/theming.
 * - SVG content reaching this point has already been sanitized by DOMPurify
 *   (with a fragment-only <use href> restriction) in the block editor before
 *   the post is ever submitted.
 *
 * @param array<string, array<string, bool>> $allowed_tags Current allowlist.
 * @param string                             $context      kses context identifier.
 * @return array<string, array<string, bool>>
 */
function sbtl_allow_svg_in_post_kses( $allowed_tags, $context ) {
	if ( 'post' !== $context ) {
		return $allowed_tags;
	}

	// Only extend the allowlist when a logged-in editor-or-below is active.
	// Administrators already have unfiltered_html and never reach wp_kses_post().
	if ( ! is_user_logged_in() || ! current_user_can( 'edit_posts' ) ) {
		return $allowed_tags;
	}

	return array_merge( $allowed_tags, sbtl_svg_kses_allowed() );
}
add_filter( 'wp_kses_allowed_html', 'sbtl_allow_svg_in_post_kses', 10, 2 );

<?php
/**
 * REST API Endpoints for Subtle Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Constants
 */
define( 'SBTL_ICONIFY_SEARCH_URL', 'https://api.iconify.design/search' );
define( 'SBTL_ICONIFY_COLLECTION_URL', 'https://api.iconify.design/collection' );
define( 'SBTL_MAX_COLLECTIONS', 10 );
define( 'SBTL_MAX_SEARCH_TERMS', 5 );
define( 'SBTL_MAX_PER_PAGE', 250 );
define( 'SBTL_DEFAULT_PER_PAGE', 50 );
define( 'SBTL_MAX_SEARCH_RESULTS', 999 );
define( 'SBTL_SEARCH_CACHE_TTL', 5 * MINUTE_IN_SECONDS );
define( 'SBTL_BROWSE_CACHE_TTL', HOUR_IN_SECONDS );
define( 'SBTL_HTTP_TIMEOUT', 3 );

/**
 * Register REST API routes.
 */
function sbtl_register_rest_routes() {
	register_rest_route(
		'subtle-icons/v1',
		'/icons',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'sbtl_get_icons',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'args'                => array(
				'search'      => array(
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function ( $val ) {
						return is_string( $val ) || is_null( $val );
					},
					'default'           => '',
				),
				'collections' => array(
					'sanitize_callback' => 'sbtl_sanitize_collections_param',
					'validate_callback' => function ( $val ) {
						return is_string( $val )
							|| is_array( $val )
							|| is_null( $val );
					},
					'default'           => '',
				),
				'collection'  => array(
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function ( $val ) {
						return is_string( $val ) || is_null( $val );
					},
					'default'           => '',
				),
				'page'        => array(
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'validate_callback' => function ( $val ) {
						return is_numeric( $val );
					},
					'default'           => 1,
				),
				'per_page'    => array(
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'validate_callback' => function ( $val ) {
						return is_numeric( $val );
					},
					'default'           => SBTL_DEFAULT_PER_PAGE,
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'sbtl_register_rest_routes' );

/**
 * Sanitize collections param (string or array to comma-separated string).
 *
 * @param mixed $val Raw parameter value.
 * @return string Comma-separated, sanitized collection prefixes.
 */
function sbtl_sanitize_collections_param( $val ) {
	if ( is_array( $val ) ) {
		return implode( ',', array_map( 'sanitize_text_field', $val ) );
	}
	return sanitize_text_field( $val );
}

/**
 * Wrapper around wp_remote_get with consistent timeout / SSL settings.
 *
 * @param string $url    Full request URL.
 * @param array  $params Query parameters to append.
 * @return array|WP_Error Response array or WP_Error.
 */
function sbtl_remote_get( $url, $params = array() ) {
	return wp_remote_get(
		add_query_arg( $params, $url ),
		array(
			'timeout'   => SBTL_HTTP_TIMEOUT,
			'sslverify' => true,
		)
	);
}

/**
 * Resolve which collections to query.
 *
 * @param WP_REST_Request $request The incoming request.
 * @return string[] Array of collection prefix strings.
 */
function sbtl_resolve_collections( $request ) {
	$default_collections = apply_filters(
		'sbtl_icon_picker_default_collections',
		array( 'lucide' )
	);

	$req_collections = $request->get_param( 'collections' );
	if ( empty( $req_collections ) ) {
		$req_collections = $request->get_param( 'collection' );
	}

	if ( ! empty( $req_collections ) ) {
		$active = is_string( $req_collections )
			? explode( ',', $req_collections )
			: (array) $req_collections;
	} else {
		$active = $default_collections;
	}

	$active = array_filter( array_map( 'trim', $active ) );

	if ( empty( $active ) ) {
		$active = array( 'lucide' );
	}

	// Cap to prevent request amplification.
	return array_slice( $active, 0, SBTL_MAX_COLLECTIONS );
}

/**
 * Clamp pagination parameters.
 *
 * @param WP_REST_Request $request The incoming request.
 * @return array{ page: int, per_page: int }
 */
function sbtl_resolve_pagination( $request ) {
	$page     = max( 1, (int) $request->get_param( 'page' ) );
	$per_page = (int) $request->get_param( 'per_page' );
	$per_page = max( 1, min( $per_page, SBTL_MAX_PER_PAGE ) );

	return array(
		'page'     => $page,
		'per_page' => $per_page,
	);
}

/**
 * Build a consistent REST response envelope.
 *
 * @param string[] $icons       Icon identifiers for the current page.
 * @param int      $total       Total number of matching icons.
 * @param int      $page        Current page number.
 * @param int      $per_page    Items per page.
 * @param bool     $api_errors  Whether any upstream requests failed.
 * @return WP_REST_Response
 */
function sbtl_icon_response(
	$icons,
	$total,
	$page,
	$per_page,
	$api_errors = false
) {
	$payload = array(
		'icons'       => array_values( $icons ),
		'total'       => $total,
		'total_pages' => (int) ceil( $total / max( 1, $per_page ) ),
		'page'        => $page,
		'per_page'    => $per_page,
	);

	if ( $api_errors ) {
		$payload['warning'] = 'One or more upstream API requests failed. Results may be incomplete.';
	}

	return new WP_REST_Response( $payload, 200 );
}

/**
 * BRANCH A – Search mode: query Iconify search API per term.
 *
 * @param string[] $terms             Sanitized, non-empty search terms.
 * @param string   $collections_str   Comma-separated collection prefixes.
 * @param int      $page              Current page.
 * @param int      $per_page          Items per page.
 * @return WP_REST_Response
 */
function sbtl_handle_search( $terms, $collections_str, $page, $per_page ) {
	// Create a cache key for the Query + Collections (independent of page).
	$cache_key = 'sbtl_search_agg_' . md5(
		implode( ',', $terms ) . '_' . $collections_str . '_' . SBTL_MAX_SEARCH_RESULTS
	);

	$all_icons  = get_transient( $cache_key );
	$had_errors = false;

	if ( false === $all_icons ) {
		$all_icons      = array();
		$limit_per_term = (int) floor( SBTL_MAX_SEARCH_RESULTS / count( $terms ) );
		$limit_per_term = max( 1, $limit_per_term );

		foreach ( $terms as $term ) {
			$response = sbtl_remote_get(
				SBTL_ICONIFY_SEARCH_URL,
				array(
					'query'    => $term,
					'prefixes' => $collections_str,
					'limit'    => $limit_per_term,
					// Always fetch from the start to build the master list.
					'start'    => 0,
				)
			);

			if ( is_wp_error( $response ) ) {
				$had_errors = true;
				continue;
			}

			$code = wp_remote_retrieve_response_code( $response );
			if ( $code < 200 || $code >= 300 ) {
				$had_errors = true;
				continue;
			}

			$body = wp_remote_retrieve_body( $response );
			$data = json_decode( $body, true );

			if ( ! is_array( $data ) ) {
				$had_errors = true;
				continue;
			}

			if ( ! empty( $data['icons'] ) ) {
				$all_icons = array_merge( $all_icons, $data['icons'] );
			}
		}

		// Deduplicate while preserving order.
		$all_icons = array_values( array_unique( $all_icons ) );

		set_transient( $cache_key, $all_icons, SBTL_SEARCH_CACHE_TTL );
	}

	$total  = count( $all_icons );
	$offset = ( $page - 1 ) * $per_page;
	$sliced = array_slice( $all_icons, $offset, $per_page );

	return sbtl_icon_response(
		$sliced,
		$total,
		$page,
		$per_page,
		$had_errors
	);
}

/**
 * BRANCH B – Browse mode: paginate full collection icon lists.
 *
 * @param string[] $active_collections Collection prefixes.
 * @param int      $page               Current page.
 * @param int      $per_page           Items per page.
 * @return WP_REST_Response
 */
function sbtl_handle_browse( $active_collections, $page, $per_page ) {
	// Build a deterministic cache key for the assembled result.
	$assembled_cache_key = 'sbtl_browse_' . md5(
		implode( ',', $active_collections )
	);
	$full_collection_icons = get_transient( $assembled_cache_key );
	$had_errors            = false;

	if ( false === $full_collection_icons ) {
		$full_collection_icons = array();

		foreach ( $active_collections as $coll_key ) {
			$coll_cache_key = 'sbtl_coll_full_' . md5( $coll_key );
			$coll_icons     = get_transient( $coll_cache_key );

			if ( false === $coll_icons ) {
				$response = sbtl_remote_get(
					SBTL_ICONIFY_COLLECTION_URL,
					array( 'prefix' => $coll_key )
				);

				$coll_icons = array();

				if ( is_wp_error( $response ) ) {
					$had_errors = true;
				} else {
					$code = wp_remote_retrieve_response_code( $response );
					if ( $code < 200 || $code >= 300 ) {
						$had_errors = true;
					} else {
						$body = wp_remote_retrieve_body( $response );
						$data = json_decode( $body, true );

						if ( is_array( $data ) ) {
							if ( ! empty( $data['uncategorized'] ) ) {
								foreach ( $data['uncategorized'] as $name ) {
									$coll_icons[] = $name;
								}
							}
							if ( ! empty( $data['categories'] ) ) {
								foreach ( $data['categories'] as $cat_icons ) {
									foreach ( $cat_icons as $name ) {
										$coll_icons[] = $name;
									}
								}
							}
						}
					}
				}

				$coll_icons = array_values( array_unique( $coll_icons ) );
				set_transient(
					$coll_cache_key,
					$coll_icons,
					SBTL_BROWSE_CACHE_TTL
				);
			}

			foreach ( $coll_icons as $icon_name ) {
				$full_collection_icons[] = $coll_key . ':' . $icon_name;
			}
		}

		// Cache the fully assembled + prefixed array.
		set_transient(
			$assembled_cache_key,
			$full_collection_icons,
			SBTL_BROWSE_CACHE_TTL
		);
	}

	$total = count( $full_collection_icons );
    
    // NOTE: For browse mode, we now return the FULL list to allow client-side pagination.
    // The page/per_page params are ignored for the 'icons' array but kept for compatibility/metadata if needed.
    
	return sbtl_icon_response(
		$full_collection_icons, // Return EVERYTHING
		$total,
		1, // Treat as single page of results
		$total, // Per page = total
		$had_errors
	);
}

/**
 * Main REST callback – fetch icons from Iconify API.
 *
 * @param WP_REST_Request $request The request data.
 * @return WP_REST_Response
 */
function sbtl_get_icons( $request ) {
	$search_term        = $request->get_param( 'search' );
	$active_collections = sbtl_resolve_collections( $request );
	$pagination         = sbtl_resolve_pagination( $request );
	$page               = $pagination['page'];
	$per_page           = $pagination['per_page'];
	$collections_str    = implode( ',', $active_collections );

	// --- BRANCH A: Search mode ---
	if ( ! empty( $search_term ) ) {
		$terms = array_filter( array_map( 'trim', explode( ',', $search_term ) ) );

		// Cap search terms to prevent request amplification.
		$terms = array_slice( $terms, 0, SBTL_MAX_SEARCH_TERMS );

		if ( empty( $terms ) ) {
			return sbtl_icon_response( array(), 0, $page, $per_page );
		}

		return sbtl_handle_search(
			$terms,
			$collections_str,
			$page,
			$per_page
		);
	}

	// --- BRANCH B: Browse mode ---
	return sbtl_handle_browse( $active_collections, $page, $per_page );
}



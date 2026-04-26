import { __ } from '@wordpress/i18n';
import { Modal, TextControl, Button, Spinner } from '@wordpress/components';
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { copy, check } from '@wordpress/icons';
import { Icon, getIcon, loadIcons } from '@iconify/react';
import sanitizeSvg from './sanitizeSvg';
import IconPickerPage from './IconPickerPage';
import BrowseGrid from './BrowseGrid';
import { ICONS_PER_PAGE, isIconifySlug, isPluginSlug } from './constants';
import PlaceHolderSVG from '../PlaceHolderSVG';

import {
	getCachedIcons,
	setCachedIcons,
	isInflight,
	markInflight,
	unmarkInflight,
} from './useIconCache';

const IconPickerModal = ( {
	isOpen,
	onClose,
	onSelect,
	initialValue,
	initialSlug = '',
	onSelectSlug,
} ) => {
	const [ activeCategory, setActiveCategory ] = useState( 'general' );
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ debouncedQuery, setDebouncedQuery ] = useState( '' );

	const [ totalPages, setTotalPages ] = useState( 0 );
	const [ activePage, setActivePage ] = useState( 1 );

	// In-memory icon list for browse mode (fetched once, cached at module scope).
	const [ allIcons, setAllIcons ] = useState( [] );

	// Normalized selection — single source of truth regardless of icon source.
	// Iconify:       { slug: 'mdi:alarm',  svg: '' }   (SVG resolved at insert time)
	// Plugin-owned:  { slug: 'custom',     svg: '<svg>...</svg>' }
	const [ selection, setSelection ] = useState( { slug: '', svg: '' } );

	// Textarea draft — updates on every keystroke but only commits to `selection`
	// on blur or paste, preventing mid-typing flicker and stale-selection bugs.
	const [ svgDraft, setSvgDraft ] = useState( '' );

	const [ isInserting, setIsInserting ] = useState( false );
	const [ isInitialLoading, setIsInitialLoading ] = useState( false );
	const [ isCopied, setIsCopied ] = useState( false );

	const searchInputRef = useRef( null );
	const scrollContainerRef = useRef( null );
	const textareaRef = useRef( null );

	// Derived: true in browse mode (no search query), false in search mode.
	const isBrowse = ! debouncedQuery;

	// Prefetch browse data and warm the Iconify bundle on first mount,
	// so the cache is populated before the user opens the modal.
	useEffect( () => {
		const CACHE_KEY = 'browse_all';
		if ( getCachedIcons( CACHE_KEY ) || isInflight( CACHE_KEY ) ) return;
		markInflight( CACHE_KEY );
		apiFetch( { path: '/subtle-icons/v1/icons?page=1&per_page=99999' } )
			.then( ( response ) => {
				if ( response?.icons?.length ) {
					setCachedIcons( CACHE_KEY, response.icons );
					// Warm the Iconify bundle for the first icon's collection
					// so @iconify/react has the SVG data ready before the grid renders.
					loadIcons( [ response.icons[ 0 ] ] );
				}
			} )
			.catch( () => {} )
			.finally( () => unmarkInflight( CACHE_KEY ) );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Seed normalized selection from props on each modal open.
	useEffect( () => {
		if ( ! isOpen ) return;

		setActiveCategory( 'general' );

		if ( isIconifySlug( initialSlug ) ) {
			// Known Iconify slug — pre-select the grid icon.
			setSelection( { slug: initialSlug, svg: '' } );
			setSvgDraft( '' );
		} else if (
			( ! initialSlug || initialSlug === 'custom' ) &&
			initialValue?.startsWith( '<svg' )
		) {
			// Custom or legacy SVG block — pre-populate the textarea.
			const clean = sanitizeSvg( initialValue );
			setSelection( { slug: 'custom', svg: clean } );
			setSvgDraft( initialValue );
		} else {
			setSelection( { slug: '', svg: '' } );
			setSvgDraft( '' );
		}
	}, [ isOpen ] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Debounce search input
	useEffect( () => {
		const timer = setTimeout( () => {
			setDebouncedQuery( searchQuery );
			// Only reset page if query actually changed?
			// Actually, we should check this in the effect that watches debouncedQuery.
			// But here we are just syncing them.
		}, 500 );
		return () => clearTimeout( timer );
	}, [ searchQuery ] );

	// Initial Load / Search Change
	useEffect( () => {
		if ( isOpen && activeCategory !== 'custom' ) {
			// Logic split:
			// 1. If debouncedQuery is empty -> BROWSE MODE (Client-side)
			// 2. If debouncedQuery is present -> SEARCH MODE (Server-side)

			fetchInitialMetadata();
			setTimeout( () => searchInputRef.current?.focus(), 100 );
		}
	}, [ isOpen, activeCategory, debouncedQuery ] );

	const fetchInitialMetadata = async () => {
		setTotalPages( 0 );
		setAllIcons( [] );
		setActivePage( 1 );
		setVisiblePages( new Set( [ 1 ] ) );
		setIsInitialLoading( true );
		try {
			// BRANCH A: BROWSE MODE (Load Once)
			if ( ! debouncedQuery ) {
				// Check cache first
				const cacheKey = 'browse_all'; // Simplified key, could depend on categories if we had them
				const cached = getCachedIcons( cacheKey );

				if ( cached ) {
					setAllIcons( cached );
					setTotalPages(
						Math.ceil( cached.length / ICONS_PER_PAGE )
					);
					setIsInitialLoading( false );
					return;
				}

				// Fetch full list
				// We likely don't need 'dist' params for full fetch in our modified endpoint,
				// but we keep the same endpoint structure.
				const response = await apiFetch( {
					path: `/subtle-icons/v1/icons?page=1&per_page=99999`, // Arbitrary high number or ignored by server
				} );

				if ( response && response.icons ) {
					const icons = response.icons;
					setCachedIcons( cacheKey, icons );
					setAllIcons( icons );
					setTotalPages( Math.ceil( icons.length / ICONS_PER_PAGE ) );
				}
			}
			// BRANCH B: SEARCH MODE (Server-side Pagination)
			else {
				// Fetch just first page to get metadata
				const response = await apiFetch( {
					path: `/subtle-icons/v1/icons?search=${ encodeURIComponent(
						debouncedQuery
					) }&page=1&per_page=${ ICONS_PER_PAGE }`,
				} );
				if ( response ) {
					setTotalPages( response.total_pages || 0 );
				}
			}
		} catch ( error ) {
			console.error( 'Error fetching metadata:', error );
			setTotalPages( 0 );
		} finally {
			setIsInitialLoading( false );
		}
	};

	const handleIconSelect = useCallback( ( icon ) => {
		// Selecting a grid icon clears any custom SVG — mutual exclusion.
		setSelection( { slug: icon, svg: '' } );
	}, [] );

	/**
	 * Sanitizes and commits a raw SVG string to the normalized selection.
	 * Only called on blur or paste — not on every keystroke.
	 */
	const commitSvg = useCallback( ( raw ) => {
		const clean = sanitizeSvg( raw.trim() );
		// Selecting a custom SVG clears any grid selection — mutual exclusion.
		setSelection(
			clean.includes( '<svg' )
				? { slug: 'custom', svg: clean }
				: { slug: '', svg: '' }
		);
	}, [] );

	const handleInsert = async () => {
		const { slug, svg } = selection;

		// Path 1: Iconify registry slug — resolve SVG from cache or API.
		if ( isIconifySlug( slug ) ) {
			setIsInserting( true );
			try {
				const [ prefix, name ] = slug.split( ':' );
				if (
					! /^[a-z0-9-]+$/.test( prefix ) ||
					! /^[a-z0-9-]+$/.test( name )
				) {
					throw new Error( 'Invalid icon identifier' );
				}

				// Fast path: @iconify/react caches data when the icon is rendered in the grid/preview.
				const iconData = getIcon( slug );
				let cleanSvg;

				if ( iconData ) {
					const {
						body,
						width = 24,
						height = 24,
						left = 0,
						top = 0,
					} = iconData;
					const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ left } ${ top } ${ width } ${ height }">${ body }</svg>`;
					cleanSvg = sanitizeSvg( rawSvg );
				} else {
					// Fallback: icon data not in cache (e.g. pre-selected slug not yet scrolled into view).
					const response = await fetch(
						`https://api.iconify.design/${ prefix }/${ name }.svg`
					);
					if ( ! response.ok )
						throw new Error( 'Failed to fetch SVG' );
					const svgContent = await response.text();
					cleanSvg = sanitizeSvg( svgContent );
				}

				onSelect( cleanSvg );
				if ( onSelectSlug ) onSelectSlug( slug );
				onClose();
			} catch ( error ) {
				console.error( 'Error fetching SVG content:', error );
			} finally {
				setIsInserting( false );
			}
			return;
		}

		// Path 2: Plugin-owned SVG (custom paste, upload, system, etc).
		// Already sanitized on commit — sanitize again for defense-in-depth.
		if ( svg ) {
			const cleanSvg = sanitizeSvg( svg );
			onSelect( cleanSvg );
			if ( onSelectSlug ) onSelectSlug( slug || 'custom' );
			onClose();
			return;
		}

		// Nothing active — clear.
		onSelect( '' );
		if ( onSelectSlug ) onSelectSlug( '' );
		onClose();
	};

	// Pagination render logic
	const renderPagination = () => {
		if ( totalPages <= 1 ) return null;

		// Simple window logic: show current +/- 2
		const pages = [];
		let start = Math.max( 1, activePage - 2 );
		let end = Math.min( totalPages, activePage + 2 );

		if ( start > 1 ) {
			pages.push(
				<Button
					key="first"
					isSmall
					variant="tertiary"
					onClick={ () => scrollToPage( 1 ) }
				>
					1
				</Button>
			);
			if ( start > 2 )
				pages.push(
					<span key="dots1" style={ { padding: '0 4px' } }>
						...
					</span>
				);
		}

		for ( let i = start; i <= end; i++ ) {
			pages.push(
				<Button
					key={ i }
					isSmall
					variant={ i === activePage ? 'primary' : 'tertiary' }
					onClick={ () => scrollToPage( i ) }
				>
					{ i }
				</Button>
			);
		}

		if ( end < totalPages ) {
			if ( end < totalPages - 1 )
				pages.push(
					<span key="dots2" style={ { padding: '0 4px' } }>
						...
					</span>
				);
			pages.push(
				<Button
					key="last"
					isSmall
					variant="tertiary"
					onClick={ () => scrollToPage( totalPages ) }
				>
					{ totalPages }
				</Button>
			);
		}

		return <div className="sbtl-icon-picker-pagination">{ pages }</div>;
	};

	// Track visible search pages — gates per-page API fetches in search mode.
	const [ visiblePages, setVisiblePages ] = useState( new Set( [ 1 ] ) );

	// Search mode only: lazy loading + active-page tracking via IntersectionObserver.
	// Browse mode uses direct click-based pagination — no observers needed.
	useEffect( () => {
		const container = scrollContainerRef.current;
		if ( ! container || totalPages === 0 || isBrowse ) return;

		// Large buffer so pages begin fetching before they scroll into view.
		const loadingObserver = new IntersectionObserver(
			( entries ) => {
				setVisiblePages( ( prev ) => {
					const next = new Set( prev );
					let changed = false;
					entries.forEach( ( entry ) => {
						if ( entry.isIntersecting ) {
							const page = parseInt(
								entry.target.getAttribute( 'data-page' ),
								10
							);
							if ( ! isNaN( page ) && ! next.has( page ) ) {
								next.add( page );
								changed = true;
							}
						}
					} );
					return changed ? next : prev;
				} );
			},
			{ root: container, rootMargin: '600px 0px', threshold: 0 }
		);

		// Tight centre-strip to determine which page is currently in view.
		const paginationObserver = new IntersectionObserver(
			( entries ) => {
				const visible = entries.filter( ( e ) => e.isIntersecting );
				if ( visible.length === 0 ) return;
				visible.sort( ( a, b ) => {
					const centre = ( e ) => {
						const rb = e.rootBounds;
						if ( ! rb ) return Infinity;
						return Math.abs(
							rb.top +
								rb.height / 2 -
								( e.boundingClientRect.top +
									e.boundingClientRect.height / 2 )
						);
					};
					return centre( a ) - centre( b );
				} );
				const page = parseInt(
					visible[ 0 ].target.getAttribute( 'data-page' ),
					10
				);
				if ( ! isNaN( page ) ) setActivePage( page );
			},
			{ root: container, rootMargin: '-45% 0px -45% 0px', threshold: 0 }
		);

		// All page wrapper divs are already in the DOM when this effect fires
		// (same React commit that set totalPages), so querySelectorAll finds them all.
		container.querySelectorAll( '[data-page]' ).forEach( ( node ) => {
			loadingObserver.observe( node );
			paginationObserver.observe( node );
		} );

		return () => {
			loadingObserver.disconnect();
			paginationObserver.disconnect();
		};
	}, [ totalPages, isBrowse ] );

	const scrollToPage = useCallback(
		( pageIndex ) => {
			setActivePage( pageIndex );
			if ( ! debouncedQuery ) {
				// Browse mode: instant page switch, reset scroll to top.
				scrollContainerRef.current?.scrollTo( { top: 0 } );
				return;
			}
			// Search mode: ensure the page is rendered, then scroll to it.
			setVisiblePages( ( prev ) => new Set( [ ...prev, pageIndex ] ) );
			requestAnimationFrame( () => {
				setTimeout( () => {
					scrollContainerRef.current
						?.querySelector( `[data-page="${ pageIndex }"]` )
						?.scrollIntoView( {
							behavior: 'auto',
							block: 'start',
						} );
				}, 50 );
			} );
		},
		[ debouncedQuery ]
	);

	if ( ! isOpen ) return null;

	return (
		<Modal
			title={ __( 'Icon Library', 'subtle-icons' ) }
			onRequestClose={ onClose }
			className="sbtl-icon-picker-modal"
			overlayClassName="sbtl-icon-picker-modal-overlay"
		>
			<div className="sbtl-icon-picker-layout">
				<div className="sbtl-icon-picker-sidebar">
					<button
						className={ `sbtl-icon-picker-category-btn ${
							activeCategory === 'general' ? 'is-active' : ''
						}` }
						onClick={ () => setActiveCategory( 'general' ) }
					>
						{ __( 'General', 'subtle-icons' ) }
					</button>
					<button
						className={ `sbtl-icon-picker-category-btn ${
							activeCategory === 'custom' ? 'is-active' : ''
						}` }
						onClick={ () => setActiveCategory( 'custom' ) }
					>
						{ __( 'Custom SVG', 'subtle-icons' ) }
					</button>
				</div>

				<div className="sbtl-icon-picker-content">
					{ activeCategory !== 'custom' ? (
						<>
							<div className="sbtl-icon-picker-search-container">
								<TextControl
									ref={ searchInputRef }
									value={ searchQuery }
									onChange={ setSearchQuery }
									placeholder={ __(
										'Search icons... (comma separated for multiple)',
										'subtle-icons'
									) }
								/>
							</div>

							<div className="sbtl-icon-picker-scroll-header">
								{ /* Optional header info like "Total icons: ..." */ }
							</div>

							{ isBrowse ? (
								// Browse mode: fully virtualized infinite scroll — no pagination needed.
								isInitialLoading ? (
									<div
										className="sbtl-icon-picker-grid-wrapper"
										style={ {
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
										} }
									>
										<Spinner />
									</div>
								) : (
									<BrowseGrid
										icons={ allIcons }
										selectedIcon={ selection.slug }
										onSelect={ handleIconSelect }
									/>
								)
							) : (
								// Search mode: per-page lazy fetch with pagination.
								<>
									<div
										className="sbtl-icon-picker-grid-wrapper"
										ref={ scrollContainerRef }
									>
										{ isInitialLoading &&
										totalPages === 0 ? (
											<div
												style={ {
													display: 'flex',
													justifyContent: 'center',
													padding: '40px',
												} }
											>
												<Spinner />
											</div>
										) : totalPages === 0 ? (
											<div
												style={ {
													padding: '40px',
													textAlign: 'center',
													color: '#666',
												} }
											>
												{ __(
													'No icons found.',
													'subtle-icons'
												) }
											</div>
										) : (
											Array.from( {
												length: totalPages,
											} ).map( ( _, i ) => {
												const pageIndex = i + 1;
												return (
													<IconPickerPage
														key={ `${ debouncedQuery }-${ pageIndex }` }
														pageIndex={ pageIndex }
														searchQuery={
															debouncedQuery
														}
														selectedIcon={
															selection.slug
														}
														onSelect={
															handleIconSelect
														}
														isVisible={ visiblePages.has(
															pageIndex
														) }
													/>
												);
											} )
										) }
									</div>
									{ renderPagination() }
								</>
							) }
						</>
					) : (
						<div className="sbtl-icon-picker-custom-svg-container">
							<p>
								{ __(
									'Paste your custom SVG code below. Ensure it has a viewBox attribute.',
									'subtle-icons'
								) }
							</p>
							<textarea
								ref={ textareaRef }
								className="sbtl-icon-picker-custom-svg-textarea"
								value={ svgDraft }
								onChange={ ( e ) =>
									setSvgDraft( e.target.value )
								}
								onBlur={ ( e ) => commitSvg( e.target.value ) }
								onPaste={ () =>
									requestAnimationFrame( () =>
										commitSvg(
											textareaRef.current?.value ?? ''
										)
									)
								}
								placeholder="<svg...>"
							/>
						</div>
					) }
				</div>
			</div>

			<div className="sbtl-icon-picker-footer">
				<Button
					variant="link"
					isDestructive
					onClick={ () => {
						setSelection( { slug: '', svg: '' } );
						setSvgDraft( '' );
					} }
				>
					{ __( 'Clear', 'subtle-icons' ) }
				</Button>
				<div className="sbtl-icon-picker-footer__right">
					<div className="sbtl-icon-picker-footer__icon-actions">
						{ ( selection.slug || selection.svg ) && (
							<Button
								icon={ isCopied ? check : copy }
								label={
									isCopied
										? __( 'SVG Copied!', 'subtle-icons' )
										: __( 'Copy SVG', 'subtle-icons' )
								}
								variant="tertiary"
								onClick={ () => {
									let svgToCopy;
									if ( isIconifySlug( selection.slug ) ) {
										const iconData = getIcon(
											selection.slug
										);
										if ( iconData ) {
											const {
												body,
												width = 24,
												height = 24,
												left = 0,
												top = 0,
											} = iconData;
											svgToCopy = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ left } ${ top } ${ width } ${ height }">${ body }</svg>`;
										}
									} else {
										svgToCopy = selection.svg;
									}
									if ( svgToCopy ) {
										navigator.clipboard.writeText(
											svgToCopy
										);
										setIsCopied( true );
										setTimeout(
											() => setIsCopied( false ),
											2000
										);
									}
								} }
							/>
						) }
					</div>
					{ isIconifySlug( selection.slug ) ? (
						<span className="sbtl-icon-preview">
							<Icon icon={ selection.slug } />
						</span>
					) : selection.svg ? (
						<span
							className="sbtl-icon-preview"
							dangerouslySetInnerHTML={ {
								__html: sanitizeSvg( selection.svg ),
							} }
						/>
					) : (
						<PlaceHolderSVG className="sbtl-icon-preview" />
					) }
					<Button
						variant="primary"
						disabled={ isInserting }
						onClick={ handleInsert }
					>
						{ isInserting
							? __( 'Inserting...', 'subtle-icons' )
							: __( 'Insert', 'subtle-icons' ) }
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default IconPickerModal;

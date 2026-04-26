import { __ } from '@wordpress/i18n';
import { useState, useEffect, memo } from '@wordpress/element';
import { Button, Tooltip } from '@wordpress/components';
import { Icon } from '@iconify/react';
import apiFetch from '@wordpress/api-fetch';
import { ICONS_PER_PAGE, prettifyIconSlug } from './constants';

/**
 * Renders a single page of search results, fetching lazily when scrolled into view.
 *
 * The outer wrapper div always carries data-page so the parent IntersectionObserver
 * can read the page index reliably regardless of loading state — no observe/unobserve
 * callbacks needed.
 */
const IconPickerPage = memo( ( { pageIndex, searchQuery, selectedIcon, onSelect, isVisible } ) => {
	const [ icons, setIcons ] = useState( [] );
	const [ status, setStatus ] = useState( 'idle' ); // idle | loading | success | error

	useEffect( () => {
		if ( ! isVisible || status !== 'idle' ) return;

		const controller = new AbortController();
		setStatus( 'loading' );

		apiFetch( {
			path: `/subtle-icons/v1/icons?search=${ encodeURIComponent( searchQuery ) }&page=${ pageIndex }&per_page=${ ICONS_PER_PAGE }`,
			signal: controller.signal,
		} )
			.then( ( response ) => {
				setIcons( response?.icons || [] );
				setStatus( 'success' );
			} )
			.catch( ( error ) => {
				if ( error.name !== 'AbortError' ) {
					setStatus( 'error' );
				}
			} );

		return () => controller.abort();
	}, [ isVisible, searchQuery, pageIndex ] );

	const renderContent = () => {
		if ( status === 'error' ) {
			return (
				<div
					className="sbtl-icon-picker-page is-error"
					style={ { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50px' } }
				>
					<p>{ __( 'Error loading icons.', 'subtle-icons' ) }</p>
					<Button isSmall variant="secondary" onClick={ () => setStatus( 'idle' ) }>
						{ __( 'Retry', 'subtle-icons' ) }
					</Button>
				</div>
			);
		}

		if ( status !== 'success' ) {
			return (
				<div className="sbtl-icon-picker-page-skeleton">
					{ [ ...Array( ICONS_PER_PAGE ) ].map( ( _, i ) => (
						<div key={ i } className="sbtl-icon-picker-item is-skeleton">&nbsp;</div>
					) ) }
				</div>
			);
		}

		if ( icons.length === 0 ) return null;

		return (
			<div className="sbtl-icon-picker-page">
				{ icons.map( ( icon ) => (
					<Tooltip key={ icon } text={ prettifyIconSlug( icon ) }>
						<button
							className={ `sbtl-icon-picker-item ${ selectedIcon === icon ? 'is-selected' : '' }` }
							onClick={ () => onSelect( icon ) }
							type="button"
							aria-label={ icon.replace( ':', ' ' ) }
						>
							<Icon icon={ icon } />
						</button>
					</Tooltip>
				) ) }
			</div>
		);
	};

	// Stable wrapper: data-page is always present so the parent IntersectionObserver
	// can read the page index without depending on any specific child element.
	return (
		<div data-page={ pageIndex }>
			{ renderContent() }
		</div>
	);
} );

export default IconPickerPage;

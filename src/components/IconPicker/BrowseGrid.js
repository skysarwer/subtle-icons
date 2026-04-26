import {
	memo,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from '@wordpress/element';
import { Button, Tooltip } from '@wordpress/components';
import { Icon } from '@iconify/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ICONS_PER_PAGE, prettifyIconSlug } from './constants';

const GAP = 12;
const MIN_ICON_SIZE = 64;

/**
 * Virtualized grid for browse mode. Renders only the rows currently in view,
 * keeping the DOM small regardless of how many icons are in the library.
 *
 * Column count and row height are derived from the container width via
 * ResizeObserver, so they stay accurate across container resizes. Pagination
 * is derived from the virtualizer's scroll state — no extra state needed.
 */
const BrowseGrid = memo( ( { icons, selectedIcon, onSelect } ) => {
	const containerRef = useRef( null );
	const [ metrics, setMetrics ] = useState( {
		colCount: 7,
		rowHeight: MIN_ICON_SIZE + GAP,
	} );
	const { colCount, rowHeight } = metrics;

	const totalPages = Math.ceil( icons.length / ICONS_PER_PAGE );

	// Compute column count and row height from the container's content width.
	// useLayoutEffect for synchronous first measurement (no paint flash).
	useLayoutEffect( () => {
		const el = containerRef.current;
		if ( ! el ) return;

		const update = ( width ) => {
			const cols = Math.max(
				1,
				Math.floor( ( width + GAP ) / ( MIN_ICON_SIZE + GAP ) )
			);
			const iconWidth = ( width - ( cols - 1 ) * GAP ) / cols;
			setMetrics( { colCount: cols, rowHeight: iconWidth + GAP } );
		};

		// Measure immediately — ResizeObserver fires on first observe in all
		// modern browsers, but we call update() directly as a reliable fallback.
		update( el.getBoundingClientRect().width );

		const observer = new ResizeObserver( ( [ entry ] ) => {
			update( entry.contentRect.width );
		} );
		observer.observe( el );
		return () => observer.disconnect();
	}, [] );

	const rowCount = Math.ceil( icons.length / colCount );

	const rowVirtualizer = useVirtualizer( {
		count: rowCount,
		getScrollElement: () => containerRef.current,
		estimateSize: () => rowHeight,
		overscan: 5,
	} );

	// Invalidate the size cache when rowHeight changes so the virtualizer
	// recalculates total scroll height after a container resize.
	useEffect( () => {
		rowVirtualizer.measure();
	}, [ rowHeight ] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Derive active page from the first visible virtual row — reactive because
	// the virtualizer re-renders on scroll, keeping getVirtualItems() current.
	const firstVisibleRow = rowVirtualizer.getVirtualItems()[ 0 ]?.index ?? 0;
	const activePage =
		Math.floor( ( firstVisibleRow * colCount ) / ICONS_PER_PAGE ) + 1;

	const scrollToPage = useCallback(
		( page ) => {
			const firstIconIndex = ( page - 1 ) * ICONS_PER_PAGE;
			const targetRow = Math.floor( firstIconIndex / colCount );
			rowVirtualizer.scrollToIndex( targetRow, { align: 'start' } );
		},
		[ colCount, rowVirtualizer ]
	); // eslint-disable-line react-hooks/exhaustive-deps

	const renderPagination = () => {
		if ( totalPages <= 1 ) return null;

		const pages = [];
		const start = Math.max( 1, activePage - 2 );
		const end = Math.min( totalPages, activePage + 2 );

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

	return (
		<>
			<div ref={ containerRef } className="sbtl-icon-picker-grid-wrapper">
				<div
					style={ {
						height: rowVirtualizer.getTotalSize(),
						position: 'relative',
					} }
				>
					{ rowVirtualizer.getVirtualItems().map( ( virtualRow ) => {
						const rowStart = virtualRow.index * colCount;
						const rowIcons = icons.slice(
							rowStart,
							rowStart + colCount
						);

						return (
							<div
								key={ virtualRow.key }
								style={ {
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									height: `${ virtualRow.size }px`,
									transform: `translateY(${ virtualRow.start }px)`,
									display: 'grid',
									gridTemplateColumns: `repeat(${ colCount }, 1fr)`,
									gap: `${ GAP }px`,
									paddingBottom: `${ GAP }px`,
									boxSizing: 'border-box',
								} }
							>
								{ rowIcons.map( ( icon ) => (
									<Tooltip
										key={ icon }
										text={ prettifyIconSlug( icon ) }
									>
										<button
											className={ `sbtl-icon-picker-item ${
												selectedIcon === icon
													? 'is-selected'
													: ''
											}` }
											onClick={ () => onSelect( icon ) }
											type="button"
											aria-label={ icon.replace(
												':',
												' '
											) }
										>
											<Icon icon={ icon } />
										</button>
									</Tooltip>
								) ) }
							</div>
						);
					} ) }
				</div>
			</div>
			{ renderPagination() }
		</>
	);
} );

export default BrowseGrid;

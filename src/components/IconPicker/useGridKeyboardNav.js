import { useCallback } from '@wordpress/element';

export const useGridKeyboardNav = () => {
	const handleGridFocusIn = useCallback( ( e ) => {
		const wrapper = e.currentTarget;
		if ( e.target === wrapper ) {
			const selected = wrapper.querySelector( '.is-selected' );
			const toFocus =
				selected ||
				wrapper.querySelector(
					'.sbtl-icon-picker-item:not(.is-skeleton)'
				);
			if ( toFocus ) {
				toFocus.setAttribute( 'tabindex', '0' );
				toFocus.focus();
			}
		}
		wrapper.setAttribute( 'tabindex', '-1' );
	}, [] );

	const handleGridFocusOut = useCallback( ( e ) => {
		const wrapper = e.currentTarget;
		if ( ! wrapper.contains( e.relatedTarget ) ) {
			wrapper.setAttribute( 'tabindex', '0' );
		}
	}, [] );

	const handleGridKeyDown = useCallback( ( e ) => {
		if (
			! [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ].includes(
				e.key
			)
		) {
			return;
		}

		const wrapper = e.currentTarget;
		const buttons = Array.from(
			wrapper.querySelectorAll(
				'.sbtl-icon-picker-item:not(.is-skeleton)'
			)
		);
		if ( ! buttons.length ) {
			return;
		}

		const currentIndex = buttons.indexOf( document.activeElement );
		if ( currentIndex === -1 ) {
			return;
		}

		e.preventDefault();

		let nextIndex = currentIndex;
		const firstY = buttons[ 0 ].getBoundingClientRect().y;
		let cols = 1;
		for ( let i = 1; i < buttons.length; i++ ) {
			if (
				Math.abs( buttons[ i ].getBoundingClientRect().y - firstY ) > 5
			) {
				cols = i;
				break;
			}
		}

		if ( e.key === 'ArrowRight' ) {
			nextIndex = currentIndex + 1;
		} else if ( e.key === 'ArrowLeft' ) {
			nextIndex = currentIndex - 1;
		} else if ( e.key === 'ArrowDown' ) {
			nextIndex = currentIndex + cols;
			if (
				nextIndex >= buttons.length &&
				currentIndex < buttons.length - 1
			) {
				nextIndex = buttons.length - 1;
			}
		} else if ( e.key === 'ArrowUp' ) {
			nextIndex = currentIndex - cols;
			if ( nextIndex < 0 && currentIndex > 0 ) {
				nextIndex = 0;
			}
		}

		if ( nextIndex >= 0 && nextIndex < buttons.length ) {
			buttons.forEach( ( b ) => b.setAttribute( 'tabindex', '-1' ) );
			buttons[ nextIndex ].setAttribute( 'tabindex', '0' );
			buttons[ nextIndex ].focus();
		}
	}, [] );

	return {
		tabIndex: 0,
		onFocus: handleGridFocusIn,
		onBlur: handleGridFocusOut,
		onKeyDown: handleGridKeyDown,
	};
};

import { useState } from '@wordpress/element';
import { Button, Icon, ToggleControl } from '@wordpress/components';
import { chevronUp, chevronDown } from '@wordpress/icons';

/**
 * Collapsible panel section with an inline toggle in its header.
 *
 * Renders the exact native `PanelBody` markup (`components-panel__body` >
 * `components-panel__body-title` > `components-panel__body-toggle`) so it sits
 * flush alongside real `PanelBody` sections, and adds a `ToggleControl` switch
 * in the header.
 *
 * The switch fires `onChange` independently of the open/collapsed state. When
 * `isToggled` is false the body is always collapsed and the collapse control is
 * disabled, regardless of `initialOpen`. Panels without `children` render as a
 * toggle-only row (no chevron).
 *
 * @param {Object}   props
 * @param {string}   props.title
 * @param {boolean}  props.isToggled
 * @param {Function} props.onChange
 * @param {boolean}  [props.initialOpen]
 * @param {string}   [props.toggleLabel]
 * @param {*}        [props.children]
 */
export default function ToggleablePanel( {
	title,
	isToggled,
	onChange,
	initialOpen = true,
	toggleLabel,
	children,
} ) {
	const [ isOpen, setIsOpen ] = useState( isToggled ? initialOpen : false );

	const hasBody = Boolean( children );
	const effectivelyOpen = isToggled && isOpen && hasBody;

	const panelClasses = [
		'components-panel__body',
		'sbtl-toggleable-panel',
		effectivelyOpen && 'is-opened',
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<div className={ panelClasses }>
			<h2 className="components-panel__body-title sbtl-toggleable-panel__title">
				{ hasBody ? (
					<Button
						__next40pxDefaultSize
						className="components-panel__body-toggle sbtl-toggleable-panel__collapse"
						aria-expanded={ effectivelyOpen }
						disabled={ ! isToggled }
						onClick={ ( event ) => {
							event.preventDefault();
							setIsOpen( ( prev ) => ! prev );
						} }
					>
						{ /*
							Firefox + NVDA don't announce aria-expanded because the
							browser repaints the whole element, so this wrapping
							span hides that.
						*/ }
						<span aria-hidden="true">
							<Icon
								className="components-panel__arrow"
								icon={
									effectivelyOpen ? chevronUp : chevronDown
								}
							/>
						</span>
						{ title }
					</Button>
				) : (
					<span className="sbtl-toggleable-panel__label">
						{ title }
					</span>
				) }
				<ToggleControl
					__nextHasNoMarginBottom
					label={ toggleLabel ?? title }
					hideLabelFromVision
					checked={ isToggled }
					onChange={ onChange }
					className="sbtl-toggleable-panel__switch"
				/>
			</h2>
			{ effectivelyOpen && children }
		</div>
	);
}

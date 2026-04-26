import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { TabPanel, BaseControl } from '@wordpress/components';

/**
 * Default state tabs shared by all appearance panels.
 *
 * Defined outside the component so the array reference is stable across renders
 * (avoids TabPanel resetting its internal selected-tab state on every parent render).
 */
const BASE_TABS = [
	{ name: 'default', title: __( 'Default', 'subtle-icons' ), className: 'sbtl-tab-default' },
	{ name: 'hover',   title: __( 'Hover',   'subtle-icons' ), className: 'sbtl-tab-hover'   },
	{ name: 'open',    title: __( 'Open',    'subtle-icons' ), className: 'sbtl-tab-open'    },
];

/**
 * Renders a labelled BaseControl that wraps a stateful tab strip.
 * Children must be a render-prop: `( tab ) => <ReactNode>`.
 *
 * @param {Object}    props
 * @param {string}    props.label          BaseControl label text.
 * @param {string}    [props.ariaLabel]    Optional aria-label forwarded to BaseControl.
 * @param {Array}     [props.tabs]         Tab definitions. Defaults to Default / Hover / Open.
 * @param {Object}    [props.hasActive]    Map of tab name → boolean. When true and the tab is
 *                                         not selected, a dot indicator is shown.
 * @param {Function}  props.children       Render-prop `( tab ) => <ReactNode>`.
 */
export default function StateTabPanel( { label, ariaLabel, tabs = BASE_TABS, hasActive = {}, children } ) {
	const [ selected, setSelected ] = useState( tabs[ 0 ]?.name );

	useEffect( () => {
		if ( tabs.some( ( tab ) => tab.name === selected ) ) {
			return;
		}

		setSelected( tabs[ 0 ]?.name );
	}, [ selected, tabs ] );

	const tabsWithDots = tabs.map( ( tab ) => ( {
		...tab,
		title: (
			<span className="sbtl-state-tab-title">
				{ tab.title }
				{ hasActive[ tab.name ] && tab.name !== selected && (
					<span className="sbtl-state-tab-title__dot" aria-hidden="true" />
				) }
			</span>
		),
	} ) );

	return (
		<BaseControl
			label={ label }
			aria-label={ ariaLabel }
			__nextHasNoMarginBottom
		>
			<TabPanel
				className="sbtl-minimal-tabs"
				tabs={ tabsWithDots }
				onSelect={ setSelected }
			>
				{ children }
			</TabPanel>
		</BaseControl>
	);
}

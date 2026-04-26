import { __ } from '@wordpress/i18n';
import { useRef } from '@wordpress/element';

import ShadowControl from '../../../components/ShadowControl';
import StateTabPanel from '../../../components/StateTabPanel';
import {
	getAppearanceForState,
	hasAppearanceValues,
	isGradientBackgroundValue,
} from '../appearance';

const APPEARANCE_TABS = [
	{ name: 'default', title: __( 'Default', 'subtle-icons' ), className: 'sbtl-tab-default' },
	{ name: 'hover', title: __( 'Hover', 'subtle-icons' ), className: 'sbtl-tab-hover' },
	{ name: 'active', title: __( 'Active', 'subtle-icons' ), className: 'sbtl-tab-active' },
];

const APPEARANCE_TABS_WITHOUT_ACTIVE = APPEARANCE_TABS.filter(
	( tab ) => tab.name !== 'active'
);

export default function AppearancePanel( {
	PanelColorGradientSettings,
	stateAppearance,
	hasLeadingIcon,
	hasTrailingIcon,
	setDefaultAppearance,
	setInteractiveAppearance,
} ) {
	const lastBackgroundChangeRef = useRef( null );
	const hoverHasActive = hasAppearanceValues( stateAppearance?.hover );
	const activeHasActive = hasAppearanceValues( stateAppearance?.active );
	const tabs = activeHasActive ? APPEARANCE_TABS : APPEARANCE_TABS_WITHOUT_ACTIVE;

	return (
		<StateTabPanel
			ariaLabel={ __( 'Icon Button Colors & Shadow', 'subtle-icons' ) }
			tabs={ tabs }
			hasActive={ {
				hover: hoverHasActive,
				active: activeHasActive,
			} }
		>
			{ ( stateTab ) => {
				const currentAppearance = getAppearanceForState( stateAppearance, stateTab.name );

				const setAppearanceValue = ( partial ) => {
					if ( stateTab.name === 'default' ) {
						setDefaultAppearance( partial );
						return;
					}

					setInteractiveAppearance( stateTab.name, partial );
				};

				const setBackgroundValue = ( source, value ) => {
					const lastBackgroundChange = lastBackgroundChangeRef.current;
					const shouldIgnoreMirroredReset =
						value == null &&
						lastBackgroundChange?.state === stateTab.name &&
						lastBackgroundChange?.source !== source &&
						lastBackgroundChange?.value != null;

					if ( shouldIgnoreMirroredReset ) {
						return;
					}

					lastBackgroundChangeRef.current = {
						state: stateTab.name,
						source,
						value,
					};

					setAppearanceValue( {
						background: value || undefined,
					} );
				};

				const appearanceColorSettings = [
					{
						label: __( 'Text', 'subtle-icons' ),
						colorValue: currentAppearance.text,
						onColorChange: ( value ) =>
							setAppearanceValue( { text: value } ),
					},
					{
						label: __( 'Background', 'subtle-icons' ),
						colorValue: isGradientBackgroundValue( currentAppearance.background )
							? undefined
							: currentAppearance.background,
						gradientValue: isGradientBackgroundValue( currentAppearance.background )
							? currentAppearance.background
							: undefined,
						onColorChange: ( value ) =>
							setBackgroundValue( 'color', value ),
						onGradientChange: ( value ) =>
							setBackgroundValue( 'gradient', value ),
						clearable: true,
					},
					{
						label: __( 'Border', 'subtle-icons' ),
						colorValue: currentAppearance.color,
						onColorChange: ( value ) =>
							setAppearanceValue( { color: value } ),
						clearable: true,
					},
                    ...( hasLeadingIcon
						? [ {
							label: __( 'Leading icon', 'subtle-icons' ),
							colorValue: currentAppearance.leadingIcon,
							onColorChange: ( value ) =>
								setAppearanceValue( { leadingIcon: value } ),
							clearable: true,
						} ]
						: [] ),
					...( hasTrailingIcon
						? [ {
							label: __( 'Trailing icon', 'subtle-icons' ),
							colorValue: currentAppearance.trailingIcon,
							onColorChange: ( value ) =>
								setAppearanceValue( { trailingIcon: value } ),
							clearable: true,
						} ]
						: [] ),
				];

				return (
					<>
						<PanelColorGradientSettings
							className="sbtl-nested-color-panel sbtl-minimal-color-panel"
							title={ __( 'Colors', 'subtle-icons' ) }
							settings={ appearanceColorSettings }
							enableAlpha={ true }
							__experimentalIsRenderedInSidebar
						/>
						<ShadowControl
							label={ __( 'Shadow', 'subtle-icons' ) }
							ariaLabel={ __( 'Icon Button Shadow', 'subtle-icons' ) }
							value={ currentAppearance.shadow }
							onChange={ ( value ) =>
								setAppearanceValue( { shadow: value || undefined } )
							}
						/>
					</>
				);
			} }
		</StateTabPanel>
	);
}
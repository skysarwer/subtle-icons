import { __ } from '@wordpress/i18n';
import {
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	RangeControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from '@wordpress/components';
import {
	justifyTop,
	justifyCenterVertical,
	justifyBottom,
	justifyLeft,
	justifyCenter,
	justifyRight,
} from '@wordpress/icons';

import RangedUnitControl from './RangedUnitControl';

/**
 * Shared ToolsPanel for iconOptions (size, gap, thickness, align).
 *
 * @param {Object}   props
 * @param {Object}   props.iconOptions   Current iconOptions object.
 * @param {Function} props.onChange      Called with a partial object to merge into iconOptions.
 * @param {Function} props.onResetAll    Called when "Reset all" is triggered.
 * @param {boolean}  [props.isHorizontal=true]  When true the align control is labelled
 *                                              "Vertical Align" and uses up/center/down icons.
 *                                              When false it becomes "Justify" with left/center/right.
 */
export default function IconOptionsPanel( {
	iconOptions = {},
	onChange,
	onResetAll,
	isHorizontal = true,
} ) {
	const alignLabel = isHorizontal
		? __( 'Vertical Align', 'subtle-icons' )
		: __( 'Justify', 'subtle-icons' );

	return (
		<ToolsPanel
			label={ __( 'Icon options', 'subtle-icons' ) }
			resetAll={ onResetAll }
		>
			<ToolsPanelItem
				label={ __( 'Size', 'subtle-icons' ) }
				isShownByDefault
				hasValue={ () => !! iconOptions?.size }
				onDeselect={ () => onChange( { size: undefined } ) }
			>
				<RangedUnitControl
					label={ __( 'Size', 'subtle-icons' ) }
					value={ iconOptions?.size }
					onChange={ ( value ) => onChange( { size: value } ) }
					units={ [
						{ value: 'em', label: 'em', step: 0.125, max: 4 },
						{ value: 'px', label: 'px', step: 1, max: 64 },
						{ value: 'rem', label: 'rem', step: 0.125, max: 4 },
					] }
					rangeByUnit={ {
						em: { min: 0, max: 4, step: 0.125 },
						px: { min: 0, max: 64, step: 1 },
						rem: { min: 0, max: 4, step: 0.125 },
					} }
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				label={ __( 'Gap', 'subtle-icons' ) }
				hasValue={ () => !! iconOptions?.gap }
				onDeselect={ () => onChange( { gap: undefined } ) }
			>
				<RangedUnitControl
					label={ __( 'Gap', 'subtle-icons' ) }
					value={ iconOptions?.gap }
					onChange={ ( value ) => onChange( { gap: value } ) }
					units={ [
						{ value: 'em', label: 'em', step: 0.05, max: 4 },
						{ value: 'px', label: 'px', step: 1, max: 64 },
						{ value: 'rem', label: 'rem', step: 0.05, max: 4 },
					] }
					rangeByUnit={ {
						em: { min: 0, max: 4, step: 0.05 },
						px: { min: 0, max: 64, step: 1 },
						rem: { min: 0, max: 4, step: 0.05 },
					} }
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				label={ __( 'Thickness', 'subtle-icons' ) }
				hasValue={ () => iconOptions?.stroke !== undefined }
				onDeselect={ () => onChange( { stroke: undefined } ) }
			>
				<RangeControl
					label={ __( 'Thickness', 'subtle-icons' ) }
					value={ iconOptions?.stroke }
					onChange={ ( value ) =>
						onChange( { stroke: value || undefined } )
					}
					min={ 0.5 }
					max={ 10 }
					step={ 0.5 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					allowReset
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				label={ alignLabel }
				isShownByDefault
				hasValue={ () => !! iconOptions?.align }
				onDeselect={ () => onChange( { align: undefined } ) }
			>
				<ToggleGroupControl
					label={ alignLabel }
					value={ iconOptions?.align }
					onChange={ ( value ) => onChange( { align: value } ) }
					isDeselectable
					className="sbtl-deselectable-toggle-group"
					isBlock
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				>
					<ToggleGroupControlOptionIcon
						value="start"
						icon={ isHorizontal ? justifyTop : justifyLeft }
						label={ __( 'Start', 'subtle-icons' ) }
					/>
					<ToggleGroupControlOptionIcon
						value="center"
						icon={
							isHorizontal ? justifyCenterVertical : justifyCenter
						}
						label={ __( 'Center', 'subtle-icons' ) }
					/>
					<ToggleGroupControlOptionIcon
						value="end"
						icon={ isHorizontal ? justifyBottom : justifyRight }
						label={ __( 'End', 'subtle-icons' ) }
					/>
				</ToggleGroupControl>
			</ToolsPanelItem>
		</ToolsPanel>
	);
}

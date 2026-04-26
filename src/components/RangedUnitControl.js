// @ts-nocheck

/**
 * WordPress dependencies
 */
import { useMemo, useEffect, useState } from '@wordpress/element';
import {
	Button,
	RangeControl,
	BaseControl,
	__experimentalGrid as Grid,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const DEFAULT_UNITS = [
	{ value: 'px', label: 'px', step: 1, default: 0 },
	{ value: '%', label: '%', step: 1, default: 0 },
	{ value: 'em', label: 'em', step: 0.1, default: 0 },
];

const isFiniteNumber = ( value ) =>
	typeof value === 'number' && Number.isFinite( value );

function toNumber( value ) {
	const parsed = typeof value === 'number' ? value : parseFloat( value );
	return Number.isFinite( parsed ) ? parsed : undefined;
}

function parseValue( value ) {
	if ( value === undefined || value === null || value === '' ) {
		return { quantity: undefined, unit: undefined };
	}

	if ( typeof value === 'number' ) {
		return { quantity: value, unit: undefined };
	}

	const match = `${ value }`
		.trim()
		.match( /^(-?(?:\d+|\d*\.\d+))([a-zA-Z%]*)$/ );
	if ( ! match ) {
		return { quantity: undefined, unit: undefined };
	}

	const quantity = toNumber( match[ 1 ] );
	return {
		quantity,
		unit: match[ 2 ] || undefined,
	};
}

function clamp( value, min, max ) {
	if ( ! isFiniteNumber( value ) ) {
		return value;
	}
	if ( isFiniteNumber( min ) && value < min ) {
		return min;
	}
	if ( isFiniteNumber( max ) && value > max ) {
		return max;
	}
	return value;
}

function getUnitSettings( unit, units, rangeByUnit, fallback ) {
	const configured = rangeByUnit?.[ unit ] || {};
	const activeUnit = units.find( ( option ) => option.value === unit );

	return {
		min: isFiniteNumber( configured.min ) ? configured.min : fallback.min,
		max: isFiniteNumber( configured.max ) ? configured.max : fallback.max,
		step: isFiniteNumber( configured.step )
			? configured.step
			: activeUnit?.step ?? fallback.step,
		default: isFiniteNumber( configured.default )
			? configured.default
			: activeUnit?.default,
	};
}

/**
 * A control that combines `UnitControl` and `RangeControl`.
 *
 * Use `rangeByUnit` to customize slider
 * min/max/step per unit.
 *
 * @param {Object} props Component props.
 * @param {string} [props.label] Accessible label shared by the two inputs.
 * @param {string|number} [props.value] Current value (`"12px"`, `"2em"`, etc).
 * @param {(nextValue?: string) => void} [props.onChange] Called with the next combined value.
 * @param {Array<{value: string, label: string, step?: number, default?: number}>} [props.units] Available units.
 * @param {Record<string, {min?: number, max?: number, step?: number, default?: number}>} [props.rangeByUnit] Slider settings per unit.
 * @param {number} [props.min=0] Fallback slider minimum.
 * @param {number} [props.max=100] Fallback slider maximum.
 * @param {number} [props.step=1] Fallback slider step.
 * @param {boolean} [props.disabled=false] Disables both controls.
 * @param {string} [props.help] Optional help text shown under the unit input.
 * @param {boolean} [props.isResetValueOnUnitChange=false] Resets quantity to unit default on unit switch.
 * @param {boolean} [props.withSliderInputField=false] Shows/hides `RangeControl` numeric input.
 * @param {boolean} [props.showResetButton=true] Shows/hides a reset button.
 * @param {string} [props.resetLabel] Custom reset button label.
 *
 * @example
 * ```jsx
 * import { useState } from '@wordpress/element';
 * import RangedUnitControl from './components/RangedUnitControl';
 *
 * const units = [
 * 	{ value: 'px', label: 'px', step: 1, default: 16 },
 * 	{ value: '%', label: '%', step: 1, default: 50 },
 * 	{ value: 'em', label: 'em', step: 0.1, default: 1 },
 * ];
 *
 * const rangeByUnit = {
 * 	px: { min: 0, max: 200, step: 1 },
 * 	'%': { min: 0, max: 100, step: 1 },
 * 	em: { min: 0, max: 10, step: 0.1 },
 * };
 *
 * export default function Example() {
 * 	const [ value, setValue ] = useState( '16px' );
 *
 * 	return (
 * 		<RangedUnitControl
 * 			label="Spacing"
 * 			value={ value }
 * 			onChange={ setValue }
 * 			units={ units }
 * 			rangeByUnit={ rangeByUnit }
 * 		/>
 * 	);
 * }
 * ```
 */
export default function RangedUnitControl( {
	label,
	value,
	onChange,
	units = DEFAULT_UNITS,
	rangeByUnit,
	min = 0,
	max = 100,
	step = 1,
	disabled = false,
	help,
	isResetValueOnUnitChange = false,
	withSliderInputField = false,
	showResetButton = true,
	resetLabel,
} ) {
	const parsed = useMemo( () => parseValue( value ), [ value ] );
	const [ activeUnit, setActiveUnit ] = useState( () => {
		return parsed.unit || units[ 0 ]?.value || 'px';
	} );

	useEffect( () => {
		if ( parsed.unit ) {
			setActiveUnit( parsed.unit );
		}
	}, [ parsed.unit ] );

	const unitSettings = useMemo( () => {
		return getUnitSettings( activeUnit, units, rangeByUnit, {
			min,
			max,
			step,
		} );
	}, [ activeUnit, units, rangeByUnit, min, max, step ] );

	const sliderValue = clamp(
		isFiniteNumber( parsed.quantity )
			? parsed.quantity
			: unitSettings.default ?? unitSettings.min,
		unitSettings.min,
		unitSettings.max
	);

	const emitValue = ( nextQuantity, nextUnit = activeUnit ) => {
		const unit = nextUnit || units[ 0 ]?.value || 'px';
		const targetUnitSettings = getUnitSettings( unit, units, rangeByUnit, {
			min,
			max,
			step,
		} );

		if (
			nextQuantity === undefined ||
			nextQuantity === null ||
			nextQuantity === ''
		) {
			onChange?.( undefined );
			return;
		}

		const quantity = toNumber( nextQuantity );
		if ( ! isFiniteNumber( quantity ) ) {
			onChange?.( undefined );
			return;
		}

		const clamped = clamp(
			quantity,
			targetUnitSettings.min,
			targetUnitSettings.max
		);
		onChange?.( `${ clamped }${ unit }` );
	};

	const resetToDefault = () => {
		onChange?.( undefined );
	};

	return (
		<BaseControl
			className="sbtl-ranged-unit-control__wrapper"
			label={ label }
			help={ help }
		>
			<Grid
				className="sbtl-ranged-unit-control"
				columns={ 3 }
				templateColumns="1fr 1fr min-content"
				role="group"
				aria-label={ label }
			>
				<RangeControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					hideLabelFromVision
					disabled={ disabled }
					value={ sliderValue }
					min={ unitSettings.min }
					max={ unitSettings.max }
					step={ unitSettings.step }
					withInputField={ withSliderInputField }
					onChange={ ( nextQuantity ) => emitValue( nextQuantity ) }
				/>
				<UnitControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					disabled={ disabled }
					value={ value }
					units={ units }
					isResetValueOnUnitChange={ isResetValueOnUnitChange }
					onChange={ ( nextValue ) => {
						onChange?.( nextValue || undefined );
					} }
					onUnitChange={ ( nextUnitValue, changeProps ) => {
						setActiveUnit( nextUnitValue );
						if (
							isResetValueOnUnitChange &&
							changeProps?.data?.default !== undefined
						) {
							emitValue(
								changeProps.data.default,
								nextUnitValue
							);
							return;
						}
						emitValue( parsed.quantity, nextUnitValue );
					} }
				/>
				{ showResetButton && (
					<Button
						variant="secondary"
						size="small"
						disabled={ disabled }
						onClick={ resetToDefault }
					>
						{ resetLabel || __( 'Reset', 'subtle-icons' ) }
					</Button>
				) }
			</Grid>
		</BaseControl>
	);
}

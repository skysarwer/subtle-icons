import { __ } from '@wordpress/i18n';
import {
	RangeControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { justifyBottom, justifyCenterVertical, justifyTop, justifyLeft, justifyCenter, justifyRight } from '@wordpress/icons';

import LinkedField from './LinkedField';
import RangedUnitControl from './RangedUnitControl';

/**
 * Normalize a stored size value — handles legacy integer format (e.g. 24)
 * and current unit-string format (e.g. "24px").
 *
 * @param {number|string|undefined} value
 * @return {string|undefined}
 */
function normalizeSize( value ) {
	if ( typeof value === 'number' ) return `${ value }px`;
	return value ?? undefined;
}

/**
 * Shared ToolsPanel for multi-slot icon sizing/alignment options.
 * Uses LinkedField so the user can set each slot independently or keep them in sync.
 *
 * @param {Object}    props
 * @param {Array}     props.groups                  [{ key, label }] — defines the linked field slots.
 * @param {Object}    props.slots                   { [key]: { size?, gap?, stroke?, align? } } — values per slot.
 * @param {string}    [props.panelId]               Optional panelId forwarded to ToolsPanel/ToolsPanelItem.
 * @param {Function}  props.resetAll                Resets all items.
 * @param {Function}  props.resetOption             Called with a field key to reset that field across all slots.
 * @param {Function}  props.setSlotOptions          Called with { [key]: partial } to update one or more slots.
 * @param {boolean}   [props.showAlign=true]        Whether to render the alignment ToolsPanelItem.
 * @param {string}    [props.alignConfig='horizontal'] 'horizontal' or 'vertical' — changes align icon set.
 * @param {boolean}   [props.sizeShownByDefault=true] Whether the Size item is shown by default.
 */
export default function LinkedIconOptionsPanel( {
	groups,
	slots,
	panelId,
	resetAll,
	resetOption,
	setSlotOptions,
	showAlign = true,
	alignConfig = 'horizontal',
	sizeShownByDefault = true,
} ) {
	if ( ! groups?.length ) return null;

	const slotOptions = ( key ) => groups.reduce( ( acc, group ) => {
		acc[ group.key ] = slots?.[ group.key ]?.[ key ] ?? undefined;
		return acc;
	}, {} );

	const applyLinkedValues = ( key, nextValues, mapValue = ( v ) => v ) => {
		const partials = {};
		groups.forEach( ( group ) => {
			partials[ group.key ] = { [ key ]: mapValue( nextValues[ group.key ] ) };
		} );
		setSlotOptions( partials );
	};

	const panelIdProps = panelId ? { panelId } : {};

	return (
		<ToolsPanel
			label={ __( 'Icon options', 'subtle-icons' ) }
			resetAll={ resetAll }
			{ ...panelIdProps }
		>
			<ToolsPanelItem
				label={ __( 'Size', 'subtle-icons' ) }
				isShownByDefault={ sizeShownByDefault }
				hasValue={ () => groups.some( ( g ) => !! slots?.[ g.key ]?.size ) }
				onDeselect={ () => resetOption( 'size' ) }
				__nextHasNoMarginBottom
				{ ...panelIdProps }
			>
				<LinkedField
					label={ __( 'Size', 'subtle-icons' ) }
					groups={ groups }
					values={ groups.reduce( ( acc, g ) => {
						acc[ g.key ] = normalizeSize( slots?.[ g.key ]?.size );
						return acc;
					}, {} ) }
					allowReset={ false }
					onChange={ ( nextValues ) => applyLinkedValues( 'size', nextValues ) }
					renderField={ ( field ) => (
						<RangedUnitControl
							label={ field.isLinked ? undefined : field.label }
							value={ field.value ?? undefined }
							onChange={ field.onChange }
							units={ [
								{ value: 'em', label: 'em', step: 0.125, max: 4 },
								{ value: 'px', label: 'px', step: 1, max: 64 },
								{ value: 'rem', label: 'rem', step: 0.125, max: 4 },
							] }
							rangeByUnit={ {
								px: { min: 0, max: 64, step: 1 },
								em: { min: 0, max: 4, step: 0.125 },
								rem: { min: 0, max: 4, step: 0.125 },
							} }
						/>
					) }
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				label={ __( 'Gap', 'subtle-icons' ) }
				hasValue={ () => groups.some( ( g ) => !! slots?.[ g.key ]?.gap ) }
				onDeselect={ () => resetOption( 'gap' ) }
				__nextHasNoMarginBottom
				{ ...panelIdProps }
			>
				<LinkedField
					label={ __( 'Gap', 'subtle-icons' ) }
					groups={ groups }
					values={ groups.reduce( ( acc, g ) => {
						acc[ g.key ] = slots?.[ g.key ]?.gap ?? undefined;
						return acc;
					}, {} ) }
					allowReset={ false }
					onChange={ ( nextValues ) => applyLinkedValues( 'gap', nextValues ) }
					renderField={ ( field ) => (
						<RangedUnitControl
							label={ field.isLinked ? undefined : field.label }
							value={ field.value ?? undefined }
							onChange={ field.onChange }
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
					) }
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				label={ __( 'Thickness', 'subtle-icons' ) }
				hasValue={ () => groups.some( ( g ) => slots?.[ g.key ]?.stroke !== undefined ) }
				onDeselect={ () => resetOption( 'stroke' ) }
				__nextHasNoMarginBottom
				{ ...panelIdProps }
			>
				<LinkedField
					label={ __( 'Thickness', 'subtle-icons' ) }
					groups={ groups }
					values={ groups.reduce( ( acc, g ) => {
						acc[ g.key ] = slots?.[ g.key ]?.stroke ?? undefined;
						return acc;
					}, {} ) }
					allowReset={ false }
					onChange={ ( nextValues ) => applyLinkedValues( 'stroke', nextValues ) }
					renderField={ ( field ) => (
						<RangeControl
							label={ field.isLinked ? undefined : field.label }
							value={ field.value ?? undefined }
							onChange={ ( value ) => field.onChange( value ?? undefined ) }
							min={ 0.5 }
							max={ 10 }
							step={ 0.5 }
							allowReset={ true }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					) }
				/>
			</ToolsPanelItem>

			{ showAlign && (
				<ToolsPanelItem
					label={ alignConfig === 'horizontal' ? __( 'Vertical align', 'subtle-icons' ) : __( 'Justify', 'subtle-icons' ) }
					isShownByDefault
					hasValue={ () => groups.some( ( g ) => !! slots?.[ g.key ]?.align ) }
					onDeselect={ () => resetOption( 'align' ) }
					__nextHasNoMarginBottom
					{ ...panelIdProps }
				>
					<LinkedField
						label={ alignConfig === 'horizontal' ? __( 'Vertical align', 'subtle-icons' ) : __( 'Justify', 'subtle-icons' ) }
						groups={ groups }
						values={ groups.reduce( ( acc, g ) => {
							acc[ g.key ] = slots?.[ g.key ]?.align || 'center';
							return acc;
						}, {} ) }
						allowReset={ false }
						onChange={ ( nextValues ) =>
							applyLinkedValues(
								'align',
								nextValues,
								( value ) => ( value && value !== 'center' ? value : undefined )
							)
						}
						renderField={ ( field ) => (
							<ToggleGroupControl
								label={ field.isLinked ? undefined : field.label }
								value={ field.value || 'center' }
								onChange={ field.onChange }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								isBlock
							>
								<ToggleGroupControlOptionIcon
									value="start"
									label={ __( 'Start', 'subtle-icons' ) }
									icon={ alignConfig === 'horizontal' ? justifyTop : justifyLeft }
									aria-label={ __( 'Align icon to the start', 'subtle-icons' ) }
								/>
								<ToggleGroupControlOptionIcon
									value="center"
									label={ __( 'Center', 'subtle-icons' ) }
									icon={ alignConfig === 'horizontal' ? justifyCenterVertical : justifyCenter }
									aria-label={ __( 'Align icon to the center', 'subtle-icons' ) }
								/>
								<ToggleGroupControlOptionIcon
									value="end"
									label={ __( 'End', 'subtle-icons' ) }
									icon={ alignConfig === 'horizontal' ? justifyBottom : justifyRight }
									aria-label={ __( 'Align icon to the end', 'subtle-icons' ) }
								/>
							</ToggleGroupControl>
						) }
					/>
				</ToolsPanelItem>
			) }
		</ToolsPanel>
	);
}

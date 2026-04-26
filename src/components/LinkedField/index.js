import { useInstanceId } from '@wordpress/compose';
import { BaseControl, Button } from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import LinkedButton from './LinkedButton';
import {
	applyLinkedValue,
	areGroupValuesEqual,
	cleanGroupedValues,
	getInitialLinkedState,
	getLinkedValue,
	getManagedValues,
	isEqualValue,
	mergeManagedValues,
	normalizeGroups,
} from './utils';

const noop = () => {};

function resolveRenderOutput( {
	children,
	renderField,
	fields,
	sharedContext,
} ) {
	if ( typeof children === 'function' ) {
		return children( {
			...sharedContext,
			fields,
		} );
	}

	if ( typeof renderField === 'function' ) {
		return fields.map( ( field ) => (
			<div key={ field.id } className="sbtl-linked-field__field">
				{ renderField( field ) }
			</div>
		) );
	}

	return null;
}

export default function LinkedField( {
	id: idProp,
	label = __( 'Linked field', 'subtle-icons' ),
	help,
	values,
	defaultValues = {},
	resetValues,
	onChange = noop,
	groups = [],
	isLinked: isLinkedProp,
	defaultLinked = true,
	onLinkedChange,
	allowReset = true,
	linkedLabel,
	linkLabel,
	renderField,
	children,
	disabled = false,
	syncOnLink = true,
	className,
} ) {
	const normalizedGroups = useMemo(
		() => normalizeGroups( groups ),
		[ groups ]
	);
	const isValueControlled = values !== undefined;
	const isLinkControlled = isLinkedProp !== undefined;
	const instanceId = useInstanceId( LinkedField, 'sbtl-linked-field' );
	const id = idProp || instanceId;

	const [ internalValues, setInternalValues ] = useState( () =>
		getManagedValues( defaultValues, normalizedGroups, defaultValues )
	);
	const [ internalLinked, setInternalLinked ] = useState( () =>
		getInitialLinkedState( {
			values,
			groups: normalizedGroups,
			defaultValues,
			defaultLinked,
		} )
	);

	useEffect( () => {
		if ( isValueControlled ) {
			return;
		}

		setInternalValues( ( currentValues ) =>
			mergeManagedValues(
				currentValues,
				getManagedValues(
					currentValues,
					normalizedGroups,
					defaultValues
				),
				normalizedGroups
			)
		);
	}, [ defaultValues, isValueControlled, normalizedGroups ] );

	const currentValues = isValueControlled ? values || {} : internalValues;
	const managedValues = useMemo(
		() =>
			getManagedValues( currentValues, normalizedGroups, defaultValues ),
		[ currentValues, defaultValues, normalizedGroups ]
	);
	const currentLinkedValue = useMemo(
		() => getLinkedValue( managedValues, normalizedGroups, defaultValues ),
		[ defaultValues, managedValues, normalizedGroups ]
	);
	const isLinked = isLinkControlled ? isLinkedProp : internalLinked;
	const resolvedResetValues = useMemo(
		() =>
			getManagedValues(
				resetValues || defaultValues,
				normalizedGroups,
				defaultValues
			),
		[ defaultValues, normalizedGroups, resetValues ]
	);
	const isDirty = ! isEqualValue( managedValues, resolvedResetValues );
	const hasMultipleGroups = normalizedGroups.length > 1;
	const showLinkButton = hasMultipleGroups;
	const showResetButton = allowReset;
	const headerColumns = [ '1fr' ];
	const controlColumns = [ '1fr' ];

	if ( showLinkButton ) {
		headerColumns.push( 'min-content' );
	}

	if ( showResetButton ) {
		controlColumns.push( 'min-content' );
	}

	const commitValues = ( nextManagedValues ) => {
		const nextValues = cleanGroupedValues(
			mergeManagedValues(
				currentValues,
				nextManagedValues,
				normalizedGroups
			)
		);
		const resolvedValues = nextValues || {};

		if ( ! isValueControlled ) {
			setInternalValues( resolvedValues );
		}

		onChange( resolvedValues );

		return resolvedValues;
	};

	const commitLinkedState = ( nextLinked ) => {
		if ( ! isLinkControlled ) {
			setInternalLinked( nextLinked );
		}

		if ( typeof onLinkedChange === 'function' ) {
			onLinkedChange( nextLinked );
		}
	};

	const updateLinkedValue = ( nextValue ) => {
		commitValues( applyLinkedValue( normalizedGroups, nextValue ) );
	};

	const updateGroupValue = ( groupKey, nextValue ) => {
		commitValues( {
			...managedValues,
			[ groupKey ]: nextValue,
		} );
	};

	const toggleLinked = () => {
		const nextLinked = ! isLinked;

		if (
			nextLinked &&
			syncOnLink &&
			! areGroupValuesEqual( managedValues, normalizedGroups )
		) {
			updateLinkedValue( currentLinkedValue );
		}

		commitLinkedState( nextLinked );
	};

	const handleReset = () => {
		commitValues( resolvedResetValues );
		commitLinkedState(
			getInitialLinkedState( {
				values: resolvedResetValues,
				groups: normalizedGroups,
				defaultValues,
				defaultLinked,
			} )
		);
	};

	const linkedField = {
		id: `${ id }-linked`,
		key: 'linked',
		groupKey: null,
		label: linkedLabel || label,
		value: currentLinkedValue,
		values: managedValues,
		groups: normalizedGroups,
		isLinked: true,
		disabled,
		onChange: updateLinkedValue,
	};

	const groupFields = normalizedGroups.map( ( group ) => ( {
		id: `${ id }-${ group.key }`,
		key: group.key,
		groupKey: group.key,
		label: group.label,
		value: managedValues?.[ group.key ],
		values: managedValues,
		groups: normalizedGroups,
		isLinked: false,
		disabled,
		onChange: ( nextValue ) => updateGroupValue( group.key, nextValue ),
	} ) );

	const sharedContext = {
		id,
		label,
		groups: normalizedGroups,
		values: managedValues,
		isLinked,
		disabled,
		isDirty,
		toggleLinked,
		reset: handleReset,
		updateLinkedValue,
		updateGroupValue,
	};

	const renderedFields = resolveRenderOutput( {
		children,
		renderField,
		fields: isLinked ? [ linkedField ] : groupFields,
		sharedContext,
	} );

	return (
		<BaseControl
			id={ id }
			help={ help }
			className={
				[ 'sbtl-linked-field', className ]
					.filter( Boolean )
					.join( ' ' ) + ( isLinked ? ' is-linked' : ' is-unlinked' )
			}
			__nextHasNoMarginBottom
		>
			<div
				className="sbtl-linked-field__header"
				style={ {
					display: 'grid',
					gridTemplateColumns: headerColumns.join( ' ' ),
					gap: '8px',
					alignItems: 'center',
				} }
			>
				<BaseControl.VisualLabel>{ label }</BaseControl.VisualLabel>
				{ showLinkButton && (
					<LinkedButton
						onClick={ toggleLinked }
						isLinked={ isLinked }
						label={ linkLabel }
						disabled={ disabled }
					/>
				) }
			</div>
			<div
				className="sbtl-linked-field__controls"
				style={ {
					display: 'grid',
					gridTemplateColumns: controlColumns.join( ' ' ),
					gap: '8px',
					alignItems: 'start',
				} }
			>
				<div
					className="sbtl-linked-field__fields"
					style={ {
						display: 'grid',
						gap: '8px',
					} }
				>
					{ renderedFields }
				</div>
				{ showResetButton && (
					<Button
						className="sbtl-linked-field__reset-button"
						variant="secondary"
						size="small"
						onClick={ handleReset }
						disabled={ disabled || ! isDirty }
					>
						{ __( 'Reset', 'subtle-icons' ) }
					</Button>
				) }
			</div>
		</BaseControl>
	);
}

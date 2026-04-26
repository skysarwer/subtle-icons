import { createRoot, useState } from '@wordpress/element';
import './style.scss';
import IconPicker from '../../components/IconPicker';

const AcfIconPickerField = ( { field } ) => {
	const [ value, setValue ] = useState(
		field.find( 'input.sbtl-acf-icon-picker-input' ).val()
	);

	const handleChange = ( newValue ) => {
		setValue( newValue );
		field
			.find( 'input.sbtl-acf-icon-picker-input' )
			.val( newValue )
			.trigger( 'change' );
	};

	return <IconPicker value={ value } onChange={ handleChange } />;
};

if ( window.acf ) {
	window.acf.addAction( 'ready_field/type=sbtl_icon_picker', ( field ) => {
		const $el = field.$el;
		const $container = $el.find( '.sbtl-acf-icon-picker-container' );

		if ( $container.length ) {
			createRoot( $container[ 0 ] ).render(
				<AcfIconPickerField field={ $el } />
			);
		}
	} );

	// Support for append (Repeaters/Flexible Content)
	window.acf.addAction( 'append_field/type=sbtl_icon_picker', ( field ) => {
		const $el = field.$el;
		const $container = $el.find( '.sbtl-acf-icon-picker-container' );

		if ( $container.length ) {
			createRoot( $container[ 0 ] ).render(
				<AcfIconPickerField field={ $el } />
			);
		}
	} );
}

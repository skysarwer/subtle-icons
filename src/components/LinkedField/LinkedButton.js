import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { link, linkOff } from '@wordpress/icons';

export default function LinkedButton( { isLinked, label, ...props } ) {
	const buttonLabel =
		label ||
		( isLinked
			? __( 'Unlink fields', 'subtle-icons' )
			: __( 'Link fields', 'subtle-icons' ) );

	return (
		<Button
			{ ...props }
			className={ [ 'sbtl-linked-field__linked-button', props.className ]
				.filter( Boolean )
				.join( ' ' ) }
			size="small"
			icon={ isLinked ? link : linkOff }
			iconSize={ 24 }
			label={ buttonLabel }
		/>
	);
}

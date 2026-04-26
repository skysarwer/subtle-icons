import { useBlockProps } from '@wordpress/block-editor';

// v1 — original production markup: no sbtl-icon-region class, size stored as integer `width`.
// Migrates to: size as unit string, stroke undefined.
const v1 = {
	attributes: {
		iconMarkup: {
			type: 'string',
			default: '',
		},
		width: {
			type: 'number',
			default: 48,
		},
	},

	migrate( { width, ...rest } ) {
		return {
			...rest,
			size:
				typeof width === 'number' ? `${ width }px` : width || undefined,
		};
	},

	save( { attributes } ) {
		const { iconMarkup, width } = attributes;

		if ( ! iconMarkup ) {
			return null;
		}

		const blockProps = useBlockProps.save( {
			className: 'sbtl-icon-block',
			style: {
				'--icon-width': `${ width }px`,
			},
		} );

		return (
			<span { ...blockProps }>
				<span
					className="sbtl-icon-wrapper"
					dangerouslySetInnerHTML={ { __html: iconMarkup } }
				/>
			</span>
		);
	},
};

export default [ v1 ];

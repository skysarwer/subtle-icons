import {
	useBlockProps,
	RichText,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
} from '@wordpress/block-editor';

const TAG_MAP = {
	0: 'p',
	1: 'h1',
	2: 'h2',
	3: 'h3',
	4: 'h4',
	5: 'h5',
	6: 'h6',
};

export default function save( { attributes } ) {
	const {
		content,
		level,
		icon,
		iconOptions,
		iconPosition,
		iconColor,
		url,
		linkTarget,
		rel,
		shadow,
	} = attributes;
	const borderProps = getBorderClassesAndStyles( attributes );

	const TagName = TAG_MAP[ level ] || 'p';

	const blockProps = useBlockProps.save( {
		className: [
			'sbtl-icon-text',
			level > 0 ? 'wp-block-heading' : '',
			borderProps.className,
			`has-icon-position-${ iconPosition || 'left' }`,
			...( iconOptions?.stroke ? [ 'has-icon-stroke' ] : [] ),
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			...borderProps.style,
			...( shadow ? { boxShadow: shadow } : {} ),
			...( iconOptions?.gap
				? { '--sbtl-icon-gap': iconOptions.gap }
				: {} ),
			...( iconOptions?.size
				? { '--sbtl-icon-size': iconOptions.size }
				: {} ),
			...( iconOptions?.stroke
				? { '--sbtl-icon-stroke': iconOptions.stroke }
				: {} ),
			...( iconOptions?.align
				? { '--sbtl-icon-align': iconOptions.align }
				: {} ),
			...( iconColor ? { '--sbtl-icon-color': iconColor } : {} ),
		},
	} );

	const iconMarkup = icon ? (
		<span
			className="sbtl-icon"
			dangerouslySetInnerHTML={ { __html: icon } }
			aria-hidden="true"
		/>
	) : null;

	const textMarkup = (
		<RichText.Content
			tagName="span"
			className="sbtl-icon-text__content"
			value={ content }
		/>
	);

	const inner = url ? (
		<a
			href={ url }
			className="sbtl-icon-region"
			target={ linkTarget || undefined }
			rel={ rel || undefined }
		>
			{ iconMarkup }
			{ textMarkup }
		</a>
	) : (
		<span className="sbtl-icon-region">
			{ iconMarkup }
			{ textMarkup }
		</span>
	);

	return <TagName { ...blockProps }>{ inner }</TagName>;
}

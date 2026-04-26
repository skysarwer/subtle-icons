
import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { iconMarkup, size, stroke } = attributes;

    // We only render if there is an icon
    if (!iconMarkup) {
        return null;
    }

    const blockProps = useBlockProps.save({
        className: [ 'sbtl-icon-block', 'sbtl-icon-region', stroke ? 'has-icon-stroke' : '' ]
            .filter( Boolean )
            .join( ' ' ),
        style: {
            '--sbtl-icon-size': size || undefined,
            '--sbtl-icon-stroke': stroke || undefined,
        }
    });

    return (
        <span {...blockProps}>
            <span
                className="sbtl-icon"
                dangerouslySetInnerHTML={{ __html: iconMarkup }}
            />
        </span>
    );
}

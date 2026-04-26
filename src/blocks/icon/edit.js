
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { IconPickerTrigger, IconPickerPreview } from '../../components/IconPicker';
import IconPickerModal from '../../components/IconPicker/IconPickerModal';
import useIconAutoResolve from '../../components/IconPicker/useIconAutoResolve';
import RangedUnitControl from '../../components/RangedUnitControl';
import './style.scss';

const SIZE_UNITS = [
	{ value: 'px', label: 'px', step: 1, max: 200 },
	{ value: 'em', label: 'em', step: 0.125, max: 12 },
	{ value: 'rem', label: 'rem', step: 0.125, max: 12 },
];

const SIZE_RANGE_BY_UNIT = {
	px:  { min: 16, max: 200, step: 1 },
	em:  { min: 0.5, max: 12, step: 0.125 },
	rem: { min: 0.5, max: 12, step: 0.125 },
};

export default function Edit({ attributes, setAttributes }) {
    const { iconMarkup, iconSlug, size, stroke } = attributes;
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    useIconAutoResolve(
        iconMarkup,
        ( svg ) => setAttributes( { iconMarkup: svg } ),
        ( slug ) => setAttributes( { iconSlug: slug } )
    );

    const blockProps = useBlockProps({
        className: [ 'sbtl-icon-block', 'sbtl-icon-region', stroke ? 'has-icon-stroke' : '' ]
            .filter( Boolean )
            .join( ' ' ),
        style: {
            '--sbtl-icon-size': size || undefined,
            '--sbtl-icon-stroke': stroke || undefined,
            display: 'inline-flex',
        }
    });

    return (
        <div>
            <div {...blockProps}>
                <InspectorControls>
                    <PanelBody title={__('Settings', 'subtle-icons')}>
                        <IconPickerTrigger
                            value={iconMarkup}
                            onOpen={() => setIsIconPickerOpen(true)}
                            onClear={() => setAttributes({ iconMarkup: '', iconSlug: '' })}
                        />
                        <RangedUnitControl
                            label={ __( 'Size', 'subtle-icons' ) }
                            value={ size }
                            onChange={ ( value ) => setAttributes( { size: value || undefined } ) }
                            units={ SIZE_UNITS }
                            rangeByUnit={ SIZE_RANGE_BY_UNIT }
                            allowReset
                        />
                        <RangeControl
                            label={ __( 'Stroke thickness', 'subtle-icons' ) }
                            value={ stroke }
                            onChange={ ( value ) => setAttributes( { stroke: value ?? undefined } ) }
                            min={ 0.5 }
                            max={ 10 }
                            step={ 0.5 }
                            allowReset
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </PanelBody>
                </InspectorControls>
                <IconPickerPreview
                    value={ iconMarkup }
                    onOpen={ () => setIsIconPickerOpen( true ) }
                />
            </div>
            <IconPickerModal
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                initialValue={iconMarkup}
                initialSlug={iconSlug}
                onSelect={(svg) => { setAttributes({ iconMarkup: svg }); setIsIconPickerOpen(false); }}
                onSelectSlug={(slug) => setAttributes({ iconSlug: slug })}
            />
        </div>
    );
}

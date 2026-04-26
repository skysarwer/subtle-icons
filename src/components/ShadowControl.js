import { __ } from '@wordpress/i18n';
import { useSettings } from '@wordpress/block-editor';
import {
    BaseControl,
    Button,
    ColorPalette,
    Popover,
    __experimentalGrid as Grid,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    __experimentalUnitControl as UnitControl,
    Tooltip,
} from '@wordpress/components';
import { useState, useMemo, useEffect } from '@wordpress/element';
import { check, shadow, arrowLeft, plus } from '@wordpress/icons';

const EMPTY_ARRAY = [];
const DEFAULT_SHADOW_LAYER = {
    x: 0,
    y: 4,
    blur: 12,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.15)',
    inset: false,
    unit: 'px',
};

const parseShadowLayer = (layer) => {
    if (!layer) return { ...DEFAULT_SHADOW_LAYER };

    const inset = /^inset\s+/.test(layer);
    const trimmed = layer.replace(/^inset\s+/, '').trim();

    const match = trimmed.match(
        /^(-?\d+(?:\.\d+)?)([a-z%]+)?\s+(-?\d+(?:\.\d+)?)([a-z%]+)?\s+(\d+(?:\.\d+)?)([a-z%]+)?(?:\s+(-?\d+(?:\.\d+)?)([a-z%]+)?)?\s+(.*)$/
    );

    if (!match) {
        return { ...DEFAULT_SHADOW_LAYER };
    }

    const [, x, unitX, y, unitY, blur, unitBlur, spread, unitSpread, color] = match;
    const unit = unitX || unitY || unitBlur || unitSpread || DEFAULT_SHADOW_LAYER.unit;

    return {
        x: parseFloat(x),
        y: parseFloat(y),
        blur: parseFloat(blur),
        spread: spread !== undefined ? parseFloat(spread) : 0,
        color: color?.trim() || DEFAULT_SHADOW_LAYER.color,
        inset,
        unit,
    };
};

const buildShadowValue = (layers) =>
    layers
        .map((layer) => {
            const unit = layer.unit || DEFAULT_SHADOW_LAYER.unit;
            const x = Number.isFinite(layer.x) ? layer.x : DEFAULT_SHADOW_LAYER.x;
            const y = Number.isFinite(layer.y) ? layer.y : DEFAULT_SHADOW_LAYER.y;
            const blur = Number.isFinite(layer.blur) ? layer.blur : DEFAULT_SHADOW_LAYER.blur;
            const spread = Number.isFinite(layer.spread)
                ? layer.spread
                : DEFAULT_SHADOW_LAYER.spread;
            const color = layer.color || DEFAULT_SHADOW_LAYER.color;
            const inset = layer.inset ? 'inset ' : '';
            return `${inset}${x}${unit} ${y}${unit} ${blur}${unit} ${spread}${unit} ${color}`;
        })
        .join(', ');

const parseUnitValue = (value, fallbackUnit = DEFAULT_SHADOW_LAYER.unit) => {
    if (value === undefined || value === null || value === '') {
        return { number: 0, unit: fallbackUnit };
    }

    const stringValue = String(value).trim();
    const match = stringValue.match(/^(-?\d+(?:\.\d+)?)([a-z%]+)?$/i);
    if (!match) {
        return { number: 0, unit: fallbackUnit };
    }

    const [, numberValue, unitValue] = match;
    return {
        number: parseFloat(numberValue),
        unit: unitValue || fallbackUnit,
    };
};

const splitShadowLayers = (value) => {
    if (!value || value === 'none') return EMPTY_ARRAY;

    const layers = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < value.length; i += 1) {
        const char = value[i];
        if (char === '(') depth += 1;
        if (char === ')') depth = Math.max(depth - 1, 0);

        if (char === ',' && depth === 0) {
            const trimmed = current.trim();
            if (trimmed) layers.push(trimmed);
            current = '';
            continue;
        }

        current += char;
    }

    const trimmed = current.trim();
    if (trimmed) layers.push(trimmed);

    return layers;
};

/**
 * Resolve a shadow value to a raw (parseable) string.
 * - var(--prop, fallback)  → extracts the fallback
 * - var(--prop)            → queries getComputedStyle
 * - anything else          → returned as-is
 */
const resolveToRawShadow = (val) => {
    if (!val || val === 'none') return val;
    if (!val.startsWith('var(')) return val;

    const firstComma = val.indexOf(',');
    const lastParen = val.lastIndexOf(')');

    // var(--prop, fallback) — extract fallback between first comma and closing paren
    if (firstComma !== -1 && lastParen > firstComma) {
        return val.slice(firstComma + 1, lastParen).trim();
    }

    // var(--prop) without fallback — try computed style
    const propMatch = val.match(/^var\(\s*(--[^,)]+)\s*\)$/);
    if (propMatch) {
        try {
            const computed = getComputedStyle(document.documentElement)
                .getPropertyValue(propMatch[1].trim())
                .trim();
            if (computed) return computed;
        } catch (e) { /* ignore */ }
    }

    return val;
};

const ShadowControl = ({
    value,
    onChange,
    label = __('Shadow', 'subtle-icons'),
    help = '',
    defaultValue,
}) => {
    const [shadowSettings] = useSettings('shadow');
    const shadowPresets = useShadowPresets({ shadow: shadowSettings });
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [viewMode, setViewMode] = useState('presets');
    const [shadowLayers, setShadowLayers] = useState(EMPTY_ARRAY);
    const [activeLayerIndex, setActiveLayerIndex] = useState(0);

    const togglePopover = () => {
        setIsPopoverVisible(!isPopoverVisible);
    };

    const applyShadow = (shadow) => {
        onChange(shadow);
        //setIsPopoverVisible(false);
    };

    // Memoize the processed shadow presets
    const processedShadowPresets = useMemo(() => {
        if (!shadowPresets || !shadowPresets.length) return EMPTY_ARRAY;
        return shadowPresets.map((preset) => {
            if (preset.slug === 'unset') {
                return {
                    ...preset,
                    shadow: 'none',
                };
            }

            return {
                ...preset,
                shadow: `var(--wp--preset--shadow--${preset.slug}, ${preset.shadow})`,
            };
        });
    }, [shadowPresets]);

    
    // Check if the value matches the pattern and update it to the proper preset value
    const updatedValue = useMemo(() => {
        const valToUse = value || defaultValue;
        if (!valToUse) return '';
        const pattern = /^var\(--wp--preset--shadow--(.+)\)$/;
        const match = valToUse.match(pattern);
        if (match) {
            const presetSlug = match[1];
            const preset = processedShadowPresets.find((preset) => preset.slug === presetSlug);
            if (preset) {
                return preset.shadow;
            }
        }
        return valToUse;
    }, [value, defaultValue, processedShadowPresets]);

    const isCustomShadowValue = useMemo(() => {
        const valToUse = value || defaultValue || '';
        if (!valToUse || valToUse === 'none') return false;
        if (/^var\(--wp--preset--shadow--(.+)\)$/.test(valToUse)) return false;
        return !processedShadowPresets.some((preset) => preset.shadow === valToUse);
    }, [value, defaultValue, processedShadowPresets]);

     // Memoize the orderedShadowPresets object
      const orderedShadowPresets = useMemo(() => {
        
        // Extract slug from defaultValue if possible
        let defaultSlug = null;
        if (defaultValue) {
            const match = defaultValue.match(/--wp--preset--shadow--([a-z0-9-]+)/);
            if (match) {
                defaultSlug = match[1];
            }
        }

        // Process presets to find and mark the default one
        const modifiedPresets = processedShadowPresets
            .filter((preset) => preset.slug !== 'unset')
            .map((preset) => {
                if (defaultSlug && preset.slug === defaultSlug) {
                    return {
                        ...preset,
                        name: `${preset.name} (${__('Default', 'subtle-icons')})`,
                        value: '' // When clicked, save empty string to use default
                    };
                }
                return preset;
            });

        const presets = [{
            name: __('None', 'subtle-icons'),
            slug: 'sbtl-none',
            shadow: 'none',
            value: 'none'
        }];

        return [
            ...presets,
            ...modifiedPresets,
        ];
    }, [processedShadowPresets, defaultValue]);  

    // Reset view mode and active layer only when the popover is opened.
    useEffect(() => {
        if (!isPopoverVisible) return;

        if (isCustomShadowValue) {
            const rawShadow = resolveToRawShadow(value || defaultValue || '');
            const parsed = rawShadow && rawShadow !== 'none'
                ? splitShadowLayers(rawShadow).map(parseShadowLayer)
                : [{ ...DEFAULT_SHADOW_LAYER }];
            setViewMode('custom');
            setShadowLayers(parsed);
        } else {
            setViewMode('presets');
            setShadowLayers(EMPTY_ARRAY);
        }
        setActiveLayerIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPopoverVisible]);

    // Re-sync layers when the value changes externally (e.g. preset applied),
    // but do NOT reset the active layer index so switching layers is stable.
    useEffect(() => {
        if (!isPopoverVisible) return;

        const valToUse = value || defaultValue || '';
        if (isCustomShadowValue) {
            setShadowLayers(splitShadowLayers(valToUse).map(parseShadowLayer));
        } else {
            setShadowLayers(EMPTY_ARRAY);
        }
    }, [isPopoverVisible, isCustomShadowValue, value, defaultValue]);

    const updateLayer = (index, patch) => {
        const baseLayers = shadowLayers.length ? shadowLayers : [{ ...DEFAULT_SHADOW_LAYER }];
        const nextLayers = baseLayers.map((layer, idx) =>
            idx === index ? { ...layer, ...patch } : layer
        );
        setShadowLayers(nextLayers);
        const nextShadow = buildShadowValue(nextLayers);
        applyShadow(nextShadow || 'none');
    };

    const addLayer = () => {
        const lastLayer = shadowLayers[shadowLayers.length - 1];
        const nextLayers = [
            ...shadowLayers,
            {
                ...DEFAULT_SHADOW_LAYER,
                unit: lastLayer?.unit || DEFAULT_SHADOW_LAYER.unit,
            },
        ];
        setShadowLayers(nextLayers);
        const nextShadow = buildShadowValue(nextLayers);
        applyShadow(nextShadow || 'none');
        setActiveLayerIndex(nextLayers.length - 1);
    };

    const removeLayer = (index) => {
        const nextLayers = shadowLayers.filter((_, idx) => idx !== index);
        setShadowLayers(nextLayers);
        const nextShadow = buildShadowValue(nextLayers);
        applyShadow(nextShadow || 'none');
        if (nextLayers.length === 0) {
            setActiveLayerIndex(0);
        } else if (activeLayerIndex >= nextLayers.length) {
            setActiveLayerIndex(nextLayers.length - 1);
        }
    };

    return (
        <>
            <div className="sbtl-shadow-popover-toggle components-grid components-tools-panel">
                <Button
                    __next40pxDefaultSize
                    icon={shadow}
                    size="compact" 
                    onClick={togglePopover}
                >
                    {label}
                </Button>
            </div>
            {isPopoverVisible && (
                <Popover className="sbtl-shadow-popover" position="center left" onClose={togglePopover}>
                    <BaseControl className="sbtl-shadow-popover--base" label={label} help={help}>
                        {viewMode === 'presets' && (
                            <>
                                <div className="shadow-presets block-editor-global-styles__shadow__list">
                                    { orderedShadowPresets.map((preset) => (
                                        <Tooltip text={preset.name} key={preset.slug}>
                                            <Button
                                                icon={updatedValue && updatedValue === preset.shadow ? check : undefined}
                                                onClick={() =>
                                                    applyShadow(
                                                        updatedValue && updatedValue === preset.shadow
                                                            ? ''
                                                            : preset.value !== undefined
                                                                ? preset.value
                                                                : preset.shadow
                                                    )
                                                }
                                                style={{
                                                    boxShadow: preset.preview || preset.shadow,
                                                }}
                                                className="block-editor-global-styles__shadow-indicator"
                                            >
                                            </Button>
                                        </Tooltip>
                                    )) }
                                </div>
                                <div className="sbtl-shadow-presets-btn-row">
                                    <Button
                                        size="small"
                                        variant="tertiary"
                                        onClick={() => {
                                            // Resolve preset vars / CSS vars to a raw shadow string,
                                            // then parse into layers to hydrate the builder.
                                            const rawShadow = resolveToRawShadow(updatedValue || value || defaultValue || '');
                                            const nextLayers = rawShadow && rawShadow !== 'none'
                                                ? splitShadowLayers(rawShadow).map(parseShadowLayer)
                                                : [{ ...DEFAULT_SHADOW_LAYER }];
                                            setShadowLayers(nextLayers);
                                            setActiveLayerIndex(0);
                                            setViewMode('custom');
                                        }}
                                    >
                                        {__('Add Custom', 'subtle-icons')}
                                    </Button>
                                    <Button 
                                        size="small"
                                        variant="secondary"
                                        onClick={() => applyShadow('')}
                                    >{__('Clear')}</Button>
                                </div>
                            </>
                        )}
                        {viewMode === 'custom' && (
                            <div className="sbtl-shadow-builder">
                                <Button
                                    size="small"
                                    variant="tertiary"
                                    icon={arrowLeft}
                                    className="sbtl-shadow-builder__btn"
                                    onClick={() => setViewMode('presets')}
                                >
                                    {__('Presets', 'subtle-icons')}
                                </Button>
                                <div className="sbtl-shadow-builder__layers">
                                    {(() => {
                                        const layers = shadowLayers.length
                                            ? shadowLayers
                                            : [{ ...DEFAULT_SHADOW_LAYER }];
                                        const safeActiveIndex = Math.min(
                                            Math.max(activeLayerIndex, 0),
                                            layers.length - 1
                                        );
                                        const layer = layers[safeActiveIndex] || { ...DEFAULT_SHADOW_LAYER };
                                        const canAddLayer = shadowLayers.length < 3;
                                        const morethanOneLayer = shadowLayers.length > 1;

                                        return (
                                            <>
                                                <div className="sbtl-shadow-builder__tabs">
                                                    {morethanOneLayer && (layers.map((_, index) => (
                                                        <Button
                                                            key={`shadow-layer-tab-${index}`}
                                                            size="small"
                                                            variant="tertiary"
                                                            className="sbtl-shadow-builder__btn"
                                                            isPressed={index === safeActiveIndex}
                                                            onClick={() => setActiveLayerIndex(index)}
                                                        >
                                                            {`${__('Layer', 'subtle-icons')} ${index + 1}`}
                                                        </Button>
                                                    )))}
                                                    {canAddLayer && (
                                                        <Button
                                                            size="small"
                                                            variant="tertiary"
                                                            className="sbtl-shadow-builder__btn margin-left-auto"
                                                            icon={plus}
                                                            disabled={!canAddLayer}
                                                            onClick={addLayer}
                                                        >
                                                            {__('Add layer', 'subtle-icons')}
                                                        </Button>
                                                    )}
                                                </div>
                                                {morethanOneLayer && (
                                                    <Button
                                                        size="small"
                                                        variant="tertiary"
                                                        className="margin-left-auto"
                                                        isDestructive
                                                        onClick={() => removeLayer(safeActiveIndex)}
                                                    >
                                                        {__('Remove Layer', 'subtle-icons')}
                                                    </Button>
                                                )}
                                                <div className="sbtl-shadow-builder__layer">
                                                    <div className="sbtl-shadow-builder__layer-color">
                                                        <ColorPalette
                                                            clearable={false}
                                                            enableAlpha
                                                            __experimentalIsRenderedInSidebar
                                                            value={layer.color}
                                                            onChange={(nextColor) =>
                                                                updateLayer(safeActiveIndex, { color: nextColor })
                                                            }
                                                        />
                                                    </div>
                                                    <br/>
                                                    <div className="sbtl-shadow-builder__layer-type">
                                                        <ToggleGroupControl
                                                            label={__('Shadow Type', 'subtle-icons')}
                                                            value={layer.inset ? 'inset' : 'outset'}
                                                            isBlock
                                                            hideLabelFromVision
                                                            __nextHasNoMarginBottom
                                                            __next40pxDefaultSize
                                                            onChange={(nextValue) =>
                                                                updateLayer(safeActiveIndex, { inset: nextValue === 'inset' })
                                                            }
                                                        >
                                                            <ToggleGroupControlOption
                                                                value="outset"
                                                                label={__('Outset', 'subtle-icons')}
                                                            />
                                                            <ToggleGroupControlOption
                                                                value="inset"
                                                                label={__('Inset', 'subtle-icons')}
                                                            />
                                                        </ToggleGroupControl>
                                                    </div>
                                                    <br/>
                                                    <Grid columns={2} gap={4} className="sbtl-shadow-builder__grid">
                                                        <div className="sbtl-shadow-builder__unit-control">
                                                            <UnitControl
                                                                label={__('X Position', 'subtle-icons')}
                                                                value={`${layer.x}${layer.unit}`}
                                                                onChange={(nextValue) => {
                                                                    const { number, unit } = parseUnitValue(nextValue, layer.unit);
                                                                    updateLayer(safeActiveIndex, { x: number, unit });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="sbtl-shadow-builder__unit-control">
                                                            <UnitControl
                                                                label={__('Y Position', 'subtle-icons')}
                                                                value={`${layer.y}${layer.unit}`}
                                                                onChange={(nextValue) => {
                                                                    const { number, unit } = parseUnitValue(nextValue, layer.unit);
                                                                    updateLayer(safeActiveIndex, { y: number, unit });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="sbtl-shadow-builder__unit-control">
                                                            <UnitControl
                                                                label={__('Blur', 'subtle-icons')}
                                                                value={`${layer.blur}${layer.unit}`}
                                                                onChange={(nextValue) => {
                                                                    const { number, unit } = parseUnitValue(nextValue, layer.unit);
                                                                    updateLayer(safeActiveIndex, { blur: number, unit });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="sbtl-shadow-builder__unit-control">
                                                            <UnitControl
                                                                label={__('Spread', 'subtle-icons')}
                                                                value={`${layer.spread}${layer.unit}`}
                                                                onChange={(nextValue) => {
                                                                    const { number, unit } = parseUnitValue(nextValue, layer.unit);
                                                                    updateLayer(safeActiveIndex, { spread: number, unit });
                                                                }}
                                                            />
                                                        </div>
                                                    </Grid>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                    </BaseControl>
                </Popover>
            )}
        </>
    );
};

export function useShadowPresets( settings ) {
	return useMemo( () => {
		if ( ! settings?.shadow ) {
			return EMPTY_ARRAY;
		}

		const defaultPresetsEnabled = settings?.shadow?.defaultPresets;
		const {
			default: defaultShadows,
			theme: themeShadows,
			custom: customShadows,
		} = settings?.shadow?.presets ?? {};
		const unsetShadow = {
			name: __( 'Unset' ),
			slug: 'unset',
			shadow: 'none',
		};

		const shadowPresets = [
			...( ( defaultPresetsEnabled && defaultShadows ) || EMPTY_ARRAY ),
			...( themeShadows || EMPTY_ARRAY ),
			...( customShadows || EMPTY_ARRAY ),
		];
		if ( shadowPresets.length ) {
			shadowPresets.unshift( unsetShadow );
		}

		return shadowPresets;
	}, [ settings ] );
}


export default ShadowControl;
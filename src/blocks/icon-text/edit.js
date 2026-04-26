import { __ } from "@wordpress/i18n";
import { createBlock } from "@wordpress/blocks";
import { useEffect, useState } from "@wordpress/element";
import {
  useBlockProps,
  RichText,
  InspectorControls,
  BlockControls,
  HeadingLevelDropdown,
  PanelColorSettings,
  __experimentalUseBorderProps as useBorderProps,
} from "@wordpress/block-editor";

import {
  PanelBody,
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
  __experimentalToolsPanel as ToolsPanel,
  __experimentalToolsPanelItem as ToolsPanelItem,
  ToggleControl,
} from "@wordpress/components";

import { IconPickerTrigger, IconPickerPreview } from "../../components/IconPicker";
import IconPickerModal from "../../components/IconPicker/IconPickerModal";
import useIconAutoResolve from "../../components/IconPicker/useIconAutoResolve";
import IconOptionsPanel from "../../components/IconOptionsPanel";
import LinkControl from "../../components/LinkControl";
import ShadowControl from "../../components/ShadowControl";
import InlineLinksConflictNotice from "../../components/InlineLinksConflictNotice";
import { hasInlineAnchors, removeInlineAnchors } from "../../utils/inline-links";

import "./style.scss";

const TAG_MAP = {
  0: "p",
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
};

const NEW_TAB_REL = "noreferrer noopener";
const NOFOLLOW_REL = "nofollow";

function getUpdatedLinkAttributes({ rel = "", url = "", opensInNewTab, nofollow }) {
  let newLinkTarget;
  let updatedRel = rel;

  if (opensInNewTab) {
    newLinkTarget = "_blank";
    updatedRel = updatedRel?.includes(NEW_TAB_REL)
      ? updatedRel
      : `${updatedRel} ${NEW_TAB_REL}`.trim();
  } else {
    updatedRel = updatedRel
      ?.replace(new RegExp(`\\b${NEW_TAB_REL}\\s*`, "g"), "")
      .trim();
  }

  if (nofollow) {
    updatedRel = updatedRel?.includes(NOFOLLOW_REL)
      ? updatedRel
      : `${updatedRel} ${NOFOLLOW_REL}`.trim();
  } else {
    updatedRel = updatedRel
      ?.replace(new RegExp(`\\b${NOFOLLOW_REL}\\s*`, "g"), "")
      .trim();
  }

  return {
    url,
    linkTarget: newLinkTarget,
    rel: updatedRel || undefined,
  };
}

export default function Edit({ attributes, setAttributes, onReplace, isSelected }) {
  const {
    content,
    level,
    icon,
    iconSlug,
    iconOptions,
    iconPosition,
    iconColor,
    url,
    linkTarget,
    rel,
    placeholder,
    shadow,
    disabledDefaultIcon,
  } = attributes;
  const opensInNewTab = linkTarget === "_blank";
  const nofollow = !!rel?.includes(NOFOLLOW_REL);
  const borderProps = useBorderProps(attributes);
  const [ isIconModalOpen, setIsIconModalOpen ] = useState( false );

  useIconAutoResolve(
    icon,
    ( svg ) => setAttributes( { icon: svg } ),
    ( slug ) => setAttributes( { iconSlug: slug } )
  );

  const TagName = TAG_MAP[level] || "p";
  const RegionTagName = url ? "a" : "span";
  const isHorizontal = iconPosition !== "top";
  const hasInlineContentLinks = !url && hasInlineAnchors( content );

  useEffect( () => {
    if ( ! icon && ! disabledDefaultIcon && window.sbtl_icon_text_icons?.info ) {
      setAttributes( { icon: window.sbtl_icon_text_icons.info } );
    }
  }, [ icon, disabledDefaultIcon ] );

  const handleIconChange = ( newIcon ) => {
    if ( ! newIcon ) {
      setAttributes( { icon: '', iconSlug: '', disabledDefaultIcon: true } );
    } else {
      setAttributes( { icon: newIcon, disabledDefaultIcon: true } );
    }
  };

  const handleIconSlugChange = ( slug ) => setAttributes( { iconSlug: slug } );

  const setIconOption = (partial) =>
    setAttributes({
      iconOptions: { ...iconOptions, ...partial },
    });

  const resetIconOptions = () => setAttributes({ iconOptions: {} });
  const onSplit = ( value = '', isOriginal ) => {
    if ( isOriginal ) {
      return createBlock( 'sbtl/icon-text', {
        ...attributes,
        content: value,
      } );
    }

    return createBlock( 'core/paragraph', {
      content: value,
    } );
  };

  const onRemove = () => {
    if ( icon ) {
      return;
    }

    onReplace( [] );
  };

  const blockProps = useBlockProps({
    className: [
      "sbtl-icon-text",
      level > 0 ? "wp-block-heading" : "",
      borderProps.className,
      `has-icon-position-${iconPosition || "left"}`,
      iconOptions?.stroke ? "has-icon-stroke" : ""
    ]
      .filter(Boolean)
      .join(" "),
    style: {
      ...borderProps.style,
      ...(shadow ? { boxShadow: shadow } : {}),
      ...(iconColor ? { "--sbtl-icon-color": iconColor } : {}),
      ...(iconOptions?.size
        ? { "--sbtl-icon-size": iconOptions.size }
        : {}),
      ...(iconOptions?.gap
        ? { "--sbtl-icon-gap": iconOptions.gap }
        : {}),
      ...(iconOptions?.stroke
        ? {
            "--sbtl-icon-stroke": iconOptions.stroke,
          }
        : {}),
      ...(iconOptions?.align ? { "--sbtl-icon-align": iconOptions.align } : {}),
    }
  });

  return (
    <>
      <BlockControls group="block">
        <HeadingLevelDropdown
          options={[0, 1, 2, 3, 4, 5, 6]}
          value={level}
          onChange={(value) => setAttributes({ level: value })}
        />
      </BlockControls>

      <InspectorControls>
        <PanelBody title={__("Icon", "subtle-icons")} initialOpen>
          <IconPickerTrigger
            label={__("Icon", "subtle-icons")}
            value={icon}
            onOpen={ () => setIsIconModalOpen( true ) }
            onClear={ () => handleIconChange( '' ) }
          />
          <ToggleGroupControl
            label={__("Position", "subtle-icons")}
            value={iconPosition || "left"}
            isBlock
            __next40pxDefaultSize
            onChange={(value) =>
              setAttributes({ iconPosition: value || "left" })
            }
          >
            <ToggleGroupControlOption
              value="left"
              label={__("Left", "subtle-icons")}
            />
            <ToggleGroupControlOption
              value="top"
              label={__("Top", "subtle-icons")}
            />
            <ToggleGroupControlOption
              value="right"
              label={__("Right", "subtle-icons")}
            />
          </ToggleGroupControl>
        </PanelBody>

        <PanelBody title={__("Link", "subtle-icons")} initialOpen={true}>
            <LinkControl
                label={__("Link", "subtle-icons")}
                value={url}
                help={!url ? __("Make the icon and text a single clickable link.", "subtle-icons") : undefined }
                onChange={(value) => {
                  const nextAttributes = { url: value };

                  if ( value && hasInlineAnchors( content ) ) {
                    nextAttributes.content = removeInlineAnchors( content );
                  }

                  setAttributes( nextAttributes );
                }}
                searchInputPlaceholder={__("Search or type URL", "subtle-icons")}
                buttonLabel={__("Edit Link", "subtle-icons")}
                popoverContent={hasInlineContentLinks ? ({ showDefaultContent, closePopover }) => (
                  <InlineLinksConflictNotice
                    content={content}
                    showDefaultContent={showDefaultContent}
                    closePopover={closePopover}
                    onPromote={(attrs) => setAttributes(attrs)}
                  />
                ) : undefined}
            />
            {url && (
                <>
                <ToggleControl
                    label={__("Open in new tab", "subtle-icons")}
                    checked={opensInNewTab}
                    onChange={(value) =>
                    setAttributes(
                      getUpdatedLinkAttributes({
                        rel,
                        url,
                        opensInNewTab: value,
                        nofollow,
                      })
                    )
                    }
                />
                <ToggleControl
                    label={__("Mark as nofollow", "subtle-icons")}
                    checked={nofollow}
                    onChange={(value) =>
                    setAttributes(
                      getUpdatedLinkAttributes({
                        rel,
                        url,
                        opensInNewTab,
                        nofollow: value,
                      })
                    )
                    }
                />
                </>
            )}
            </PanelBody>

        <IconOptionsPanel
          iconOptions={ iconOptions }
          onChange={ setIconOption }
          onResetAll={ resetIconOptions }
          isHorizontal={ isHorizontal }
        />
      </InspectorControls>

      <InspectorControls group="color">
        <PanelColorSettings
          title={__("Icon Color", "subtle-icons")}
          className="sbtl-minimal-color-panel"
          colorSettings={[
            {
              value: iconColor,
              onChange: ( value ) =>
                setAttributes( { iconColor: value || '' } ),
              label: __("Icon", "subtle-icons"),
              clearable: true,
            },
          ]}
        />
      </InspectorControls>

      <InspectorControls group="styles">
        <ToolsPanel
          label={__("Shadow", "subtle-icons")}
          resetAll={() => setAttributes({ shadow: undefined })}
        >
          <ToolsPanelItem
            label={__("Shadow", "subtle-icons")}
            hasValue={() => !!shadow}
            onDeselect={() => setAttributes({ shadow: undefined })}
            isShownByDefault={false}
          >
            <ShadowControl
              label={__("Shadow", "subtle-icons")}
              ariaLabel={__("Icon text shadow", "subtle-icons")}
              value={shadow}
              onChange={(value) => setAttributes({ shadow: value || undefined })}
            />
          </ToolsPanelItem>
        </ToolsPanel>

      </InspectorControls>

      <TagName {...blockProps}>
        <RegionTagName className="sbtl-icon-region" href={url ? '#' : undefined} target={url ? linkTarget || undefined : undefined} rel={(url && rel) ? rel : undefined} onClick ={url ? (e) => { e.preventDefault(); } : undefined}>
          <IconPickerPreview
            value={ icon }
            onOpen={ () => setIsIconModalOpen( true ) }
            showPlaceholder={ isSelected }
          />
          <RichText
            tagName="span"
            identifier="content"
            className="sbtl-icon-text__content"
            placeholder={placeholder || __("Write text…", "subtle-icons")}
            value={content}
            onChange={(value) => setAttributes({ content: value })}
            onSplit={onSplit}
            onReplace={onReplace}
            onRemove={onRemove}
            allowedFormats={
              url
                ? ["core/bold", "core/italic"]
                : [
                    "core/bold",
                    "core/italic",
                    "core/link",
                  ]
            }
          />
        </RegionTagName>
        </TagName>
      <IconPickerModal
        isOpen={ isIconModalOpen }
        onClose={ () => setIsIconModalOpen( false ) }
        initialValue={ icon }
        initialSlug={ iconSlug }
        onSelect={ ( svg ) => { handleIconChange( svg ); setIsIconModalOpen( false ); } }
        onSelectSlug={ handleIconSlugChange }
      />
    </>
  );
}
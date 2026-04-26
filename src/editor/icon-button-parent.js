wp.hooks.addFilter(
  "blocks.registerBlockType",
  "sbtl/extend-buttons-allowed",
  (settings, name) => {
    if (name === "core/buttons") {
      settings.allowedBlocks = [
        ...(settings.allowedBlocks || []),
        "sbtl/icon-button",
      ];
    }
    return settings;
  }
);
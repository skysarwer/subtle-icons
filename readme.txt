=== Subtle Icons ===
Contributors:      evanworks
Tags:              icons, block-editor, gutenberg, acf, svg
Requires at least: 6.5
Tested up to:      6.9
Requires PHP:      7.4
Stable tag:        1.0.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A breathtakingly simple icon ecosystem for WordPress. 100,000+ icons. Zero bloat. Native UI.

== Description ==

Subtle Icons is a bloat-free, lightweight plugin that brings thousands of icons directly into the WordPress block editor and Advanced Custom Fields (ACF).
Search and insert icons from Lucide, Material, Heroicons, and dozens of other icon libraries without leaving the editor — or upload your own SVGs.

### Features
*   **Icon Block:** A standalone icon block with sizing, thickness, and color controls.
*   **Icon + Text Block:** Pair an icon with text for notices, callouts, and feature highlights.
*   **Icon List Block:** Build beautiful, responsive lists with custom leading icons.
*   **Icon Button Block:** Prompt visitors to take action with a native-feeling button block supporting leading and trailing icons.
*   **ACF Field Integration:** A custom Icon Picker field type for Advanced Custom Fields.
*   **Iconify Integration:** Powered by the massive open-source Iconify ecosystem.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/subtle-icons` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Open the Block Editor and search for "Icon" to start using the blocks.

== Frequently Asked Questions ==

= Does this require Advanced Custom Fields? =
No! The custom blocks work perfectly out of the box. The ACF field is just a bonus for developers who want to integrate icons into custom meta boxes.

= Are the icons loaded locally or remotely? =
The Icon Picker connects to Iconify via a proxy API to search icons, but the SVG code is embedded directly into your content. No third-party frontend assets are loaded on your live site.

= How are the SVGs sanitized against malicious code? =
Every icon is cleaned up twice before it ever touches your database — once in the browser the moment an icon is chosen, and again on the server when the post is saved. Both passes use strict allowlists that permit only the elements a real icon needs. Anything that could execute code or load an external resource is removed automatically, regardless of where the SVG came from.

The icon search itself only works for logged-in users who can already edit posts, so the feature is not exposed to the public.

== Screenshots ==

1. The Icon Picker interface natively integrated into the Icon Button block. 

== Changelog ==
= 1.0.0 =
* Initial release of Subtle Icons.

== Development ==

Source code and build tools are available at https://github.com/skysarwer/subtle-icons.
Review the repository's `README.md` for more information.
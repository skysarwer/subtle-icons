=== Subtle Icons ===
Contributors:      evanworks
Tags:              icons, block-editor, gutenberg, acf, svg
Requires at least: 6.5
Tested up to:      6.9
Requires PHP:      7.4
Stable tag:        1.0.2
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
= 1.0.2 =
* Initial release of Subtle Icons.

== Development ==

The complete source code for this plugin, including all uncompiled JavaScript and CSS, is publicly available at:

https://github.com/skysarwer/subtle-icons

Build requirements: Node.js and npm.

To build from source:

1. Clone the repository: `git clone https://github.com/skysarwer/subtle-icons`
2. Install dependencies: `npm install`
3. Compile assets for production: `npm run build`
4. Or start a development watcher: `npm start`

== External Services ==

This plugin connects to the Iconify API to power the icon search and picker interface. The API is only contacted from within the WordPress admin area when a logged-in user with post-editing capabilities is using the Icon Picker — it is never called on the public-facing frontend.

**Iconify API**

Used to search the Iconify icon registry and to retrieve individual SVG files. The following data is sent:
* Icon search queries (the keyword string typed by the editor).
* Icon set prefix and icon name when fetching a specific SVG.

No personally identifiable information is transmitted. Requests are made only when the Icon Picker is actively used by an authenticated user.

All icon search, browse, and individual SVG selection requests are made server-to-server: the editor's browser calls a WordPress REST endpoint on your own server, which then forwards the query to Iconify. Only your server's IP address is visible to Iconify for these requests.

Icon preview thumbnails displayed in the browsable grid are loaded directly from the editor's browser by the bundled `@iconify/react` library. The editor's IP address and standard browser headers are sent with these thumbnail requests.

Primary endpoint: `https://api.iconify.design`
Fallback endpoints (provided by the bundled `@iconify/react` library): `https://api.simplesvg.com`, `https://api.unisvg.com`

All three endpoints are operated by the Iconify project.

* Terms of use / API documentation: https://iconify.design/docs/api/
* Privacy policy: https://iconify.design/privacy/
* Service website: https://iconify.design/
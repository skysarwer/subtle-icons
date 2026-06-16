=== Subtle Icons - SVG Icon Block Suite, Icon Picker & ACF Field ===
Contributors:      evanworks
Tags:              icon, gutenberg, icon block, icon picker, acf
Requires at least: 6.5
Tested up to:      7.0
Requires PHP:      7.4
Stable tag:        1.1.1
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Add 100k+ SVG icons (Lucide, Material, FontAwesome) directly to Gutenberg blocks and Advanced Custom Fields. A native, zero-bloat icon picker.

== Description ==

[Subtle Icons](https://subtleblocks.com/icons) is a lightweight plugin that brings thousands of icons directly into the WordPress block editor and Advanced Custom Fields (ACF).

Stop enqueuing heavy FontAwesome stylesheets. Subtle Icons generates clean, inline SVG code natively in the editor, keeping your frontend free of external scripts and font files.

### The Ultimate WordPress Icon Picker
Powered by the massive [Iconify](https://icon-sets.iconify.design/) ecosystem, easily search and insert icons from dozens of popular open-source libraries without leaving the WordPress editor. Supported libraries include:

* Lucide Icons
* Material Design Icons
* Heroicons
* FontAwesome
* Bootstrap Icons
* Phosphor Icons
* ...and dozens more, or upload your own custom SVGs!

### Four Native Gutenberg Icon Blocks
* **Icon Button Block:** Prompt visitors to take action with a native-feeling button block supporting leading and trailing icons.
* **Icon List Block:** Create clean lists with icons that match your theme and improve scanability.
* **Icon + Text Block:** Pair an icon with text for notices, callouts, and feature highlights.
* **Icon Block:** A standalone SVG icon block with sizing, thickness, and color controls.

### Advanced Custom Fields (ACF) Integration
Bring icons to your structured content. Subtle Icons adds a fully integrated Icon Picker field to ACF. Add icons to taxonomies, repeaters, options pages, and custom blocks seamlessly.

### Built for Developers & Custom Integrations
Take full control of the icon workflow. Use our lightweight filters and actions to tailor the experience for your clients and custom builds.

* Filter or restrict available icon collections
* Configure default block icons globally
* Robust developer documentation and more extensibility coming soon!

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/subtle-icons` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Open the Block Editor and search for "Icon" to start using the blocks.

== Frequently Asked Questions ==

= Does this require Advanced Custom Fields? =
No! The custom blocks work perfectly out of the box. The ACF field is just a bonus for developers who want to integrate icons into custom meta boxes.

= Are the icons loaded locally or remotely? =
The Icon Picker connects to Iconify via a proxy API to search icons, but the SVG code is embedded directly into your content. No third-party frontend assets are loaded on your live site.

= How is data sent to Iconify? = 
The Iconify API is called only in the WordPress admin and used for icon search and discovery. There are two key points of contact:

* **Server-to-Server (Proxy):** Search queries (keywords) and icon retrievals (set prefix and icon name) are routed through a REST endpoint on your WordPress server. Iconify only sees your server's IP address for these requests.
* **Direct from Browser:** Icon preview thumbnails in the search grid are loaded directly from the editor's browser (via the @iconify/react library). The editor's IP address and standard browser headers are visible to Iconify for these image requests.

**API Endpoints (all operated by the Iconify project):**

* **Primary:** [api.iconify.design](https://api.iconify.design)
* **Fallbacks:** [api.simplesvg.com](https://api.simplesvg.com), [api.unisvg.com](https://api.unisvg.com)

**Iconify Policies & Links:**

* [API documentation](https://iconify.design/docs/api/)
* [Privacy policy](https://iconify.design/privacy/)


= How are the SVGs sanitized against malicious code? =
Every icon is cleaned up twice before it ever touches your database — once in the browser the moment an icon is chosen, and again on the server when the post is saved. Both passes use strict allowlists that permit only the elements a real icon needs. Anything that could execute code or load an external resource is removed automatically, regardless of where the SVG came from.

The icon search itself only works for logged-in users who can already edit posts, so the feature is not exposed to the public.

== Screenshots ==

1. The Icon Picker interface natively integrated into the Icon Button block.
2. The ACF Icon Picker being used for a custom Subjects taxonomy.

== Changelog ==
= 1.2.0 = 
* Icon Collection filter added to the Icon Picker
* Improved keyboard accessibility for the Icon Picker
= 1.1.1 = 
* Fix Icon + Text alignment bug 
= 1.1.0 = 
* Improve Icon List `enter` key UX and other minor editor improvements
* Support for wrapping `<span>` tags on icons 
= 1.0.7 = 
* Test up to WP 7.0, update readme and plugin assets
= 1.0.2 =
* Initial release of Subtle Icons.

== Development ==

The complete source code for this plugin, including all uncompiled JavaScript and CSS, is available at this [public GitHub repo](https://github.com/skysarwer/subtle-icons).

Build requirements: Node.js and npm.

To build from source:

1. Clone the repository: `git clone https://github.com/skysarwer/subtle-icons`
2. Install dependencies: `npm install`
3. Compile assets for production: `npm run build`
4. Or start a development watcher: `npm start`

== External Services ==

This plugin uses the [Iconify](https://iconify.design/) API to power the Icon Picker. The API is never called on the public frontend; it only runs in the WordPress admin when actively used by a logged-in user with post-editing capabilities. No personally identifiable information (PII) is transmitted.

For more details, see ["How is data sent to Iconify"](#how%20is%20data%20sent%20to%20iconify) in our FAQs. 
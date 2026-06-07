# Subtle Icons

A lightweight icon ecosystem for WordPress, powered by Iconify.

## Description

Subtle Icons is a bloat-free, lightweight plugin that brings thousands of icons directly into the WordPress block editor and Advanced Custom Fields (ACF).
Search and insert icons from Lucide, Material, Heroicons, and dozens of other icon libraries without leaving the editor — or upload your own SVGs.

### Features
*   **Icon Block:** A standalone icon block with sizing, thickness, and color controls.
*   **Icon + Text Block:** Pair an icon with text for notices, callouts, and feature highlights.
*   **Icon List Block:** Build beautiful, responsive lists with custom leading icons.
*   **Icon Button Block:** Prompt visitors to take action with a native-feeling button block supporting leading and trailing icons.
*   **ACF Field Integration:** A custom Icon Picker field type for Advanced Custom Fields.
*   **Iconify Integration:** Powered by the massive open-source Iconify ecosystem.

## Requirements

- WordPress 6.5+
- PHP 7.4+
- Node.js (for development)

## Testing

### Setup

```bash
npm install
```

### Build

Build for production:

```bash
npm run build
```

Start the development watcher:

```bash
npm start
```

### Other Scripts

| Command | Description |
|---|---|
| `npm run format` | Auto-format source files |
| `npm run lint:js` | Lint JavaScript |
| `npm run lint:css` | Lint CSS/SCSS |
| `npm run lint:php` | Lint PHP (via Composer PHP CodeSniffer) |
| `npm run plugin-zip` | Package the plugin as a ZIP |

## Project Structure

```
subtle-icons/
├── src/             # Source files
│   ├── acf/         # ACF Field react component
│   ├── blocks/      # Individual block directories
│   ├── components/  # Shared React components
│   ├── editor/      # Editor-side entry point
│   ├── hooks/       # Shared hooks
│   ├── sass/        # Global styles
│   └── utils/       # Utility helpers
├── build/           # Compiled output
├── inc/             # PHP includes (enqueue, ACF, REST)
└── subtle-icons.php
```

## License

GPL-2.0-or-later — see [GNU GPL v2.0](https://www.gnu.org/licenses/gpl-2.0.html).
# Subtle Icons

A collection of custom Gutenberg blocks for WordPress by [Evan Buckiewicz](https://evan.works).

## Description

Subtle Icons provides a set of custom block types for the WordPress block editor (Gutenberg), built using the `@wordpress/scripts` toolchain.

## Requirements

- WordPress 5.8+
- PHP 7.0+
- Node.js (for development)

## Development

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
| `npm run plugin-zip` | Package the plugin as a ZIP |

## Project Structure

```
subtle-blocks/
├── src/             # Block source files
│   ├── blocks/      # Individual block directories
│   ├── components/  # Shared React components
│   ├── editor/      # Editor-side entry point
│   ├── hooks/       # Shared hooks
│   ├── sass/        # Global styles
│   └── utils/       # Utility helpers
├── build/           # Compiled output (do not edit)
├── inc/             # PHP includes (enqueue, ACF, REST)
└── subtle-icons.php
```

## License

GPL-2.0-or-later — see [GNU GPL v2.0](https://www.gnu.org/licenses/gpl-2.0.html).
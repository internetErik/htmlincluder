# HTML Includer Refactoring Summary

## Overview

This refactoring introduces a clean separation between the HTML includer core logic and the Gulp plugin interface, allowing the tool to run independently from a configuration file.

## Architecture Changes

### New File Structure

```
htmlincluder/
├── src/
│   ├── core.mjs              # Core processing API (new)
│   ├── config-loader.mjs     # Configuration file loader (new)
│   ├── cli.mjs               # Command-line interface (new)
│   ├── config.mjs            # Existing configuration module
│   ├── parse.mjs             # Existing parsing logic
│   └── index.mjs             # Existing entry point
├── htmlincluder.mjs          # New ESM entry point
├── index.js                  # Existing Gulp plugin (unchanged)
├── htmlincluder.config.mjs   # Example configuration
└── docs/
    └── STANDALONE.md         # Standalone usage documentation
```

### Key Components

#### 1. Core API (`src/core.mjs`)

The core API provides three main functions that work independently of Gulp:

- **`processDirectory(config)`** - Process all HTML files in a directory
- **`processSingleFile(filePath, options)`** - Process a single file
- **`processContent(content, context)`** - Process HTML content directly
- **`loadDependencies(baseDir, options)`** - Pre-load include/wrap files
- **`reset()`** - Clear internal state

These functions handle:
- File discovery
- File categorization (page/insert/wrap files)
- Processing with the existing parse logic
- Output to destination directory

#### 2. Configuration Loader (`src/config-loader.mjs`)

Manages configuration files with support for:

- **Multiple formats**: `.mjs`, `.js`, `.json`
- **Auto-discovery**: Searches for common config file names
- **Validation**: Ensures configuration is valid
- **Defaults**: Provides sensible defaults
- **Merging**: Combines user config with defaults

Supported config file names:
- `htmlincluder.config.mjs`
- `htmlincluder.config.js`
- `htmlincluder.config.json`
- `.htmlincluderrc.json`
- `.htmlincluderrc.js`

#### 3. CLI (`src/cli.mjs`)

Command-line interface using `commander` for:

**Commands:**
- `htmlincluder build` - Build HTML files
- `htmlincluder init` - Create default config
- `htmlincluder process <file>` - Process single file

**Options:**
- `--config <path>` - Specify config file
- `--src <path>` - Override source directory
- `--dest <path>` - Override destination directory
- `--watch` - Watch for changes and rebuild
- `--output <path>` - Output path for single file

#### 4. Unified Entry Point (`htmlincluder.mjs`)

New ESM entry point that exports:

- **Default export**: Gulp plugin (backward compatibility)
- **Named exports**: Core API functions
- **Named exports**: Configuration utilities

This allows users to choose:
```javascript
// Gulp plugin (existing usage)
import htmlincluder from 'gulp-htmlincluder';

// Core API
import { processDirectory } from 'gulp-htmlincluder/core';

// Configuration
import { loadConfig } from 'gulp-htmlincluder/config';
```

## Usage Examples

### Standalone CLI

```bash
# Initialize configuration
npx htmlincluder init

# Build files
npx htmlincluder build

# Build with custom paths
npx htmlincluder build --src ./source --dest ./output

# Watch mode
npx htmlincluder build --watch

# Process single file
npx htmlincluder process src/index.html --output dist/index.html
```

### Programmatic API

```javascript
import { processDirectory } from 'gulp-htmlincluder/core';

const results = await processDirectory({
  srcDir: './src',
  destDir: './dist',
  options: {
    jsonInput: { site: { title: 'My Site' } }
  }
});
```

### Gulp Plugin (Unchanged)

```javascript
const htmlincluder = require('gulp-htmlincluder');

gulp.task('html', () => {
  return gulp.src('./src/**/*.html')
    .pipe(htmlincluder({ jsonInput: {} }))
    .pipe(gulp.dest('./dist'));
});
```

## Configuration File

### JavaScript Configuration

```javascript
// htmlincluder.config.mjs
export default {
  srcDir: './src',
  destDir: './dist',
  options: {
    jsonInput: {
      site: { title: 'My Website' }
    },
    rawJsonPlugins: {
      fetch: fetch,
      myHelper: () => { /* ... */ }
    }
  }
};
```

### JSON Configuration

```json
{
  "srcDir": "./src",
  "destDir": "./dist",
  "options": {
    "jsonInput": {
      "site": { "title": "My Website" }
    }
  }
}
```

## Backward Compatibility

✅ **Complete backward compatibility maintained:**

- Gulp plugin interface unchanged
- Existing `index.js` entry point preserved
- All existing options supported
- No breaking changes to existing projects

## Benefits

1. **Flexibility**: Use with or without Gulp
2. **Simplicity**: Run with a simple CLI command
3. **Configuration**: Centralized config file
4. **Watch Mode**: Built-in file watching
5. **Programmatic**: Use in custom build scripts
6. **Migration Path**: Easy to migrate from Gulp if needed

## Dependencies Added

- `commander`: ^11.0.0 - CLI framework
- `chokidar`: ^3.5.3 - File watching

## Package.json Changes

```json
{
  "main": "./index.js",
  "module": "./htmlincluder.mjs",
  "bin": {
    "htmlincluder": "./src/cli.mjs"
  },
  "exports": {
    ".": {
      "require": "./index.js",
      "import": "./htmlincluder.mjs"
    },
    "./core": {
      "import": "./src/core.mjs"
    },
    "./config": {
      "import": "./src/config-loader.mjs"
    }
  }
}
```

## Testing the Changes

To test the new functionality:

```bash
# Install dependencies
npm install

# Initialize configuration
npx htmlincluder init

# Build existing test files
npx htmlincluder build --src ./test/html --dest ./test/output

# Watch mode
npx htmlincluder build --watch
```

## Next Steps

1. **Install new dependencies**: `npm install`
2. **Test CLI**: Try `npx htmlincluder init` and `npx htmlincluder build`
3. **Review configuration**: Check `htmlincluder.config.example.mjs`
4. **Read documentation**: See `docs/STANDALONE.md`
5. **Update README**: Main README now includes standalone info

## Migration Guide

For existing Gulp users who want to try standalone mode:

1. Keep your Gulp setup (nothing breaks)
2. Run `npx htmlincluder init` to create a config file
3. Try `npx htmlincluder build` to test standalone mode
4. Gradually transition if you like the new approach

No immediate action required - the Gulp plugin works exactly as before!

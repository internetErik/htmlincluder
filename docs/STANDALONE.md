# HTML Includer - Standalone Usage

This guide explains how to use HTML Includer without Gulp, either via the CLI or programmatically.

## Installation

```bash
npm install --save-dev gulp-htmlincluder
```

## CLI Usage

### Initialize Configuration

Create a default configuration file:

```bash
npx htmlincluder init
```

This creates `htmlincluder.config.mjs` in your current directory.

For JSON format:
```bash
npx htmlincluder init --format json
```

### Build Files

Process all HTML files according to your configuration:

```bash
npx htmlincluder build
```

Specify custom source and destination:
```bash
npx htmlincluder build --src ./source --dest ./output
```

Use a specific configuration file:
```bash
npx htmlincluder build --config ./my-config.mjs
```

### Watch Mode

Automatically rebuild when files change:

```bash
npx htmlincluder build --watch
```

### Process Single File

Process a single HTML file:

```bash
npx htmlincluder process src/index.html --output dist/index.html
```

Or output to stdout:
```bash
npx htmlincluder process src/index.html
```

## Programmatic Usage

### Process a Directory

```javascript
import { processDirectory } from 'gulp-htmlincluder/core';

const config = {
  srcDir: './src',
  destDir: './dist',
  options: {
    jsonInput: {
      site: {
        title: 'My Website',
        description: 'Built with HTML Includer'
      }
    }
  }
};

const results = await processDirectory(config);
console.log(`Processed ${results.length} files`);
```

### Process a Single File

```javascript
import { processSingleFile } from 'gulp-htmlincluder/core';

const result = await processSingleFile('./src/index.html', {
  jsonInput: { /* ... */ }
});

console.log(result.content); // Processed HTML
```

### Process Content String

```javascript
import { processContent } from 'gulp-htmlincluder/core';

const html = `
  <html>
    <body>
      <!--#insert path="./header.html" -->
    </body>
  </html>
`;

const processed = await processContent(html, {
  basePath: './src',
  options: { /* ... */ }
});
```

### Load Configuration

```javascript
import { loadConfig, findConfig } from 'gulp-htmlincluder/config';

// Find config automatically
const configPath = await findConfig();
const config = await loadConfig(configPath);

// Or load specific file
const config = await loadConfig('./my-config.mjs');
```

## Configuration File

The configuration file can be JavaScript (`.mjs`, `.js`) or JSON (`.json`).

### JavaScript Configuration (Recommended)

**htmlincluder.config.mjs:**

```javascript
export default {
  srcDir: './src',
  destDir: './dist',
  options: {
    jsonInput: {
      site: {
        title: 'My Site',
        url: 'https://example.com'
      }
    },
    rawJsonPlugins: {
      fetch: fetch,
      myHelper: () => { /* ... */ }
    }
  }
};
```

### JSON Configuration

**htmlincluder.config.json:**

```json
{
  "srcDir": "./src",
  "destDir": "./dist",
  "options": {
    "jsonInput": {
      "site": {
        "title": "My Site"
      }
    }
  }
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `srcDir` | string | `'./src'` | Source directory |
| `destDir` | string | `'./dist'` | Destination directory |
| `options.jsonInput` | object | `{}` | JSON data for templates |
| `options.insertPattern` | string | `null` | Custom insert pattern |
| `options.filePathAttribute` | string | `'path'` | File path attribute name |
| `options.jsonPathAttribute` | string | `'jsonPath'` | JSON path attribute name |
| `options.rawJsonPlugins` | object | `{}` | Functions for rawJson |
| `files` | array | `null` | Specific files to process |
| `watch` | boolean | `false` | Watch mode |

## Integration with Build Tools

### npm scripts

**package.json:**

```json
{
  "scripts": {
    "build": "htmlincluder build",
    "watch": "htmlincluder build --watch",
    "build:prod": "htmlincluder build --src ./src --dest ./public"
  }
}
```

### Custom Build Script

**build.mjs:**

```javascript
import { processDirectory } from 'gulp-htmlincluder/core';
import { loadConfig } from 'gulp-htmlincluder/config';

async function build() {
  const config = await loadConfig('./htmlincluder.config.mjs');
  
  // Add dynamic data
  config.options.jsonInput.buildTime = new Date().toISOString();
  
  const results = await processDirectory(config);
  
  console.log(`Built ${results.length} pages`);
}

build().catch(console.error);
```

Run with: `node build.mjs`

## Migration from Gulp

If you're currently using the Gulp plugin, you can gradually migrate:

1. **Keep using Gulp** - The plugin interface hasn't changed
2. **Try the CLI** - Run `npx htmlincluder build` to test standalone mode
3. **Create config file** - Run `npx htmlincluder init` to create a config
4. **Update build scripts** - Replace gulp tasks with CLI commands or programmatic usage

### Example: Before (Gulp)

```javascript
const gulp = require('gulp');
const htmlincluder = require('gulp-htmlincluder');

gulp.task('html', () => {
  return gulp.src('./src/**/*.html')
    .pipe(htmlincluder({
      jsonInput: require('./data.json')
    }))
    .pipe(gulp.dest('./dist'));
});
```

### Example: After (Standalone)

**htmlincluder.config.mjs:**

```javascript
import data from './data.json' assert { type: 'json' };

export default {
  srcDir: './src',
  destDir: './dist',
  options: {
    jsonInput: data
  }
};
```

**package.json:**

```json
{
  "scripts": {
    "build": "htmlincluder build"
  }
}
```

## See Also

- [Main README](../README.md) - Complete tag reference and examples
- [Example Configuration](../htmlincluder.config.example.mjs) - Comprehensive config example

# Migration Guide: Gulp to Standalone

This guide helps you migrate from using HTML Includer as a Gulp plugin to using it in standalone mode.

## Why Migrate?

**Benefits of standalone mode:**
- ✅ Simpler setup (no gulpfile needed)
- ✅ Faster builds (no Gulp overhead)
- ✅ Better integration with modern tools (npm scripts, CI/CD)
- ✅ Built-in watch mode
- ✅ Configuration file for better organization
- ✅ Can still use Gulp for other tasks

**When to stay with Gulp:**
- ❌ You have complex Gulp pipelines
- ❌ You're transforming files beyond HTML includes
- ❌ Your team is comfortable with Gulp

## Migration Steps

### Step 1: Keep Gulp Working (Optional)

No need to remove your Gulp setup immediately. Both can coexist!

Your existing Gulp code continues to work:

```javascript
// gulpfile.js - This still works!
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

### Step 2: Create Configuration File

Run the init command:

```bash
npx htmlincluder init
```

This creates `htmlincluder.config.mjs`. Migrate your Gulp options to this file:

**Before (Gulp):**
```javascript
gulp.task('html', () => {
  return gulp.src('./src/**/*.html')
    .pipe(htmlincluder({
      jsonInput: {
        site: { title: 'My Site' }
      },
      insertPattern: 'include virtual',
      dev: {
        printResult: true
      }
    }))
    .pipe(gulp.dest('./dist'));
});
```

**After (Config):**
```javascript
// htmlincluder.config.mjs
export default {
  srcDir: './src',
  destDir: './dist',
  options: {
    jsonInput: {
      site: { title: 'My Site' }
    },
    insertPattern: 'include virtual',
    dev: {
      printResult: true
    }
  }
};
```

### Step 3: Update package.json Scripts

**Before:**
```json
{
  "scripts": {
    "build": "gulp html",
    "watch": "gulp watch"
  }
}
```

**After:**
```json
{
  "scripts": {
    "build": "htmlincluder build",
    "watch": "htmlincluder build --watch",
    "gulp": "gulp"
  }
}
```

### Step 4: Test Both Approaches

Try the standalone build:

```bash
npm run build
```

Compare with Gulp build:

```bash
npm run gulp
```

Verify the outputs are identical.

### Step 5: Migrate Gradually

You can run both in parallel:

```json
{
  "scripts": {
    "build:gulp": "gulp html",
    "build:standalone": "htmlincluder build",
    "build": "npm run build:standalone",
    "watch": "htmlincluder build --watch"
  }
}
```

### Step 6: Remove Gulp (Optional)

Once you're confident, you can remove Gulp:

```bash
npm uninstall gulp gulp-cli
```

Remove or archive `gulpfile.js`.

## Common Migration Scenarios

### Scenario 1: Simple HTML Build

**Before (Gulp):**
```javascript
const gulp = require('gulp');
const htmlincluder = require('gulp-htmlincluder');

gulp.task('html', () => {
  return gulp.src('./src/**/*.html')
    .pipe(htmlincluder())
    .pipe(gulp.dest('./dist'));
});
```

**After (Standalone):**
```bash
# Create config
npx htmlincluder init

# Build
npx htmlincluder build
```

### Scenario 2: With JSON Data

**Before (Gulp):**
```javascript
const data = require('./data.json');

gulp.task('html', () => {
  return gulp.src('./src/**/*.html')
    .pipe(htmlincluder({ jsonInput: data }))
    .pipe(gulp.dest('./dist'));
});
```

**After (Config):**
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

### Scenario 3: Dynamic Data Loading

**Before (Gulp):**
```javascript
const fetch = require('node-fetch');

gulp.task('html', async () => {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  
  return gulp.src('./src/**/*.html')
    .pipe(htmlincluder({ jsonInput: data }))
    .pipe(gulp.dest('./dist'));
});
```

**After (Build Script):**
```javascript
// build.mjs
import { processDirectory } from 'gulp-htmlincluder/core';
import fetch from 'node-fetch';

async function build() {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  
  await processDirectory({
    srcDir: './src',
    destDir: './dist',
    options: {
      jsonInput: data
    }
  });
}

build().catch(console.error);
```

```json
{
  "scripts": {
    "build": "node build.mjs"
  }
}
```

### Scenario 4: Complex Pipeline

If you have a complex Gulp pipeline:

```javascript
gulp.task('html', () => {
  return gulp.src('./src/**/*.html')
    .pipe(htmlincluder())
    .pipe(replace('{{VERSION}}', pkg.version))
    .pipe(minifyHTML())
    .pipe(gulp.dest('./dist'));
});
```

**Option A: Keep Using Gulp**
No need to migrate! The plugin still works.

**Option B: Split Concerns**
```javascript
// Use standalone for includes
// Use Gulp for post-processing
gulp.task('postprocess', () => {
  return gulp.src('./dist/**/*.html')
    .pipe(replace('{{VERSION}}', pkg.version))
    .pipe(minifyHTML())
    .pipe(gulp.dest('./dist'));
});
```

```json
{
  "scripts": {
    "build": "htmlincluder build && gulp postprocess"
  }
}
```

**Option C: Pure JavaScript**
```javascript
import { processDirectory } from 'gulp-htmlincluder/core';
import { readFile, writeFile } from 'fs/promises';
import { minify } from 'html-minifier';

async function build() {
  // Process includes
  await processDirectory({
    srcDir: './src',
    destDir: './dist'
  });
  
  // Post-process
  const file = await readFile('./dist/index.html', 'utf8');
  const processed = file.replace('{{VERSION}}', '1.0.0');
  const minified = minify(processed);
  await writeFile('./dist/index.html', minified);
}
```

## Comparison Chart

| Feature | Gulp Plugin | Standalone CLI | Programmatic API |
|---------|-------------|----------------|------------------|
| Setup complexity | Medium | Low | Low |
| Configuration | In gulpfile | Config file | In code |
| Watch mode | Custom task | Built-in | Custom |
| Integration | Gulp pipeline | npm scripts | Any tool |
| TypeScript support | Via gulp-typescript | Native | Native |
| Debugging | Gulp debugging | Node debugging | Node debugging |

## Troubleshooting Migration

### Issue: "Module not found"

If you get import errors:

**Solution:** Make sure you're using `.mjs` extension or set `"type": "module"` in package.json:

```json
{
  "type": "module"
}
```

### Issue: "require is not defined"

Your config uses CommonJS but the file is `.mjs`:

**Solution:** Use ES modules syntax:

```javascript
// Before
const data = require('./data.json');

// After
import data from './data.json' assert { type: 'json' };
```

### Issue: Different output than Gulp

**Solution:** Check file structure. Make sure:
- Include files start with `-`
- Wrapper files start with `_`
- Page files don't start with `-` or `_`

### Issue: Can't find configuration

**Solution:** Make sure config file is in the project root or use `--config`:

```bash
npx htmlincluder build --config ./config/htmlincluder.config.mjs
```

## Best Practices

1. **Keep It Simple**: Start with the basic config, add complexity as needed
2. **Version Control**: Commit your config file to git
3. **Document**: Add comments to your config for your team
4. **Test First**: Run both builds in parallel until confident
5. **CI/CD**: Update your deployment scripts to use the new commands

## Need Help?

- Check the [Standalone Documentation](./STANDALONE.md)
- Review the [Quick Start Guide](./QUICKSTART.md)
- See [Example Configuration](../htmlincluder.config.example.mjs)
- Open an issue on GitHub

## Gradual Migration Checklist

- [ ] Install latest version
- [ ] Run `npx htmlincluder init`
- [ ] Migrate Gulp options to config file
- [ ] Test standalone build: `npx htmlincluder build`
- [ ] Compare outputs with Gulp build
- [ ] Update package.json scripts
- [ ] Test in CI/CD environment
- [ ] Update team documentation
- [ ] (Optional) Remove Gulp
- [ ] Celebrate! 🎉

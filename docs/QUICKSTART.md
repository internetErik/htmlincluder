# Quick Start Guide - Standalone Mode

Get started with HTML Includer in standalone mode (no Gulp required) in 5 minutes!

## Step 1: Install

```bash
npm install --save-dev gulp-htmlincluder
```

## Step 2: Create Configuration

```bash
npx htmlincluder init
```

This creates `htmlincluder.config.mjs` with default settings.

## Step 3: Set Up Your Files

Organize your HTML files with this naming convention:

```
src/
├── index.html          # Page file (will be built)
├── about.html          # Page file (will be built)
├── components/
│   ├── -header.html    # Include file (starts with -)
│   ├── -footer.html    # Include file
│   └── -nav.html       # Include file
└── layouts/
    └── _base.html      # Wrapper file (starts with _)
```

## Step 4: Use Include Directives

**src/index.html:**
```html
<!--#wrap path="./layouts/_base.html" -->
  <h1>Welcome to my website!</h1>
  <!--#insert path="./components/-nav.html" -->
  <p>This is the home page.</p>
<!--#endwrap -->
```

**src/layouts/_base.html:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!--#insert path="../components/-header.html" -->
  <main>
    <!--#middle -->
  </main>
  <!--#insert path="../components/-footer.html" -->
</body>
</html>
```

**src/components/-header.html:**
```html
<header>
  <h1><!--#data jsonPath="site.title" default="My Website" --></h1>
</header>
```

## Step 5: Build

```bash
npx htmlincluder build
```

Your processed files are now in `dist/`!

## Step 6: Add to package.json

```json
{
  "scripts": {
    "build": "htmlincluder build",
    "watch": "htmlincluder build --watch"
  }
}
```

Now you can run:
```bash
npm run build
npm run watch
```

## What Just Happened?

1. HTML Includer processed all your `.html` files in `src/`
2. Files starting with `-` were treated as reusable components
3. Files starting with `_` were treated as layout wrappers
4. Other files were built as pages
5. All directives (`<!--#insert`, `<!--#wrap`, etc.) were processed
6. Final HTML was written to `dist/`

## Next Steps

- [Read the full standalone documentation](./STANDALONE.md)
- [Check out all available tags and directives](../README.md)
- [See the example configuration](../htmlincluder.config.example.mjs)
- [Explore advanced features like data injection and control flow](../README.md#includer-tags)

## Common Tasks

### Add JSON Data

Edit `htmlincluder.config.mjs`:

```javascript
export default {
  srcDir: './src',
  destDir: './dist',
  options: {
    jsonInput: {
      site: {
        title: 'My Awesome Website',
        author: 'Your Name',
        year: new Date().getFullYear()
      },
      navigation: [
        { title: 'Home', url: '/' },
        { title: 'About', url: '/about.html' }
      ]
    }
  }
};
```

Use in HTML:
```html
<footer>
  © <!--#jsonInsert jsonPath="site.year" --> <!--#jsonInsert jsonPath="site.author" -->
</footer>
```

### Process Specific Files Only

Edit config:
```javascript
export default {
  srcDir: './src',
  destDir: './dist',
  files: [
    './src/index.html',
    './src/about.html'
  ]
};
```

### Custom Source/Destination

```bash
npx htmlincluder build --src ./source --dest ./public
```

### Watch for Changes

```bash
npx htmlincluder build --watch
```

Files rebuild automatically when you save changes!

## Troubleshooting

**Error: "insert file does not exist"**
- Check that the file path is relative to the current file
- Ensure include files start with `-`
- Verify the file exists at the specified path

**Error: "Configuration must specify srcDir"**
- Make sure `htmlincluder.config.mjs` exists
- Or specify paths with `--src` and `--dest` flags

**Files not processing**
- Ensure files don't start with `-` or `_` (those are components/wrappers)
- Check that files have `.html` extension
- Verify files are in the `srcDir` directory

## Help

```bash
npx htmlincluder --help
npx htmlincluder build --help
npx htmlincluder init --help
```

Happy building! 🚀

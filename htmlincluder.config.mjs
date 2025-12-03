/**
 * HTML Includer Configuration Example
 *
 * This file shows all available configuration options.
 * Copy this to your project as 'htmlincluder.config.mjs' and customize.
 */

// Example: Import a helper function for use in rawJson

// Example: Load data from an API or file

const getApiData = url => new Promise((resolve, reject) => {
  // http.get(url, resp => {
  //   let data = '';
  //   resp.on('data', chunk => data += chunk)
  //   resp.on('end', () => resolve(JSON.parse(data)))
  // })
	resolve({ heading : 'This is async heading copy', bodyCopy : 'this is async body copy' })
})

export default {
  // Source directory containing HTML files to process
  // Files starting with '-' are include files
  // Files starting with '_' are wrapper files
  // Other files are processed as page files
	srcDir: './test/html/',

  // Destination directory for processed files
  // Directory structure is preserved
	destDir: './test/html-built/',

  // Processing options
  options: {
    /**
     * JSON data to inject into templates
     * This data is available in all files via <!--#jsonInsert jsonPath="..." -->
     */
    jsonInput: {
      heading: 'Welcome to My Website',
      // You can also load data dynamically
      // Just make sure to await it before passing to the processor
      // posts: await loadBlogPosts(),
    },

    /**
     * Custom insert pattern
     * Default: 'insert' (looks for <!--#insert ... -->)
     * Set to 'include virtual' for SSI compatibility (<!--#include virtual ... -->)
     */
    insertPattern: null,

    /**
     * Attribute name for file paths in tags
     * Default: 'path'
     * Example: <!--#insert path="./header.html" -->
     */
    filePathAttribute: 'path',

    /**
     * Attribute name for JSON paths in tags
     * Default: 'jsonPath'
     * Example: <!--#data jsonPath="site.title" -->
     */
    jsonPathAttribute: 'jsonPath',

    /**
     * Functions/objects available in rawJson attributes
     * These can be used in any rawJson attribute throughout your templates
     *
     * Example usage in HTML:
     * <!--#insert path="-widget.html" rawJson="(async ({ fetch }) => {
     *   const data = await fetch('https://api.example.com/data');
     *   return data.json();
     * })(plugins)" -->
     */
    rawJsonPlugins: {
      // Make fetch available
    //   fetch,

      // Custom helper functions
      formatDate: (date) => new Date(date).toLocaleDateString(),

      // Data loaders
      getApiData,

      // Any other utilities you need
      uppercase: (str) => str.toUpperCase(),
    },

    /**
     * Development/debugging options
     */
    dev: {
      // Limit how many times nested processing will loop (prevents infinite loops)
      limitIterations: null,

      // Log each iteration during processing
      printIterations: false,

      // Log the final result to console
      printResult: false,

      // Log path resolution
      printPaths: false,
    },
  },

  /**
   * Specific files to process
   * If null, all non-include/non-wrapper files are processed
   * Use this to build only specific pages
   */
  files: null,
  // Example: Process only specific files
  // files: [
  //   './src/index.html',
  //   './src/about.html',
  // ],

  /**
   * Watch mode (for CLI usage)
   * When true, watches for file changes and rebuilds automatically
   */
  watch: false,
};

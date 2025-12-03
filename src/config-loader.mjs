/**
 * Configuration file loader for HTML Includer
 * 
 * Loads and validates configuration from various file formats
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Default configuration
 */
const defaultConfig = {
  srcDir: './src',
  destDir: './dist',
  options: {
    jsonInput: {},
    insertPattern: null,
    filePathAttribute: 'path',
    jsonPathAttribute: 'jsonPath',
    rawJsonPlugins: {},
    dev: {
      limitIterations: null,
      printIterations: false,
      printResult: false,
      printPaths: false,
    },
  },
  files: null, // null means process all files
  watch: false,
};

/**
 * Load configuration from a file
 * 
 * @param {string} configPath - Path to configuration file
 * @returns {Promise<Object>} Merged configuration object
 */
export async function loadConfig(configPath) {
  const ext = path.extname(configPath).toLowerCase();
  let userConfig = {};

  try {
    if (ext === '.json') {
      userConfig = await loadJsonConfig(configPath);
    } else if (ext === '.js' || ext === '.mjs') {
      userConfig = await loadJsConfig(configPath);
    } else {
      throw new Error(`Unsupported configuration file format: ${ext}`);
    }
  } catch (err) {
    throw new Error(`Failed to load configuration from ${configPath}: ${err.message}`);
  }

  // Merge with defaults
  return mergeConfig(defaultConfig, userConfig);
}

/**
 * Load JSON configuration file
 */
async function loadJsonConfig(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Load JavaScript/ESM configuration file
 */
async function loadJsConfig(filePath) {
  const absolutePath = path.resolve(filePath);
  const module = await import(absolutePath);
  return module.default || module;
}

/**
 * Merge user configuration with defaults
 */
function mergeConfig(defaults, user) {
  const merged = { ...defaults };

  for (const key in user) {
    if (user[key] !== null && typeof user[key] === 'object' && !Array.isArray(user[key])) {
      merged[key] = mergeConfig(defaults[key] || {}, user[key]);
    } else {
      merged[key] = user[key];
    }
  }

  return merged;
}

/**
 * Find configuration file in current directory
 * Searches for common configuration file names
 * 
 * @param {string} startDir - Directory to start search from
 * @returns {Promise<string|null>} Path to configuration file or null
 */
export async function findConfig(startDir = process.cwd()) {
  const possibleNames = [
    'htmlincluder.config.mjs',
    'htmlincluder.config.js',
    'htmlincluder.config.json',
    '.htmlincluderrc.json',
    '.htmlincluderrc.js',
  ];

  for (const name of possibleNames) {
    const configPath = path.join(startDir, name);
    try {
      await fs.access(configPath);
      return configPath;
    } catch {
      // File doesn't exist, continue searching
    }
  }

  return null;
}

/**
 * Validate configuration object
 * 
 * @param {Object} config - Configuration to validate
 * @throws {Error} If configuration is invalid
 */
export function validateConfig(config) {
  if (!config.srcDir) {
    throw new Error('Configuration must specify srcDir');
  }

  if (config.files && !Array.isArray(config.files)) {
    throw new Error('Configuration files must be an array');
  }

  if (config.options) {
    if (config.options.dev && typeof config.options.dev !== 'object') {
      throw new Error('Configuration options.dev must be an object');
    }

    if (config.options.rawJsonPlugins && typeof config.options.rawJsonPlugins !== 'object') {
      throw new Error('Configuration options.rawJsonPlugins must be an object');
    }
  }

  return true;
}

/**
 * Create a default configuration file
 * 
 * @param {string} outputPath - Path where to create the config file
 * @param {string} format - 'json' or 'js'
 */
export async function createDefaultConfig(outputPath, format = 'js') {
  let content;

  if (format === 'json') {
    content = JSON.stringify(defaultConfig, null, 2);
  } else {
    content = `/**
 * HTML Includer Configuration
 * 
 * This file configures how HTML files are processed.
 * See: https://github.com/internetErik/gulp-htmlincluder
 */

export default {
  // Source directory containing HTML files
  srcDir: './src',
  
  // Destination directory for processed files
  destDir: './dist',
  
  // Processing options
  options: {
    // JSON data to inject into templates
    jsonInput: {},
    
    // Custom insert pattern (default: 'insert')
    // Set to 'include virtual' for SSI compatibility
    insertPattern: null,
    
    // Attribute name for file paths (default: 'path')
    filePathAttribute: 'path',
    
    // Attribute name for JSON paths (default: 'jsonPath')
    jsonPathAttribute: 'jsonPath',
    
    // Functions available in rawJson attributes
    // Example: { fetch: fetch, myHelper: () => {} }
    rawJsonPlugins: {},
    
    // Development options
    dev: {
      limitIterations: null,
      printIterations: false,
      printResult: false,
      printPaths: false,
    },
  },
  
  // Specific files to process (null = all files)
  files: null,
  
  // Watch mode (for CLI)
  watch: false,
};
`;
  }

  await fs.writeFile(outputPath, content, 'utf8');
  return outputPath;
}

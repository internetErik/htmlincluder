/**
 * Core HTML Includer API
 * 
 * This module provides the core functionality for processing HTML files
 * with include directives. It's decoupled from any specific build tool
 * (like Gulp) and can be used standalone or with any build system.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { processFile } from './parse.mjs';
import { configureFiles, setOptions, pageFiles, insertFiles, wrapFiles } from './config.mjs';

/**
 * Process HTML files with include directives
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.srcDir - Source directory containing HTML files
 * @param {string} config.destDir - Destination directory for processed files
 * @param {Object} config.options - Processing options (same as gulp plugin options)
 * @param {Array<string>} config.files - Optional array of specific file paths to process
 * @returns {Promise<Array>} Array of processed file results
 */
export async function processDirectory(config) {
  const {
    srcDir,
    destDir,
    options = {},
    files = null,
  } = config;

  // Initialize the processor with options
  setOptions(options);

  // Load all files from the source directory
  const allFiles = files || await discoverFiles(srcDir);
  
  // Hash all files (categorize them as page, insert, or wrap files)
  for (const filePath of allFiles) {
    const content = await fs.readFile(filePath, 'utf8');
    const file = createFileObject(filePath, content);
    hashFile(file);
  }

  // Process all page files
  const results = [];
  for (const file of pageFiles) {
    const processed = await processFile(file, options.jsonInput || {});
    results.push({
      path: file.path,
      name: file.name,
      content: processed.content,
    });

    // Write to destination if provided
    if (destDir) {
      const relativePath = path.relative(srcDir, file.path);
      const destPath = path.join(destDir, relativePath);
      await ensureDir(path.dirname(destPath));
      await fs.writeFile(destPath, processed.content, 'utf8');
    }
  }

  return results;
}

/**
 * Process a single HTML file
 * 
 * @param {string} filePath - Path to the file to process
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processed file result
 */
export async function processSingleFile(filePath, options = {}) {
  setOptions(options);
  
  const content = await fs.readFile(filePath, 'utf8');
  const file = createFileObject(filePath, content);
  
  const processed = await processFile(file, options.jsonInput || {});
  
  return {
    path: file.path,
    name: file.name,
    content: processed.content,
  };
}

/**
 * Process HTML content string directly
 * 
 * @param {string} content - HTML content to process
 * @param {Object} context - Processing context
 * @param {string} context.basePath - Base path for resolving relative includes
 * @param {Object} context.options - Processing options
 * @returns {Promise<string>} Processed HTML content
 */
export async function processContent(content, context = {}) {
  const {
    basePath = process.cwd(),
    options = {},
  } = context;

  setOptions(options);

  // Create a virtual file object
  const file = createFileObject(
    path.join(basePath, 'virtual-file.html'),
    content
  );

  const processed = await processFile(file, options.jsonInput || {});
  
  return processed.content;
}

/**
 * Load and process files needed for includes/wraps
 * 
 * @param {string} baseDir - Base directory to search for include/wrap files
 * @param {Object} options - Processing options
 */
export async function loadDependencies(baseDir, options = {}) {
  setOptions(options);
  
  const allFiles = await discoverFiles(baseDir);
  
  for (const filePath of allFiles) {
    const fileName = path.basename(filePath);
    // Only load insert (-) and wrap (_) files
    if (fileName.startsWith('-') || fileName.startsWith('_')) {
      const content = await fs.readFile(filePath, 'utf8');
      const file = createFileObject(filePath, content);
      hashFile(file);
    }
  }
}

// ===== Helper Functions =====

/**
 * Create a file object from path and content
 */
function createFileObject(filePath, content) {
  const isWin = /^win/.test(process.platform);
  const fileName = path.basename(filePath);
  
  return {
    path: filePath,
    name: fileName,
    content: content.trim(),
    processed: false,
    file: {
      path: filePath,
      contents: Buffer.from(content),
    },
  };
}

/**
 * Hash a file into the appropriate category
 */
function hashFile(file) {
  // Process clipping before categorizing
  processClip(file);
  configureFiles(file);
}

/**
 * Process clip directives
 */
function processClip(file) {
  // process clipbefore and clipafter
  if (file.content.indexOf('<!--#clipbefore') > -1) {
    file.content = file.content
      .split(/<!--#clipbefore\s*-->/)
      .splice(1)[0]
      .split('<!--#clipafter')
      .splice(0, 1)[0];
  }

  // process clipbetween
  if (file.content.indexOf('<!--#clipbetween') > -1) {
    const tmp = file.content.split(/<!--#clipbetween\s*-->/);
    file.content = tmp[0] + tmp[1].split(/<!--#endclipbetween\s*-->/)[1];
  }
}

/**
 * Recursively discover HTML files in a directory
 */
async function discoverFiles(dir, fileList = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await discoverFiles(fullPath, fileList);
    } else if (entry.isFile() && fullPath.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * Reset internal state (useful for testing or batch processing)
 */
export function reset() {
  pageFiles.length = 0;
  Object.keys(insertFiles).forEach(key => delete insertFiles[key]);
  Object.keys(wrapFiles).forEach(key => delete wrapFiles[key]);
}

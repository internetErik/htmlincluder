/**
 * HTML Includer - Main Entry Point
 * 
 * This module exports both:
 * 1. The Gulp plugin (default export) - for backward compatibility
 * 2. The standalone core API - for use without Gulp
 */

// Gulp plugin (CommonJS for backward compatibility)
const gulpPlugin = require('./index.js');

// Core API exports (ESM)
export { processDirectory, processSingleFile, processContent, loadDependencies, reset } from './src/core.mjs';
export { loadConfig, findConfig, createDefaultConfig, validateConfig } from './src/config-loader.mjs';

// Default export is the gulp plugin for backward compatibility
export default gulpPlugin;

// Also export as 'gulp' for named import
export const gulp = gulpPlugin;

#!/usr/bin/env node

/**
 * HTML Includer CLI
 *
 * Command-line interface for running HTML Includer independently
 */

import { Command } from 'commander';
import path from 'path';
import { promises as fs } from 'fs';
import { loadConfig, findConfig, createDefaultConfig, validateConfig } from './config-loader.mjs';
import { processDirectory, reset } from './core.mjs';

const program = new Command();

program
.name('htmlincluder')
.description('Process HTML files with include directives')
.version('2.2.4');

// Build command
program
.command('build')
.description('Build HTML files from source to destination')
.option('-c, --config <path>', 'Path to configuration file')
.option('-s, --src <path>', 'Source directory (overrides config)')
.option('-d, --dest <path>', 'Destination directory (overrides config)')
.option('-w, --watch', 'Watch for changes and rebuild')
.action(async (options) => {
	try {
		const config = await resolveConfig(options);
		console.log(`Building from ${config.srcDir} to ${config.destDir}...`);

		const results = await processDirectory(config);

		console.log(`✓ Successfully processed ${results.length} file(s)`);

		if (options.watch) {
			await watchFiles(config);
		}
	} catch (err) {
		console.error('Error during build:', err.message);
		process.exit(1);
	}
});

// Init command
program
.command('init')
.description('Create a default configuration file')
.option('-f, --format <format>', 'Configuration file format (js|json)', 'js')
.option('-o, --output <path>', 'Output path for configuration file')
.action(async (options) => {
	try {
		const format = options.format === 'json' ? 'json' : 'js';
		const ext = format === 'json' ? '.json' : '.mjs';
		const outputPath = options.output || `htmlincluder.config${ext}`;

		// Check if file already exists
		try {
			await fs.access(outputPath);
			console.error(`Error: Configuration file already exists at ${outputPath}`);
			process.exit(1);
		} catch {
			// File doesn't exist, proceed
		}

		await createDefaultConfig(outputPath, format);
		console.log(`✓ Created configuration file at ${outputPath}`);
	} catch (err) {
		console.error('Error creating configuration:', err.message);
		process.exit(1);
	}
});

// Process single file command
program
.command('process <file>')
.description('Process a single HTML file')
.option('-c, --config <path>', 'Path to configuration file')
.option('-o, --output <path>', 'Output file path')
.action(async (file, options) => {
	try {
		const config = await resolveConfig(options);
		const filePath = path.resolve(file);

		// Load dependencies from srcDir
		const { loadDependencies } = await import('./core.mjs');
		await loadDependencies(config.srcDir, config.options);

		// Process the single file
		const { processSingleFile } = await import('./core.mjs');
		const result = await processSingleFile(filePath, config.options);

		if (options.output) {
			await fs.writeFile(options.output, result.content, 'utf8');
			console.log(`✓ Processed ${file} → ${options.output}`);
		} else {
			console.log(result.content);
		}
	} catch (err) {
		console.error('Error processing file:', err.message);
		process.exit(1);
	}
});

program.parse();

// ===== Helper Functions =====

/**
 * Resolve configuration from options and config files
 */
async function resolveConfig(options) {
  let config;

  // Try to load from specified config file
  if (options.config) {
    config = await loadConfig(options.config);
  } else {
    // Try to find config file
    const configPath = await findConfig();
    if (configPath) {
      config = await loadConfig(configPath);
    } else {
      // Use defaults
      const { loadConfig } = await import('./config-loader.mjs');
      config = {
        srcDir: './src',
        destDir: './dist',
        options: {},
      };
    }
  }

  // Override with command-line options
  if (options.src) {
    config.srcDir = options.src;
  }

  if (options.dest) {
    config.destDir = options.dest;
  }

  // Validate configuration
  validateConfig(config);

  return config;
}

/**
 * Watch files for changes
 */
async function watchFiles(config) {
  console.log('\nWatching for changes... (press Ctrl+C to stop)');

  const chokidar = await import('chokidar');

  const watcher = chokidar.watch(config.srcDir, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
  });

  let debounceTimer;

  const rebuild = async () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      console.log('\nRebuilding...');
      reset();
      try {
        const results = await processDirectory(config);
        console.log(`✓ Successfully processed ${results.length} file(s)`);
      } catch (err) {
        console.error('Error during rebuild:', err.message);
      }
    }, 100);
  };

  watcher
    .on('change', (path) => {
      console.log(`File changed: ${path}`);
      rebuild();
    })
    .on('add', (path) => {
      console.log(`File added: ${path}`);
      rebuild();
    })
    .on('unlink', (path) => {
      console.log(`File removed: ${path}`);
      rebuild();
    });
}

/**
 * It is very unlikely that you would want to change anything in this file
 * since it only deals with exporting right functions to users.
 *
 * When you run `abell serve` and `abell build`, `./cli.js` is the file
 * that is executed so you can follow code from cli.js for basic logic.
 */

// Typedefs

/**
 *
 * @typedef {Object} AbellConfig - Configurations from abell.config.js
 * @property {String} contentPath - Path to content directory (default 'content')
 * @property {String} themePath - Path to source directory (default 'src')
 * @property {String} outputPath - Path to output destination (default 'dist', changes to 'debug' during dev-server)
 * @property {String[]} plugins - Array of abell plugins.
 * @property {Object} globalMeta - Meta variables that are accessible globally in .abell files
 *
 */

const { generateSite, createHTMLFile } = require('./utils/generate-site.js');

const build = require('./commands/build.js');

// Exports
module.exports = {
  build,
  generateSite,
  createHTMLFile
};

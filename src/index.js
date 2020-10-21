/**
 * It is very unlikely that you would want to change anything in this file
 * since it only deals with exporting right functions to users.
 *
 * When you run `abell serve` and `abell build`, `../bin/abell.js` is the file
 * that is executed so you can follow code from bin/abell.js for basic logic.
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
 * @typedef {Object} MetaInfo - Meta information from meta.json file in content dir
 * @property {String} $slug - slug of content
 * @property {String} $source - Source 'local' or 'plugin'
 * @property {Date} $createdAt - Date object with time of content creation
 * @property {Date} $modifiedAt - Date object with time of last modification
 * @property {String} $path - String of path
 * @property {String} $root - Prefix to root
 *
 * @typedef {Object} TemplateObj
 * @property {Boolean} shouldLoop - should loop over template to create content
 * @property {String} $path - path of the current file
 * @property {String} $root - path to the root directory
 *
 * @typedef {Object.<String, MetaInfo>} ContentMap
 *
 * @typedef {Object.<String, TemplateObj>} TemplateMap
 *
 * @typedef {Object} ProgramInfo
 * @property {AbellConfig} abellConfig
 * @property {ContentMap} contentMap
 * @property {TemplateMap} templateMap
 * @property {String} logs - 'minimum', 'complete'
 * @property {Number} port - port of the dev server
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

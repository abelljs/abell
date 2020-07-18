/**
 * It is very unlikely that you would want to change anything in this file
 * since it only deals with exporting right functions to users.
 *
 * When you run `abell serve` and `abell build`, `./cli.js` is the file
 * that is executed so you can follow code from cli.js for basic logic.
 */

const { generateSite, createHTMLFile } = require('./utils/generate-site.js');

const build = require('./commands/build.js');
require('./utils/typedefs.js'); // Adds typedefs which can be imported from plugins

// Exports
module.exports = {
  build,
  generateSite,
  createHTMLFile
};

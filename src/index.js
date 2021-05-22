/**
 * It is very unlikely that you would want to change anything in this file
 * since it only deals with exporting right functions to users.
 *
 * When you run `abell serve` and `abell build`, `../bin/abell.js` is the file
 * that is executed so you can follow code from bin/abell.js for basic logic.
 */

const { generateSite, createHTMLFile } = require('./utils/generate-site.js');

const build = require('./commands/build.js');
const serve = require('./commands/serve.js');

// Exports
module.exports = {
  build,
  serve,
  generateSite,
  createHTMLFile
};

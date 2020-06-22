/**
 * It is very unlikely that you would want to change anything in this file
 * since it only deals with exporting right functions to users.
 *
 * Follow the required paths to reach the right file
 */

const {
  generateContentFile,
  generateHTMLFile
} = require('./utils/content-generator.js');

const build = require('./commands/build.js');
const serve = require('./commands/serve.js');

// Exports
module.exports = {
  build,
  serve,
  generateContentFile,
  generateHTMLFile
};

const fs = require('fs');
const { rmdirRecursiveSync } = require('./general-helpers');

/**
 * Creates HTML file from given parameters
 * @param {String} abellTemplate content of .abell file
 * @param {Object} variables List of variables to pass to template
 * @param {String} outputPath path of the output HTML file
 */
function createHTMLFile(abellTemplate, variables, outputPath) {
  // Creates HTML File
}

/**
 * Builds site
 * @param {ProgramInfo} programInfo
 */
function generateSite(programInfo) {
  // Builds site from given program information
  if (programInfo.logs == 'complete') console.log('\n>> Abell Build Started\n');

  // Refresh dist
  rmdirRecursiveSync(programInfo.abellConfig.outputPath);
  fs.mkdirSync(programInfo.abellConfig.outputPath);

  for (const template of Object.values(programInfo.templateTree)) {
    console.log(template.$path);
  }
}

module.exports = { createHTMLFile, generateSite };

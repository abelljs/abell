/**
 *
 * @typedef {Object} AbellConfigs - Configurations from abell.config.js
 * @property {String} contentPath - Path to content directory (default 'content')
 * @property {String} sourcePath - Path to source directory (default 'src')
 * @property {String} destinationPath
 *  - Path to output destination (default 'dist', changes to 'debug' during dev-server)
 * @property {Object} globalMeta - Meta variables that are accessible globally in .abell files
 * @property {Array} ignoreInBuild
 * @property {Array} plugins
 *
 * @typedef {Object} ProgramInfo - Contains all the information required by the build to execute.
 * @property {AbellConfigs} abellConfigs
 *  - Configuration from abell.config.js file
 * @property {String} contentTemplate - string of the template from [$slug]/index.abell file
 * @property {String} contentTemplatePath - path of the template (mostly [$slug]/index.abell file
 * @property {Object} vars - all global variables in .abell files
 * @property {MetaInfo[]} vars.$contentArray - An array of all MetaInfo
 * @property {Object} vars.$contentObj - Content meta info object
 * @property {Object} vars.globalMeta - meta info to be injected into .abell files
 * @property {Array} contentDirectories - List of names of all directories in content directory
 * @property {String} logs - logs in the console ('minimum', 'complete')
 * @property {String} templateExtension - extension of input file ('.abell' default)
 * 
 */

/**
 *
 * @param {ProgramInfo} programInfo
 */
function beforeBuild(programInfo) {
  console.log('Before Build');
}

/**
 *
 * @param {ProgramInfo} programInfo
 */
function afterBuild(programInfo) {
  console.log('After Build');
}

module.exports = { beforeBuild, afterBuild };

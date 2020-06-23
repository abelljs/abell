/**
 *
 * @typedef {Object} AbellConfigs - Configurations from abell.config.js
 * @property {String} contentPath - Path to content directory (default 'content')
 * @property {String} sourcePath - Path to source directory (default 'src')
 * @property {String} destinationPath - Path to output destination (default 'dist', changes to 'debug' during dev-server)
 * @property {String[]} plugins - Array of abell plugins.
 * @property {Object} globalMeta - Meta variables that are accessible globally in .abell files
 *
 *
 * @typedef {Object} MetaInfo - Meta information from meta.json file in content dir
 * @property {String} $slug - slug of content
 * @property {Date} $createdAt - Date object with time of content creation
 * @property {Date} $modifiedAt - Date object with time of last modification
 * @property {String} $path - String of path
 * @property {String} $root - Prefix to root
 *
 *
 * @typedef {Object} ProgramInfo - Contains all the information required by the build to execute.
 * @property {AbellConfigs} abellConfigs - Configuration from abell.config.js file
 * @property {String} contentIndexTemplate - string of the template from [$path]/index.abell file
 * @property {String} contentTemplatePaths - path of the template (mostly [$path]/index.abell file
 * @property {Object} vars - all global variables in .abell files
 * @property {MetaInfo[]} vars.$contentArray - An array of all MetaInfo
 * @property {Object} vars.$contentObj - Content meta info object
 * @property {Object} vars.globalMeta - meta info to be injected into .abell files
 * @property {Array} contentDirectories - List of names of all directories in content directory
 * @property {String} logs - logs in the console ('minimum', 'complete')
 * @property {String} templateExtension - extension of input file ('.abell' default)
 *
 */

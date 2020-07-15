const path = require('path');

const { getAbellConfig, getContentMeta } = require('./build-utils.js');
const { recursiveFindFiles } = require('./general-helpers.js');

/**
 * Returns the basic information needed for build execution
 * @return {ProgramInfo}
 */
function getProgramInfo() {
  // Get configured paths of destination and content
  const abellConfig = getAbellConfig();

  const programInfo = {
    abellConfig,
    contentTree: buildSourceContentTree(abellConfig.contentPath),
    templateTree: {},
    logs: 'minimum',
    port: 5000,
    socketPort: 3000
  };

  return programInfo;
}

/**
 * Builds Source Content tree
 * @param {String} contentPath
 * @return {ContentTree}
 */
function buildSourceContentTree(contentPath) {
  // Build the tree which has all information about content
  const relativeSlugs = recursiveFindFiles(
    contentPath,
    'index.md'
  ).map((mdPath) => path.dirname(path.relative(contentPath, mdPath)));

  // Create a source object with slugs as keys and their meta values as properties
  const source = {};
  for (const slug of relativeSlugs) {
    source[slug] = getContentMeta(slug, { contentPath });
  }

  return source;
}

/**
 *
 * @param {PluginNode} pluginNode Similar to meta info but includes content as well
 * @return {MetaInfo}
 */
function getSourceNodeFromPluginNode(pluginNode) {
  return {
    ...pluginNode,
    $path: pluginNode.slug,
    $slug: pluginNode.slug,
    $createdAt: pluginNode.createdAt,
    $modifiedAt: pluginNode.modifiedAt || pluginNode.createdAt,
    $root: '..',
    $source: 'plugin'
  };
}

/**
 * Build template tree
 */
function buildTemplateTree() {
  // Builds tree with all information of .abell files
}

module.exports = {
  getProgramInfo,
  buildSourceContentTree,
  buildTemplateTree,
  getSourceNodeFromPluginNode
};

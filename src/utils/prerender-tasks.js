const { getAbellConfig } = require('./build-utils.js');

/**
 * Returns the basic information needed for build execution
 * @return {ProgramInfo}
 */
function getProgramInfo() {
  // Get configured paths of destination and content
  const abellConfig = getAbellConfig();

  const programInfo = {
    abellConfig,
    contentTree: {},
    templateTree: {},
    logs: 'minimum',
    port: 5000,
    socketPort: 3000
  };

  return programInfo;
}

/**
 * Builds Source Content tree
 * @return {ContentTree}
 */
function buildSourceContentTree() {
  // Build the tree which has all information about content
  return {
    foo: 'bar'
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
  buildTemplateTree
};

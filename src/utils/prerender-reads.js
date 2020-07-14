const { getAbellConfigs } = require('./build-utils.js');

/**
 * Returns the basic information needed for build execution
 * @return {ProgramInfo}
 */
function getProgramInfo() {
  // Get configured paths of destination and content
  const abellConfigs = getAbellConfigs();

  const programInfo = {
    abellConfigs,
    vars: {
      $contentArray: [],
      $contentObj: {},
      globalMeta: abellConfigs.globalMeta
    },
    logs: 'minimum'
  };

  return programInfo;
}

/**
 * Builds Source Content tree
 */
function buildSourceContentTree() {
  // Build the tree which has all information about content
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

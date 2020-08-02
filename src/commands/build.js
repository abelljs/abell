const {
  getProgramInfo,
  getSourceNodeFromPluginNode
} = require('../utils/build-utils.js');

const {
  executeBeforeBuildPlugins,
  executeAfterBuildPlugins,
  logError
} = require('../utils/general-helpers.js');

const { generateSite } = require('../utils/generate-site.js');

/**
 * Executed on `abell build`
 */
async function build() {
  // - Get baseProgramInfo
  // - Execute beforeBuild plugins and let them add extra content or template if needed.
  // - Get All information of source content in a tree
  // - Get all information of template in template tree
  const buildStartTime = new Date();
  const programInfo = await getProgramInfo();
  programInfo.task = 'build';
  // createContent function that goes to plugins
  const createContent = (pluginNode) => {
    programInfo.contentMap[pluginNode.slug] = getSourceNodeFromPluginNode(
      pluginNode
    );
  };

  await executeBeforeBuildPlugins(programInfo, { createContent });

  try {
    // Build site here
    generateSite(programInfo);
  } catch (err) {
    console.log('\n>>');
    console.log(err);
    logError('Abell Build Failed :( More logs above.\n');
    process.exit(0);
  }

  // Run afterBuild functions of plugins
  executeAfterBuildPlugins(programInfo);
  console.log(new Date() - buildStartTime);
}

module.exports = build;

const {
  getProgramInfo,
  getSourceNodeFromPluginNode
} = require('../utils/build-utils.js');

const {
  executeBeforeBuildPlugins,
  executeAfterBuildPlugins,
  logError,
  colors
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
  const programInfo = getProgramInfo();
  programInfo.task = 'build';
  // createContent function that goes to plugins
  const createContent = (pluginNode) => {
    programInfo.contentMap[pluginNode.slug] = getSourceNodeFromPluginNode(
      pluginNode
    );
  };

  await executeBeforeBuildPlugins(programInfo, { createContent });

  programInfo.logs = 'complete';
  programInfo.task = 'build';

  try {
    // Build site here
    await generateSite(programInfo);
  } catch (err) {
    console.log('\n>>');
    console.log(err);
    logError('Abell Build Failed 😭 Detailed logs above.\n');
    process.exit(0);
  }

  // Run afterBuild functions of plugins
  await executeAfterBuildPlugins(programInfo);
  // prettier-ignore
  console.log(`\n${colors.boldGreen('>>>')} Build Success (Built in ${new Date() - buildStartTime}ms) 🌻\n\n`); // eslint-disable-line max-len
}

module.exports = build;

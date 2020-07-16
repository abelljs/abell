const path = require('path');
const {
  getProgramInfo,
  getSourceNodeFromPluginNode
} = require('../utils/build-utils.js');
const { generateSite } = require('../utils/generate-site.js');

/**
 *
 * @param {ProgramInfo} programInfo
 */
async function executeBeforeBuildPlugins(programInfo, { createContent }) {
  /** Before Build plugins */
  for (const pluginPath of programInfo.abellConfig.plugins) {
    const currentPlugin = require(pluginPath);
    if (currentPlugin.beforeBuild) {
      console.log(
        '>> Plugin BeforeBuild: Executing ' +
          path.relative(process.cwd(), pluginPath)
      );

      await currentPlugin.beforeBuild(programInfo, { createContent });
    }
  }
}

/**
 *
 * @param {ProgramInfo} programInfo
 */
function executeAfterBuildPlugins(programInfo) {
  /** After Build plugins */
  for (const pluginPath of programInfo.abellConfig.plugins) {
    const currentPlugin = require(pluginPath);
    if (currentPlugin.afterBuild) {
      if (programInfo.logs === 'complete') {
        console.log(
          '>> Plugin AfterBuild: Executing ' +
            path.relative(process.cwd(), pluginPath)
        );
      }
      currentPlugin.afterBuild(programInfo);
    }
  }
}

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

  // createContent function that goes to plugins
  const createContent = (pluginNode) => {
    programInfo.contentTree[pluginNode.slug] = getSourceNodeFromPluginNode(
      pluginNode
    );
  };

  await executeBeforeBuildPlugins(programInfo, { createContent });
  // Build site here
  generateSite(programInfo);

  // Run afterBuild functions of plugins
  executeAfterBuildPlugins(programInfo);
  console.log(new Date() - buildStartTime);
}

module.exports = build;

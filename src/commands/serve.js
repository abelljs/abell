const fs = require('fs');
const path = require('path');

const ads = require('../abell-dev-server');

const {
  getProgramInfo,
  getSourceNodeFromPluginNode
} = require('../utils/build-utils.js');

const {
  executeBeforeBuildPlugins,
  executeAfterBuildPlugins,
  colors
} = require('../utils/general-helpers.js');

const { generateSite } = require('../utils/generate-site.js');

/**
 *
 * @param {ProgramInfo} programInfo
 */
function runDevServer(programInfo) {
  // Runs Dev server with all the watchers etc.
  generateSite(programInfo);
  console.log('Starting abell-dev-server 🤠...');

  ads.create({
    port: programInfo.port,
    path: programInfo.abellConfig.destinationPath
  });

  const chokidarOptions = {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  };

  // Print ports on screen
  console.log('='.repeat(process.stdout.columns));
  console.log('\n\n💫 Abell dev server running.');
  console.log(
    `${colors.boldGreen('Local: ')} http://localhost:${programInfo.port} \n\n`
  );
  console.log('='.repeat(process.stdout.columns));

  /** WATCHERS!! */

  const onAbellConfigChanged = (filePath) => {
    console.log('Abell configs changed ⚙️');
    // Read New abell.config.js
    // set globalMeta to programInfo
  };

  const onThemeChanged = (event, filePath) => {
    console.log('Theme Changed 💅');
    // build source tree again
  };

  console.log(programInfo);
}

/**
 * Executed on `abell serve`
 * @param {Object} command
 */
async function serve(command) {
  const programInfo = getProgramInfo();

  // createContent function that goes to plugins
  const createContent = (pluginNode) => {
    programInfo.contentTree[pluginNode.slug] = getSourceNodeFromPluginNode(
      pluginNode
    );
  };

  await executeBeforeBuildPlugins(programInfo, { createContent });
  // constant till here

  /**
   * TODO: Everything after this!
   */

  programInfo.port = command.port || 5000;
  programInfo.task = 'serve';
  programInfo.logs = 'minimum';
  programInfo.abellConfig.destinationPath = '.debug';

  runDevServer(programInfo);
  executeAfterBuildPlugins(programInfo);
}

module.exports = serve;

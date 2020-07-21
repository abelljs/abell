const fs = require('fs');
const path = require('path');

const chokidar = require('chokidar');

const ads = require('../abell-dev-server');
const {
  getProgramInfo,
  getSourceNodeFromPluginNode
} = require('../utils/build-utils.js');

const {
  executeBeforeBuildPlugins,
  executeAfterBuildPlugins,
  colors,
  exitHandler
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
    path: programInfo.abellConfig.outputPath
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
    console.log('Abell Config Changed ⚙️');
    // Read New abell.config.js
    // set globalMeta to programInfo
  };

  const onThemeChanged = (event, filePath) => {
    console.log('Theme Changed 💅');
    // build source tree again
  };

  const onContentChanged = (event, filePath) => {
    console.log('Content Changed 📄');
    // build content tree again
  };

  // Listeners
  const configPath = path.join(process.cwd(), 'abell.config.js');

  if (fs.existsSync(configPath)) {
    chokidar
      .watch(configPath, chokidarOptions)
      .on('change', onAbellConfigChanged);
  }

  if (fs.existsSync(programInfo.abellConfig.contentPath)) {
    chokidar
      .watch(programInfo.abellConfig.contentPath, chokidarOptions)
      .on('all', onContentChanged);
  }

  chokidar
    .watch(programInfo.abellConfig.themePath, chokidarOptions)
    .on('all', onThemeChanged);

  /** EXIT HANDLER */
  // do something when app is closing
  process.on('exit', exitHandler.bind(null, { cleanup: true }));
  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, { exit: true }));
  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
  // catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
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
  programInfo.abellConfig.outputPath = '.debug';

  runDevServer(programInfo);
  executeAfterBuildPlugins(programInfo);
}

module.exports = serve;

const fs = require('fs');
const path = require('path');

const chokidar = require('chokidar');

const ads = require('../abell-dev-server');
const {
  getProgramInfo,
  getAbellConfig,
  buildTemplateTree,
  buildContentTree,
  getSourceNodeFromPluginNode
} = require('../utils/build-utils.js');

const {
  executeBeforeBuildPlugins,
  executeAfterBuildPlugins,
  colors,
  exitHandler,
  clearLocalRequireCache,
  logError
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

  /**
   * Trigger on abell.config.js changed
   * @param {String} filePath
   */
  const onAbellConfigChanged = (filePath) => {
    // Read New abell.config.js
    // set globalMeta to programInfo
    console.log('Abell Config Changed ⚙️');
    const newAbellConfig = getAbellConfig();
    programInfo.abellConfig.globalMeta = newAbellConfig.globalMeta;
    generateSite(programInfo);
    ads.reload();
  };

  /**
   * Trigger on anything inside 'theme' directory is changed
   * @param {Object} event
   * @param {String} filePath
   */
  const onThemeChanged = (event, filePath) => {
    console.log('Theme Changed 💅');

    // if file is js or json, we have to make sure the file is not in require cache
    if (filePath.endsWith('.js') || filePath.endsWith('.json')) {
      clearLocalRequireCache(programInfo.abellConfig.themePath);
    }

    // if new file is added/removed, we have to recalculate template tree
    if (event !== 'change') {
      programInfo.templateTree = buildTemplateTree(
        programInfo.abellConfig.themePath
      );
    }

    generateSite(programInfo);
    ads.reload();
  };

  /**
   * Trigger on anything inside 'content' is changed.
   * 1. if meta.json changed, rebuild contentTree
   * 2. if content add/remove, rebuild contentTree
   * 3. if .md changed, rebuild HTML page of that particular blog
   * @param {Event} event
   * @param {String} filePath
   */
  const onContentChanged = (event, filePath) => {
    // build content tree again on add/remove
    console.log(
      `📄 >> Event '${event}' in ${path.relative(process.cwd(), filePath)}`
    );

    const isFileMeta =
      filePath.endsWith('meta.json') || filePath.endsWith('meta.js');

    if (isFileMeta || (event !== 'change' && !isFileMeta)) {
      // rebuild contentTree but do not remove content from plugins
      programInfo.contentTree = buildContentTree(
        programInfo.abellConfig.contentPath,
        {
          keepPluginContent: true,
          existingTree: programInfo.contentTree
        }
      );
    }

    // if file changed is meta.json or meta.js
    if (isFileMeta) {
      delete require.cache[filePath]; // remove existing meta.json from cache
      generateSite(programInfo);
      ads.reload();
    } else if (filePath.endsWith('.md')) {
      const loopableTemplates = Object.values(programInfo.templateTree).filter(
        (template) => template.shouldLoop
      );
      console.log(loopableTemplates);
    }
  };

  /** LISTENERS! */
  const configPath = path.join(process.cwd(), 'abell.config.js');

  if (fs.existsSync(configPath)) {
    chokidar
      .watch(configPath, chokidarOptions)
      .on('change', onAbellConfigChanged);
  }

  if (fs.existsSync(programInfo.abellConfig.contentPath)) {
    chokidar
      .watch(programInfo.abellConfig.contentPath, chokidarOptions)
      .on('all', (event, filePath) => {
        // error handling
        try {
          onContentChanged(event, filePath);
        } catch (err) {
          console.log(err);
          logError(err.message);
        }
      });
  }

  chokidar
    .watch(programInfo.abellConfig.themePath, chokidarOptions)
    .on('all', (event, filePath) => {
      // error handling
      try {
        onThemeChanged(event, filePath);
      } catch (err) {
        console.log(err);
        logError(err.message);
      }
    });

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

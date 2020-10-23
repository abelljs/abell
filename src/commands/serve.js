const fs = require('fs');
const path = require('path');
const os = require('os');

const chokidar = require('chokidar');

const ads = require('../abell-dev-server');
const {
  getProgramInfo,
  getAbellConfig,
  buildTemplateMap,
  buildContentMap,
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

const { generateSite, createHTMLFile } = require('../utils/generate-site.js');
const { clearBundleCache } = require('../utils/abell-bundler');
const { getFirstLine, rmdirRecursiveSync } = require('../utils/abell-fs');

/**
 *
 * @desc get network address
 * @return {Number} address
 */
function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      const { address, family, internal } = interface;
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }
}

/**
 *
 * @param {ProgramInfo} programInfo
 */
async function runDevServer(programInfo) {
  // Runs Dev server with all the watchers etc.
  console.log('Starting abell-dev-server 🤠...');

  const adsResult = await ads.create({
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
  console.log('\n\n💫  Abell dev server running.');
  console.log(
    `${colors.boldGreen('Local: ')} http://localhost:${
      adsResult.httpServer.address().port
    }`
  );
  console.log(
    `${colors.boldGreen('Network: ')} http://${getNetworkAddress()}:${
      adsResult.httpServer.address().port
    } \n\n`
  );
  console.log('='.repeat(process.stdout.columns));

  /** WATCHERS!! */

  /**
   * Trigger on abell.config.js changed
   * @param {String} filePath
   */
  const onAbellConfigChanged = async (filePath) => {
    // Read New abell.config.js
    // set globalMeta to programInfo
    console.log('\n⚙️  Abell Config Changed');
    const newAbellConfig = getAbellConfig();
    programInfo.abellConfig.globalMeta = newAbellConfig.globalMeta;
    await generateSite(programInfo);
    ads.reload();
    console.log(colors.boldGreen('>') + ' Site Rebuilt');
  };

  /**
   * Trigger on anything inside 'theme' directory is changed
   * @param {Object} event
   * @param {String} filePath
   */
  const onThemeChanged = async (event, filePath) => {
    console.log(
      `\n💅 Event '${event}' in ${path.relative(process.cwd(), filePath)}`
    );
    // if file is js or json, we have to make sure the file is not in require cache
    if (filePath.endsWith('.js') || filePath.endsWith('.json')) {
      clearLocalRequireCache(programInfo.abellConfig.themePath);
    }

    const isAbellComponent = !event.includes('unlink')
      ? getFirstLine(filePath).trim().includes('<AbellComponent>')
      : false;

    // if new file is added/removed, we have to recalculate template tree
    if (event !== 'change' || isAbellComponent) {
      programInfo.templateMap = buildTemplateMap(
        programInfo.abellConfig.themePath
      );
    }

    await generateSite(programInfo);
    ads.reload();
    console.log(colors.boldGreen('>') + ' Files Rebuilt');
  };

  /**
   * Trigger on anything inside 'content' is changed.
   * 1. if meta.json changed, rebuild contentMap
   * 2. if content add/remove, rebuild contentMap
   * 3. if .md changed, rebuild HTML page of that particular blog
   * @param {Event} event
   * @param {String} filePath
   */
  const onContentChanged = async (event, filePath) => {
    // build content tree again on add/remove
    console.log(
      `\n📄 Event '${event}' in ${path.relative(process.cwd(), filePath)}`
    );

    const isFileMeta =
      filePath.endsWith('meta.json') || filePath.endsWith('meta.js');

    if (event !== 'change' || isFileMeta) {
      // rebuild contentMap but do not remove content from plugins

      delete require.cache[filePath]; // remove existing meta.json from cache

      programInfo.contentMap = buildContentMap(
        programInfo.abellConfig.contentPath,
        {
          keepPluginContent: true,
          existingTree: programInfo.contentMap
        }
      );

      await generateSite(programInfo);
      ads.reload();
      console.log(colors.boldGreen('>') + ' Files Rebuilt');
    } else if (filePath.endsWith('.md')) {
      const content =
        programInfo.contentMap[
          path.relative(
            programInfo.abellConfig.contentPath,
            path.dirname(filePath)
          )
        ];

      if (!content) {
        // This block is for *idk what happened but lets rebuild whole thing anyway*
        await generateSite(programInfo);
        console.log(colors.boldGreen('>') + ' Files Rebuilt');
      } else if (Object.keys(content).length < 1) {
        // if the content does not have values,
        // it means something is wrong. So we fallback to full website build
        // This will usually happen when index.md is in root of 'content/' directory
        await generateSite(programInfo);
        console.log(colors.boldGreen('>') + ' Files Rebuilt');
      } else {
        // if file is markdown content
        // Only build the files that have that content
        const loopableTemplates = Object.values(programInfo.templateMap).filter(
          (template) => template.shouldLoop
        );

        clearBundleCache({ ofBundle: content.$path });
        for (const template of loopableTemplates) {
          await createHTMLFile(template, programInfo, {
            isContent: true,
            content
          });
        }

        console.log(`${colors.boldGreen('>')} Rebuilt ${content.$path}`);
      }

      ads.reload();
    } else {
      await generateSite(programInfo);
      ads.reload();
      console.log(colors.boldGreen('>') + ' Files Rebuilt');
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
      onThemeChanged(event, filePath).catch((err) => {
        console.log(err);
        logError(err.message);
      });
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
    programInfo.contentMap[pluginNode.slug] = getSourceNodeFromPluginNode(
      pluginNode
    );
  };

  programInfo.ignorePlugins = command.ignorePlugins;

  if (!programInfo.ignorePlugins) {
    await executeBeforeBuildPlugins(programInfo, { createContent });
  }

  programInfo.port = command.port;
  programInfo.logs = 'minimum';
  programInfo.task = 'serve';
  programInfo.abellConfig.outputPath = '.debug';

  // Build initial site before serving
  try {
    await generateSite({ ...programInfo, logs: 'complete' });
  } catch (err) {
    console.log(err);
    logError('Abell Build Failed 😭 Detailed logs above.\n');
    rmdirRecursiveSync(programInfo.abellConfig.outputPath);
    process.exit(0);
  }

  if (!programInfo.ignorePlugins) {
    await executeAfterBuildPlugins(programInfo);
  }

  runDevServer(programInfo);
}

module.exports = serve;

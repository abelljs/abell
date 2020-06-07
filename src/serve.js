const fs = require('fs');
const path = require('path');

const chokidar = require('chokidar');

const ads = require('./abell-dev-server/server.js');
const { exitHandler, boldGreen, boldRed } = require('./helpers.js');
const {
  generateContentFile,
  getBaseProgramInfo,
  getContentMeta,
  loadContent
} = require('./content-generator');
const build = require('./build.js');
/**
 * @typedef {import('./content-generator').ProgramInfo} ProgramInfo
 */

/**
 * Starts a dev-server!
 * 1. The build parameters are first calculated in index.js
 * 2. While building ProgramInfo we change destinationPath to .debug
 * 3. Starts a server abell-dev-server/server.js
 * 4. Chokidar starts watching over all the files in src and content dir
 * 5. The particular content is rebuild and a complete rebuild is used as fallback
 *
 * @param {ProgramInfo} programInfo
 * @return {void}
 */
function serve(programInfo) {
  build(programInfo);

  console.log('Starting your abell-dev-server 🤠...');

  ads.create({
    port: programInfo.port,
    socketPort: 3000,
    path: programInfo.abellConfigs.destinationPath
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
    `${boldGreen('Local: ')} http://localhost:${programInfo.port} \n\n`
  );
  console.log('='.repeat(process.stdout.columns));

  const abellConfigsPath = path.join(process.cwd(), 'abell.config.js');

  /* Event handlers */
  const onAbellConfigChanged = (filePath) => {
    const baseProgramInfo = getBaseProgramInfo();
    // destination should be unchanged while serving.
    // So we keep existing destination in temp variable.
    const existingDestination = programInfo.abellConfigs.destinationPath;
    programInfo.abellConfigs = baseProgramInfo.abellConfigs;
    programInfo.abellConfigs.destinationPath = existingDestination;
    programInfo.vars.globalMeta = baseProgramInfo.vars.globalMeta;

    console.log('Abell configs changed 🤓');

    build(programInfo);
    ads.reload();
  };

  const onThemeChanged = (event, filePath) => {
    const directoryName = path.dirname(
      path.relative(programInfo.abellConfigs.sourcePath, filePath)
    );

    const isFileCached = require.cache[filePath];
    if (isFileCached) {
      console.log(
        `>> Refreshing ${path.relative(
          programInfo.abellConfigs.sourcePath,
          filePath
        )} from cache`
      );

      delete require.cache[filePath];
    }

    if (filePath.endsWith('index.abell') && directoryName === '[$path]') {
      // Content template changed
      programInfo.contentTemplate = fs.readFileSync(
        programInfo.contentTemplatePath,
        'utf-8'
      );
    }

    if (filePath.endsWith('.js')) {
      // JS Files required in .abell file are cached by nodejs for instance
      // so we remove the cache in case a js file is changed and is cached.
      delete require.cache[filePath];
    }

    try {
      build(programInfo);
      ads.reload();
    } catch (err) {
      if (err.message.includes('is not defined')) {
        console.log(err.stack);
        console.error(`${boldRed('>> Build Failed 😭')} ${err}`);
      }
    }
  };

  const onContentChanged = (event, filePath) => {
    console.log(
      `>> Event '${event}' emitted from ${path.relative(
        process.cwd(),
        filePath
      )}`
    );

    try {
      if (event !== 'change') {
        // If anything but change happens, add, addDir, unlink etc. We recalculate directories
        const { contentDirectories, $contentArray, $contentObj } = loadContent(
          programInfo.abellConfigs.contentPath
        );
        programInfo.contentDirectories = contentDirectories;
        programInfo.vars.$contentArray = $contentArray;
        programInfo.vars.$contentObj = $contentObj;

        build(programInfo);
        ads.reload();

        return;
      }

      const directoryName = path.dirname(
        path.relative(programInfo.abellConfigs.contentPath, filePath)
      );

      if (filePath.endsWith('index.md')) {
        generateContentFile(directoryName, programInfo);
        console.log(`...Built ${directoryName}`);
      } else if (
        filePath.endsWith('meta.json') ||
        filePath.endsWith('meta.js')
      ) {
        if (filePath.endsWith('meta.js')) {
          // js files are cached by require (we read json with fs.read so they are not cached)
          delete require.cache[filePath];
        }

        // refetch meta and then build
        const meta = getContentMeta(
          programInfo.abellConfigs.contentPath,
          directoryName
        );
        programInfo.vars.$contentObj[directoryName] = meta;

        // prettier-ignore
        programInfo.vars.$contentArray = 
          Object.values(programInfo.vars.$contentObj)
            .sort((a, b) =>
              a.$createdAt.getTime() > b.$createdAt.getTime() ? -1 : 1
            );

        // prettier-ignore
        const indexToChange = programInfo.vars.$contentArray
          .findIndex((content) => content.$slug == directoryName);
        programInfo.vars.$contentArray[indexToChange] = meta;
        build(programInfo);
      } else {
        build(programInfo);
      }

      ads.reload();
    } catch (err) {
      if (err.message.includes('is not defined')) {
        console.log(err);
        console.error(`${boldRed('>> Build Failed 😭')} ${err}`);
      } else {
        console.log(
          'Something did not happen as expected, Falling back to complete build'
        );
        build(programInfo);
        ads.reload();
      }
    }
  };

  if (fs.existsSync(abellConfigsPath)) {
    // Watch abell.config.js
    chokidar
      .watch(abellConfigsPath, chokidarOptions)
      .on('change', onAbellConfigChanged);
  }

  // Watch 'theme'
  chokidar
    .watch(programInfo.abellConfigs.sourcePath, chokidarOptions)
    .on('all', onThemeChanged);

  // Watch 'content'
  chokidar
    .watch(programInfo.abellConfigs.contentPath, chokidarOptions)
    .on('all', onContentChanged);

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

module.exports = serve;

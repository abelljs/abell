const fs = require("fs");
const path = require("path");

const chokidar = require("chokidar");

const ads = require("./abell-dev-server/server.js");

const {
  rmdirRecursiveSync,
  copyFolderSync,
  exitHandler,
  boldGreen,
  getAbellFiles,
} = require("./helpers.js");

const {
  generateContentFile,
  generateHTMLFile,
  getBaseProgramInfo,
  getContentMeta,
} = require("./content-generator");

/**
 * @typedef {import('./content-generator').ProgramInfo} ProgramInfo
 */

/**
 * Builds the static site!
 * The build parameters are first calculated in index.js
 * and the programInfo with all those parameters is passed
 *
 * @param {ProgramInfo} programInfo
 * @return {void}
 */
function build(programInfo) {
  if (programInfo.logs == "complete") console.log("\n>> Abell Build Started\n");

  const abellFiles = getAbellFiles(
    programInfo.abellConfigs.sourcePath,
    programInfo.templateExtension
  );

  // Refresh dist
  rmdirRecursiveSync(programInfo.abellConfigs.destinationPath);
  fs.mkdirSync(programInfo.abellConfigs.destinationPath);

  // Copy everything from src to dist except [$slug] folder and index.abell.
  copyFolderSync(
    programInfo.abellConfigs.sourcePath,
    programInfo.abellConfigs.destinationPath
  );
  rmdirRecursiveSync(
    path.join(programInfo.abellConfigs.destinationPath, "[$slug]")
  );

  abellFiles.map((filePath) => {
    fs.unlinkSync(
      path.join(programInfo.abellConfigs.destinationPath, `${filePath}.abell`)
    );
  });

  // GENERATE CONTENT HTML FILES
  for (const contentSlug of programInfo.contentDirectories) {
    generateContentFile(contentSlug, programInfo);
    if (programInfo.logs == "complete") console.log(`...Built ${contentSlug}`);
  }

  /**
   * TODO: Generate other HTML files from directory just like index.abell
   */

  // GENERATE OTHER HTML FILES
  abellFiles.map((file) => {
    generateHTMLFile(file, programInfo);
    if (programInfo.logs == "complete") console.log(`...Built ${file}\n`);
  });

  if (programInfo.logs == "minimum") {
    console.log(`${boldGreen(">>>")} Files built.. ✨`);
  }
}

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

  console.log("Starting your abell-dev-server 🤠...");

  ads.create({
    port: programInfo.port,
    socketPort: 3000,
    path: programInfo.abellConfigs.destinationPath,
  });

  const chokidarOptions = {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 600,
      pollInterval: 100,
    },
  };

  // Print ports on screen
  console.log("=".repeat(process.stdout.columns));
  console.log("\n\n💫 Abell dev server running.");
  console.log(
    `${boldGreen("Local: ")} http://localhost:${programInfo.port} \n\n`
  );
  console.log("=".repeat(process.stdout.columns));

  const abellConfigsPath = path.join(process.cwd(), "abell.config.js");
  if (fs.existsSync(abellConfigsPath)) {
    // Watch abell.config.js
    chokidar
      .watch(abellConfigsPath, chokidarOptions)
      .on("change", (filePath) => {
        const baseProgramInfo = getBaseProgramInfo();
        // destination should be unchanged while serving.
        // So we keep existing destination in temp variable.
        const existingDestination = programInfo.abellConfigs.destinationPath;
        programInfo.abellConfigs = baseProgramInfo.abellConfigs;
        programInfo.abellConfigs.destinationPath = existingDestination;
        programInfo.vars.globalMeta = baseProgramInfo.vars.globalMeta;

        console.log("Abell configs changed 🤓");

        build(programInfo);
        ads.reload();
      });
  }

  // Watch 'src'
  chokidar
    .watch(programInfo.abellConfigs.sourcePath, chokidarOptions)
    .on("all", (event, filePath) => {
      const directoryName = filePath
        .slice(programInfo.abellConfigs.sourcePath.length + 1)
        .split("/")[0];

      if (
        filePath.endsWith("index" + programInfo.templateExtension) &&
        directoryName === "[$slug]"
      ) {
        // Content template changed
        programInfo.contentTemplate = fs.readFileSync(
          path.join(
            programInfo.abellConfigs.sourcePath,
            "[$slug]",
            "index" + programInfo.templateExtension
          ),
          "utf-8"
        );
      }

      build(programInfo);
      ads.reload();
    });

  // Watch 'content'
  chokidar
    .watch(programInfo.abellConfigs.contentPath, chokidarOptions)
    .on("all", (event, filePath) => {
      console.log(
        `>> Event '${event}' emitted from ${path.relative(
          process.cwd(),
          filePath
        )}`
      );

      try {
        const directoryName = filePath
          .slice(programInfo.abellConfigs.contentPath.length + 1)
          .split("/")[0];

        console.log(filePath);
        if (filePath.endsWith("index.md")) {
          generateContentFile(directoryName, programInfo);
          console.log(`...Built ${directoryName}`);
        } else if (filePath.endsWith("meta.json")) {
          // refetch meta and then build
          const meta = getContentMeta(
            directoryName,
            programInfo.abellConfigs.contentPath
          );
          programInfo.vars.$contentObj[directoryName] = meta;
          const indexToChange = programInfo.vars.$contentArray.findIndex(
            (content) => content.$slug == directoryName
          );
          programInfo.vars.$contentArray[indexToChange] = meta;
          build(programInfo);
        } else {
          build(programInfo);
        }

        ads.reload();
      } catch (err) {
        console.log(
          "Something did not happen as expected, Falling back to complete build"
        );
        console.log(err);
        build(programInfo);
        ads.reload();
      }
    });

  // do something when app is closing
  process.on("exit", exitHandler.bind(null, { cleanup: true }));
  // catches ctrl+c event
  process.on("SIGINT", exitHandler.bind(null, { exit: true }));
  // catches "kill pid" (for example: nodemon restart)
  process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
  process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
  // catches uncaught exceptions
  process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
}

module.exports = { build, serve };

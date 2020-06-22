const fs = require('fs');
const path = require('path');

const {
  rmdirRecursiveSync,
  copyFolderSync,
  boldGreen,
  recursiveFindFiles
} = require('../utils/helpers.js');

const {
  generateContentFile,
  generateHTMLFile
} = require('../utils/build-utils');

/**
 * Builds the static site!
 * The build parameters are first calculated in index.js
 * and the programInfo with all those parameters is passed
 *
 * @param {ProgramInfo} programInfo
 * @return {void}
 */
function build(programInfo) {
  if (programInfo.logs == 'complete') console.log('\n>> Abell Build Started\n');

  const abellFiles = recursiveFindFiles(
    programInfo.abellConfigs.sourcePath,
    '.abell'
  );

  // Refresh dist
  rmdirRecursiveSync(programInfo.abellConfigs.destinationPath);
  fs.mkdirSync(programInfo.abellConfigs.destinationPath);

  /** Before Build plugins */
  for (const pluginPath of programInfo.abellConfigs.plugins) {
    const currentPlugin = require(pluginPath);
    if (currentPlugin.beforeBuild) {
      if (programInfo.logs === 'complete') {
        console.log(
          '>> Plugin BeforeBuild: Executing ' +
            path.relative(process.cwd(), pluginPath)
        );
      }
      currentPlugin.beforeBuild(programInfo);
    }
  }

  // GENERATE CONTENT's HTML FILES
  if (programInfo.contentTemplatePaths.length > 0) {
    for (const contentTemplatePath of programInfo.contentTemplatePaths) {
      for (const contentPath of programInfo.contentDirectories) {
        generateContentFile(contentPath, contentTemplatePath, programInfo);
        if (programInfo.logs == 'complete') {
          console.log(`...Built ${contentPath}`);
        }
      }
    }
  }

  // GENERATE OTHER HTML FILES FROM ABELL
  for (const file of abellFiles) {
    const relativePath = path.relative(
      programInfo.abellConfigs.sourcePath,
      file
    );

    if (relativePath.includes('[$path]')) {
      continue;
    }

    // e.g generateHTMLFile('index', programInfo) will build theme/index.abell to dist/index.html
    generateHTMLFile(relativePath, programInfo);

    if (programInfo.logs == 'complete') {
      console.log(`...Built ${relativePath}.html`);
    }
  }

  const importedFiles = Object.keys(require.cache).filter(
    (importedFile) =>
      !path
        .relative(programInfo.abellConfigs.sourcePath, importedFile)
        .startsWith('..')
  );

  const ignoreCopying = [
    ...importedFiles,
    ...[...abellFiles, ...programInfo.contentTemplatePaths].map(
      (withoutExtension) => withoutExtension + '.abell'
    )
  ];

  // Copy everything from src to dist except the ones mentioned in ignoreCopying.
  copyFolderSync(
    programInfo.abellConfigs.sourcePath,
    programInfo.abellConfigs.destinationPath,
    ignoreCopying
  );

  /** After Build plugins */
  for (const pluginPath of programInfo.abellConfigs.plugins) {
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

  if (programInfo.logs == 'minimum') {
    console.log(`${boldGreen('>>>')} Files built.. ✨`);
  }
}

module.exports = build;

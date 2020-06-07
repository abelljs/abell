const fs = require('fs');
const path = require('path');

const {
  rmdirRecursiveSync,
  copyFolderSync,
  boldGreen,
  recursiveFindFiles
} = require('./helpers.js');

const {
  generateContentFile,
  generateHTMLFile
} = require('./content-generator');

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
  if (programInfo.logs == 'complete') console.log('\n>> Abell Build Started\n');

  const abellFiles = recursiveFindFiles(
    programInfo.abellConfigs.sourcePath,
    '.abell'
  );

  // Refresh dist
  rmdirRecursiveSync(programInfo.abellConfigs.destinationPath);
  fs.mkdirSync(programInfo.abellConfigs.destinationPath);
  const ignoreCopying = [
    path.dirname(programInfo.contentTemplatePath),
    path.join(programInfo.abellConfigs.sourcePath, 'components'),
    ...programInfo.abellConfigs.ignoreInBuild.map((relativePath) =>
      path.join(programInfo.abellConfigs.sourcePath, relativePath)
    ),
    ...abellFiles.map((withoutExtension) => withoutExtension + '.abell')
  ];

  // Copy everything from src to dist except the ones mentioned in ignoreCopying.
  copyFolderSync(
    programInfo.abellConfigs.sourcePath,
    programInfo.abellConfigs.destinationPath,
    ignoreCopying
  );

  // GENERATE CONTENT's HTML FILES
  if (fs.existsSync(programInfo.contentTemplatePath)) {
    for (const contentPath of programInfo.contentDirectories) {
      generateContentFile(contentPath, programInfo);
      if (programInfo.logs == 'complete') {
        console.log(`...Built ${contentPath}`);
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

  if (programInfo.logs == 'minimum') {
    console.log(`${boldGreen('>>>')} Files built.. ✨`);
  }
}

module.exports = build;

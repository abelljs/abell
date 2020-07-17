const fs = require('fs');
const path = require('path');

const abellRenderer = require('abell-renderer');

const {
  rmdirRecursiveSync,
  createPathIfAbsent,
  copyFolderSync,
  replaceExtension
} = require('./general-helpers');
const { renderMarkdown, md } = require('./build-utils.js');

/**
 * Creates HTML file from given parameters
 * @param {Object} templateObj content of .abell file
 * @param {ProgramInfo} programInfo path of the output HTML file
 * @param {Object} options
 */
function createHTMLFile(templateObj, programInfo, options) {
  // Creates HTML File
  /**
   * 1. Read .abell template
   * 2. Prepare variables
   * 3. Prepare view and pass variables to importContent
   * 4. abellRenderer.render with abell template and view
   * 5. Write HTML file.
   */

  const abellTemplate = fs.readFileSync(
    path.join(programInfo.abellConfig.themePath, templateObj.$path),
    'utf-8'
  );

  const Abell = {
    globalMeta: programInfo.abellConfig.globalMeta,
    contentArray: Object.values(programInfo.contentTree).sort(
      (a, b) => b.$createdAt.getTime() - a.$createdAt.getTime()
    ),
    contentObj: programInfo.contentTree,
    root: templateObj.$root,
    href: templateObj.$path
  };

  if (options.isContent) {
    // Extra variables when building content
    Abell.root = options.content.$root;
    Abell.href = options.content.$path;
    Abell.meta = options.content;
  }

  const view = {
    Abell: {
      ...Abell,
      importContent: (mdPath) =>
        renderMarkdown(mdPath, programInfo.abellConfig.contentPath, { Abell })
    }
  };

  if (options.isContent && options.content.$source === 'plugin') {
    if (options.content.content) {
      view.Abell.importContent = () => md.render(options.content.content);
    } else {
      console.log(
        `>> Content ${options.content.$slug} does not have a markdown content`
      );
    }
  }

  const htmlOut = abellRenderer.render(abellTemplate, view, {
    allowRequire: true,
    basePath: path.join(
      programInfo.abellConfig.themePath,
      path.dirname(templateObj.$path)
    )
  });

  createPathIfAbsent(
    path.join(
      programInfo.abellConfig.outputPath,
      path.dirname(templateObj.$path).replace('[$path]', Abell.href)
    )
  );

  const outPath = path.join(
    programInfo.abellConfig.outputPath,
    replaceExtension(templateObj.$path, '.html').replace('[$path]', Abell.href)
  );

  fs.writeFileSync(outPath, htmlOut);
}

/**
 * Builds site
 * @param {ProgramInfo} programInfo
 */
function generateSite(programInfo) {
  // Builds site from given program information
  if (programInfo.logs == 'complete') console.log('\n>> Abell Build Started\n');

  // Refresh dist
  rmdirRecursiveSync(programInfo.abellConfig.outputPath);
  fs.mkdirSync(programInfo.abellConfig.outputPath);

  for (const template of Object.values(programInfo.templateTree)) {
    if (template.shouldLoop) {
      for (const content of Object.values(programInfo.contentTree)) {
        // loop over content
        createHTMLFile(template, programInfo, { isContent: true, content });
      }
      continue;
    }

    createHTMLFile(template, programInfo, {});
  }

  const importedFiles = Object.keys(require.cache).filter(
    (importedFile) =>
      !path
        .relative(programInfo.abellConfig.themePath, importedFile)
        .startsWith('..')
  );

  const ignoreCopying = [
    ...importedFiles,
    ...Object.keys(programInfo.templateTree).map((relativePath) =>
      path.join(programInfo.abellConfig.themePath, relativePath)
    )
  ];

  // Copy everything from src to dist except the ones mentioned in ignoreCopying.
  copyFolderSync(
    programInfo.abellConfig.themePath,
    programInfo.abellConfig.outputPath,
    ignoreCopying
  );
}

module.exports = { createHTMLFile, generateSite };

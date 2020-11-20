const fs = require('fs');
const path = require('path');

const abellRenderer = require('abell-renderer');

const {
  rmdirRecursiveSync,
  createPathIfAbsent,
  copyFolderSync,
  recursiveFindFiles
} = require('./abell-fs.js');

const { renderMarkdown, md } = require('./build-utils.js');

const { createBundles, clearBundleCache } = require('./abell-bundler.js');
const {
  executeBeforeHTMLWritePlugins,
  standardizePath
} = require('./general-helpers.js');

/**
 * Hashmap of template content for memoization
 */
const templateHashmap = {};

/**
 * Creates HTML file from given parameters
 * @param {TemplateMap} templateObj template tree of .abell file
 * @param {ProgramInfo} programInfo path of the output HTML file
 * @param {Object} options
 * @param {Boolean} options.isContent
 * @param {MetaInfo} options.content
 */
async function createHTMLFile(templateObj, programInfo, options) {
  // Creates HTML File
  /**
   * 1. Read .abell template
   * 2. Prepare variables
   * 3. Prepare view and pass variables to importContent
   * 4. abellRenderer.render with abell template and view
   * 5. Write HTML file.
   */

  let abellTemplate;
  if (templateObj.templatePath in templateHashmap) {
    // Read from hashmap
    abellTemplate = templateHashmap[templateObj.templatePath];
  } else {
    // New fetch
    abellTemplate = fs.readFileSync(
      path.join(programInfo.abellConfig.themePath, templateObj.templatePath),
      'utf-8'
    );

    if (programInfo.task === 'build') {
      // only use hashmaps in build. In serve, we have to refetch values.
      templateHashmap[templateObj.templatePath] = abellTemplate;
    }
  }

  const Abell = {
    globalMeta: programInfo.abellConfig.globalMeta,
    contentArray: Object.values(programInfo.contentMap).sort(
      (a, b) => b.$createdAt.getTime() - a.$createdAt.getTime()
    ),
    contentObj: programInfo.contentMap,
    programInfo: {
      themePath: programInfo.abellConfig.themePath,
      outputPath: programInfo.abellConfig.outputPath,
      contentPath: programInfo.abellConfig.contentPath,
      task: programInfo.task
    },
    $root: standardizePath(templateObj.$root),
    $path: standardizePath(templateObj.htmlPath.replace(/index\.html/g, ''))
  };

  if (options.isContent) {
    // Extra variables when building content
    Abell.meta = options.content;
    Abell.$root = Abell.meta.$root;
    Abell.$path = Abell.meta.$path;
  }

  const view = {
    Abell: {
      ...Abell,
      importContent: (mdPath) =>
        renderMarkdown(path.join(programInfo.abellConfig.contentPath, mdPath), {
          Abell
        })
    }
  };

  if (options.isContent && options.content.$source === 'plugin') {
    if (options.content.content) {
      // If it comes from plugin, content is supposed to have content property
      // In this case, we override importContent to always return the rendererd content
      // from plugin.
      view.Abell.importContent = (mdPath) => {
        if (
          path.resolve(mdPath) ===
          path.resolve(path.join(options.content.slug, 'index.md'))
        ) {
          if (options.content.contentType === 'html') {
            return options.content.content;
          }

          return md.render(options.content.content);
        } else {
          try {
            return renderMarkdown(
              path.join(programInfo.abellConfig.contentPath, mdPath),
              {
                Abell
              }
            );
          } catch (err) {
            console.log('Markdown file not found.');
            throw err;
          }
        }
      };
    } else {
      console.log(
        `>> Content ${options.content.$slug} does not have a markdown content`
      );
    }
  }

  const sourceThemePath = path.join(
    programInfo.abellConfig.themePath,
    templateObj.templatePath
  );

  let { html: htmlOut, components } = abellRenderer.render(
    abellTemplate,
    view,
    {
      allowRequire: true,
      allowComponents: true,
      filename: path.relative(process.cwd(), sourceThemePath),
      basePath: path.dirname(sourceThemePath)
    }
  );

  const outPath = path.normalize(
    path.join(
      programInfo.abellConfig.outputPath,
      templateObj.htmlPath.replace('[path]', Abell.$path)
    )
  );

  createPathIfAbsent(path.dirname(outPath));

  if (components && components.length > 0) {
    htmlOut = createBundles({
      htmlOut,
      outPath,
      components,
      programInfo
    });
  }

  // Execute beforeHTMLWrite plugins if the --ignore-plugins flag is not passed
  if (!programInfo.command.ignorePlugins) {
    htmlOut = await executeBeforeHTMLWritePlugins(htmlOut, programInfo);
  }

  // Write into .html file
  fs.writeFileSync(outPath, htmlOut);
  if (programInfo.logs === 'complete') {
    console.log(
      `...Built ${path.relative(programInfo.abellConfig.outputPath, outPath)}`
    );
  }

  if (options.isContent && options.content) {
    // Copy 'assets' folder from content, if exist.
    const fromPath = path.join(
      programInfo.abellConfig.contentPath,
      options.content.$path,
      'assets'
    );
    const toPath = path.join(
      programInfo.abellConfig.outputPath,
      options.content.$path,
      'assets'
    );

    if (fs.existsSync(fromPath)) {
      copyFolderSync(fromPath, toPath);
    }
  }
}

/**
 * Builds site
 * @param {ProgramInfo} programInfo
 */
async function generateSite(programInfo) {
  // Builds site from given program information
  if (programInfo.logs == 'complete') console.log('\n>> Abell Build Started\n');

  // Refresh dist
  rmdirRecursiveSync(programInfo.abellConfig.outputPath);
  fs.mkdirSync(programInfo.abellConfig.outputPath);

  clearBundleCache();

  for (const template of Object.values(programInfo.templateMap)) {
    if (template.shouldLoop) {
      for (const content of Object.values(programInfo.contentMap)) {
        // loop over content
        await createHTMLFile(template, programInfo, {
          isContent: true,
          content
        });
      }
      continue;
    }

    await createHTMLFile(template, programInfo, {});
  }

  // We have to ignore all the files that are require()d inside .abell file
  // So we find these files in require cache
  const importedFiles = Object.keys(require.cache).filter(
    (importedFile) =>
      !path
        .relative(programInfo.abellConfig.themePath, importedFile)
        .startsWith('..')
  );

  const ignoreCopying = [
    ...importedFiles,
    ...recursiveFindFiles(programInfo.abellConfig.themePath, '.abell')
  ];

  // Copy everything from src to dist except the ones mentioned in ignoreCopying.
  copyFolderSync(
    programInfo.abellConfig.themePath,
    programInfo.abellConfig.outputPath,
    ignoreCopying
  );
}

module.exports = { createHTMLFile, generateSite };

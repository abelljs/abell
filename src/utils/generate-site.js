const fs = require('fs');
const path = require('path');

const abellRenderer = require('abell-renderer');

const {
  rmdirRecursiveSync,
  createPathIfAbsent,
  copyFolderSync,
  replaceExtension
} = require('./abell-fs.js');

const {
  renderMarkdown,
  md,
  addPrefixInHTMLPaths
} = require('./build-utils.js');

/**
 * Recursive function that unwraps components and adds them to respective files
 * @param {Object} components Array of all components
 * @param {Array} prev Holds previous array for recursion
 * @return {Array}
 */
function bundleComponentContent(components, prev = []) {
  if (components.length <= 0) {
    return prev;
  }

  const out = [];

  for (const component of components) {
    for (const style of component.styles) {
      if (style.attributes.inlined === true) {
        prev.push({
          type: 'style',
          inlined: true,
          content: style.content,
          attributes: style.attributes
        });
      } else if (style.attributes.bundle) {
        prev.push({
          type: 'style',
          inlined: false,
          bundle: path.join(
            process.cwd(),
            'bundled-css',
            style.attributes.bundle
          ),
          content: style.content,
          attributes: style.attributes
        });
      } else {
        prev.push({
          type: 'style',
          inlined: false,
          bundle: path.join(process.cwd(), 'bundled-css', 'main.abell.css'),
          content: style.content,
          attributes: style.attributes
        });
      }
    }

    for (const script of component.scripts) {
      if (script.attributes.inlined === true) {
        prev.push({
          type: 'script',
          inlined: true,
          content: script.content,
          attributes: script.attributes
        });
      } else if (script.attributes.bundle) {
        prev.push({
          type: 'script',
          inlined: false,
          bundle: path.join(
            process.cwd(),
            'bundled-js',
            script.attributes.bundle
          ),
          content: script.content,
          attributes: script.attributes
        });
      } else {
        prev.push({
          type: 'script',
          inlined: false,
          bundle: path.join(process.cwd(), 'bundled-js', 'main.abell.js'),
          content: script.content,
          attributes: script.attributes
        });
      }
    }

    out.push(...bundleComponentContent(component.components, prev));
  }

  return out;
}

/**
 * Creates HTML file from given parameters
 * @param {TemplateTree} templateObj template tree of .abell file
 * @param {ProgramInfo} programInfo path of the output HTML file
 * @param {Object} options
 * @param {Boolean} options.isContent
 * @param {MetaInfo} options.content
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
    $root: templateObj.$root,
    $path: templateObj.$path
  };

  if (options.isContent) {
    // Extra variables when building content
    Abell.$root = options.content.$root;
    Abell.$path = options.content.$path;
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
      // If it comes from plugin, content is supposed to have content property
      // In this case, we override importContent to always return the rendererd content
      // from plugin.
      view.Abell.importContent = () => {
        if (options.content.contentType === 'html') {
          return options.content.content;
        }

        return md.render(options.content.content);
      };
    } else {
      console.log(
        `>> Content ${options.content.$slug} does not have a markdown content`
      );
    }
  }

  const sourceThemePath = path.join(
    programInfo.abellConfig.themePath,
    templateObj.$path
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

  if (components && components.length > 0) {
    console.log(bundleComponentContent(components));
  }

  if (options.isContent && options.content.$path.includes(path.sep)) {
    htmlOut = addPrefixInHTMLPaths(htmlOut, options.content.$root.slice(0, -3));
  }

  createPathIfAbsent(
    path.join(
      programInfo.abellConfig.outputPath,
      path.dirname(templateObj.$path).replace('[$path]', Abell.$path)
    )
  );

  const outPath = path.join(
    programInfo.abellConfig.outputPath,
    replaceExtension(templateObj.$path, '.html').replace('[$path]', Abell.$path)
  );

  // Write into .html file
  fs.writeFileSync(outPath, htmlOut);

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

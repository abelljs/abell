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
function getComponentBundles(
  components,
  prev = { inlinedStyles: '', inlinedScripts: '' }
) {
  if (components.length <= 0) {
    return prev;
  }

  let out = [];

  for (const component of components) {
    for (const style of component.styles) {
      if (style.attributes.inlined === true) {
        prev.inlinedStyles += style.content;
      } else if (style.attributes.bundle) {
        const bundlePath = path.join('bundled-css', style.attributes.bundle);
        if (!prev[bundlePath]) {
          prev[bundlePath] = '';
        }
        prev[bundlePath] += style.content;
      } else {
        const bundlePath = path.join('bundled-css', 'main.abell.css');
        if (!prev[bundlePath]) {
          prev[bundlePath] = '';
        }
        prev[bundlePath] += style.content;
      }
    }

    for (const script of component.scripts) {
      if (script.attributes.inlined === true) {
        prev.inlinedScripts += style.content;
      } else if (script.attributes.bundle) {
        const bundlePath = path.join('bundled-js', script.attributes.bundle);
        if (!prev[bundlePath]) {
          prev[bundlePath] = '';
        }
        prev[bundlePath] += script.content;
      } else {
        const bundlePath = path.join('bundled-js', 'main.abell.js');
        if (!prev[bundlePath]) {
          prev[bundlePath] = '';
        }
        prev[bundlePath] += script.content;
      }
    }

    out = { ...getComponentBundles(component.components, prev) };
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
    const bundleMap = getComponentBundles(components);
    for (let [bundlePath, bundleContent] of Object.entries(bundleMap)) {
      if (bundlePath === 'inlinedStyles') {
        // inline the bundleContent inside HTML in style
      } else if (bundlePath === 'inlinedScripts') {
        // inline the bundleContent in HTML in script
      } else {
        bundlePath = path.join(programInfo.abellConfig.outputPath, bundlePath);
        createPathIfAbsent(path.dirname(bundlePath));
        // append bundleContent into bundlePath and add <script src> or <style href> depending on extension
        if (fs.existsSync(bundlePath)) {
          fs.writeFileSync(bundlePath, bundleContent);
        } else {
          fs.appendFileSync(bundlePath, bundleContent);
        }
      }
    }
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

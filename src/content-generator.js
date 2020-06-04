const fs = require('fs');
const path = require('path');

const abellRenderer = require('abell-renderer');
const { Remarkable } = require('remarkable');
const md = new Remarkable({
  html: true
});

md.use(require('./remarkable-plugins/anchors.js'));

const {
  createPathIfAbsent,
  getAbellConfigs,
  prefetchLinksAndAddToPage,
  recursiveFindFiles,
  addPrefixInHTMLPaths,
  copyFolderSync
} = require('./helpers.js');

/**
 *
 * @typedef {Object} MetaInfo - Meta information from meta.json file in content dir
 * @property {String} $slug - slug of content
 * @property {Date} $createdAt - Date object with time of content creation
 * @property {Date} $modifiedAt - Date object with time of last modification
 *
 * @typedef {Object} ProgramInfo - Contains all the information required by the build to execute.
 * @property {import('./helpers.js').AbellConfigs} abellConfigs
 *  - Configuration from abell.config.js file
 * @property {String} contentTemplate - string of the template from [$slug]/index.abell file
 * @property {String} contentTemplatePath - path of the template (mostly [$slug]/index.abell file
 * @property {Object} vars - all global variables in .abell files
 * @property {MetaInfo[]} vars.$contentArray - An array of all MetaInfo
 * @property {Object} vars.$contentObj - Content meta info object
 * @property {Object} vars.globalMeta - meta info to be injected into .abell files
 * @property {Array} contentDirectories - List of names of all directories in content directory
 * @property {String} logs - logs in the console ('minimum', 'complete')
 * @property {String} templateExtension - extension of input file ('.abell' default)
 *
 */

/**
 * On given slug and base path of content folder,
 * returns object with all the meta information
 * @param {string} contentPath path to content directory
 * @param {string} contentDir slug of content
 * @return {MetaInfo}
 */
function getContentMeta(contentPath, contentDir) {
  let mtime;
  let ctime;

  const slug = path.basename(contentDir);
  const defaultMeta = {
    title: slug,
    description: `Hi, This is ${slug}...`
  };

  let metaData = {};
  if (fs.existsSync(path.join(contentPath, contentDir, 'meta.json'))) {
    metaData = JSON.parse(
      fs.readFileSync(path.join(contentPath, contentDir, 'meta.json'), 'utf-8')
    );
  } else if (fs.existsSync(path.join(contentPath, contentDir, 'meta.js'))) {
    delete require.cache[path.join(contentPath, contentDir, 'meta.js')];
    metaData = require(path.join(contentPath, contentDir, 'meta.js'));
  }

  const meta = {
    ...defaultMeta,
    ...metaData
  };

  ({ mtime, ctime } = fs.statSync(
    path.join(contentPath, contentDir, 'index.md')
  ));

  if (meta.$createdAt) ctime = new Date(meta.$createdAt);
  if (meta.$modifiedAt) mtime = new Date(meta.$modifiedAt);

  return {
    ...meta,
    $slug: slug,
    $modifiedAt: mtime,
    $createdAt: ctime,
    $path: contentDir
  };
}

/**
 * Returns meta informations of all the contents when directories is given
 * @param {Array} contentDirectories an array with names of all directories in content folder
 * @param {String} contentPath path to the content directory
 * @return {Object}
 */
function getContentMetaAll(contentDirectories, contentPath) {
  const contentMetaInfo = {};
  for (const contentDir of contentDirectories) {
    contentMetaInfo[contentDir] = getContentMeta(contentPath, contentDir);
  }

  return contentMetaInfo;
}

/**
 * Returns the basic information needed for build execution
 * @return {ProgramInfo}
 */
function getBaseProgramInfo() {
  // Get configured paths of destination and content
  const abellConfigs = getAbellConfigs();
  let contentDirectories;
  let $contentObj;
  let $contentArray;

  if (fs.existsSync(abellConfigs.contentPath)) {
    contentDirectories = recursiveFindFiles(
      abellConfigs.contentPath,
      'index.md'
    ).map((file) => {
      return path.dirname(path.relative(abellConfigs.contentPath, file));
    });

    $contentObj = getContentMetaAll(
      contentDirectories,
      abellConfigs.contentPath
    );
    $contentArray = Object.values($contentObj).sort((a, b) =>
      a.$createdAt.getTime() > b.$createdAt.getTime() ? -1 : 1
    );
  }

  const contentTemplatePath = path.join(
    abellConfigs.sourcePath,
    '[$slug]',
    'index.abell'
  );

  let contentTemplate;
  if (fs.existsSync(contentTemplatePath)) {
    contentTemplate = fs.readFileSync(contentTemplatePath, 'utf-8');
  }

  const programInfo = {
    abellConfigs,
    contentTemplate: contentTemplate || null,
    contentDirectories: contentDirectories || [],
    contentTemplatePath,
    vars: {
      $contentArray: $contentArray || [],
      $contentObj: $contentObj || {},
      globalMeta: abellConfigs.globalMeta
    },
    logs: 'minimum'
  };

  return programInfo;
}

/**
 * 1. Reads .md/.abell file from given path
 * 2. Converts it to html
 * 3. Adds variable to the new HTML and returns the HTML
 *
 * @param {String} mdPath
 * @param {String} contentPath
 * @param {Object} variables
 * @return {String}
 */
function importAndRender(mdPath, contentPath, variables) {
  const fileContent = fs.readFileSync(path.join(contentPath, mdPath), 'utf-8');
  const mdWithValues = abellRenderer.render(fileContent, variables); // Add variables to markdown
  const rendererdHTML = md.render(mdWithValues);
  return rendererdHTML;
}

/**
 *
 * 1. Read Template
 * 2. Render Template with abell-renderer and add variables
 * 3. Write to the destination.
 *
 * @param {String} filepath - filepath relative to source directory
 * @param {ProgramInfo} programInfo - all the information required for build
 * @return {void}
 */
function generateHTMLFile(filepath, programInfo) {
  let pageTemplate = fs.readFileSync(
    path.join(programInfo.abellConfigs.sourcePath, filepath + '.abell'),
    'utf-8'
  );

  if (filepath === 'index') {
    // Add prefetch to index page
    pageTemplate = prefetchLinksAndAddToPage({
      from: programInfo.contentTemplate,
      addTo: pageTemplate
    });
  }

  const variables = programInfo.vars;

  const view = {
    ...variables,
    $importContent: (path) =>
      importAndRender(path, programInfo.abellConfigs.contentPath, variables)
  };

  const pageContent = abellRenderer.render(pageTemplate, view, {
    basePath: path.join(
      programInfo.abellConfigs.sourcePath,
      path.dirname(filepath)
    ),
    allowRequire: true
  });

  fs.writeFileSync(
    path.join(programInfo.abellConfigs.destinationPath, filepath + '.html'),
    pageContent
  );
}

/**
 *  1. Create path
 *  2. Read Markdown
 *  3. Convert to HTML
 *  4. Render content HTML on programInfo.contentTemplate
 *
 * @method generateContentFile
 * @param {String} contentDir
 * @param {ProgramInfo} programInfo all the information required for build
 * @return {void}
 *
 */
function generateContentFile(contentDir, programInfo) {
  // Create Path of content if does not already exist
  createPathIfAbsent(
    path.join(programInfo.abellConfigs.destinationPath, contentDir)
  );

  const variables = {
    ...programInfo.vars,
    $slug: programInfo.vars.$contentObj[contentDir].$slug,
    meta: programInfo.vars.$contentObj[contentDir]
  };

  const view = {
    ...variables,
    $importContent: (path) =>
      importAndRender(path, programInfo.abellConfigs.contentPath, variables)
  };
  let contentAbellTemplate = programInfo.contentTemplate;
  if (contentDir.includes(path.sep)) {
    const pathPrefixArr = contentDir.split(path.sep).map((dir) => '..');
    pathPrefixArr.pop();
    const pathPrefix = pathPrefixArr.join(path.sep);
    contentAbellTemplate = addPrefixInHTMLPaths(
      contentAbellTemplate,
      pathPrefix
    );
  }
  // render HTML of content
  const contentHTML = abellRenderer.render(contentAbellTemplate, view, {
    basePath: path.dirname(programInfo.contentTemplatePath),
    allowRequire: true
  });

  // WRITE IT OUT!! YASSSSSS!!!
  fs.writeFileSync(
    path.join(
      programInfo.abellConfigs.destinationPath,
      contentDir,
      'index.html'
    ),
    contentHTML
  );

  const fromPath = path.join(
    programInfo.abellConfigs.contentPath,
    contentDir,
    'assets'
  );
  const toPath = path.join(
    programInfo.abellConfigs.destinationPath,
    contentDir,
    'assets'
  );

  if (fs.existsSync(fromPath)) {
    copyFolderSync(fromPath, toPath);
  }
}

module.exports = {
  getContentMeta,
  getContentMetaAll,
  getBaseProgramInfo,
  generateContentFile,
  generateHTMLFile,
  importAndRender
};

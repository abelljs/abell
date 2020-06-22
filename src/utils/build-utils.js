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
  recursiveFindFiles,
  copyFolderSync
} = require('./helpers.js');

const {
  addPrefixInHTMLPaths,
  prefetchLinksAndAddToPage
} = require('./transformations.js');

/**
 * @typedef {import('./typedefs.js').MetaInfo}
 * @typedef {import('./typedefs.js').ProgramInfo}
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
    metaData = require(path.join(contentPath, contentDir, 'meta.js'));
  }

  const meta = {
    ...defaultMeta,
    ...metaData
  };

  ({ mtime, ctime } = fs.statSync(path.join(contentPath, contentDir)));

  if (meta.$createdAt) ctime = new Date(meta.$createdAt);
  if (meta.$modifiedAt) mtime = new Date(meta.$modifiedAt);

  return {
    ...meta,
    $slug: slug,
    $modifiedAt: mtime,
    $createdAt: ctime,
    $path: contentDir,
    $root: contentDir
      .split(path.sep)
      .map((dir) => '..')
      .join(path.sep)
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
 * @param {String} contentPath
 * @return {Object} contentInfo
 * @return {String[]} contentInfo.contentDirectories
 * @return {Object} contentInfo.$contentObj
 * @return {MetaInfo[]} contentInfo.$contentArray
 */
function loadContent(contentPath) {
  const contentDirectories = recursiveFindFiles(contentPath, '.md')
    .map((file) => path.dirname(path.relative(contentPath, file)))
    .filter((fileDirectories) => fileDirectories !== '.');

  const $contentObj = getContentMetaAll(contentDirectories, contentPath);
  const $contentArray = Object.values($contentObj).sort((a, b) =>
    a.$createdAt.getTime() > b.$createdAt.getTime() ? -1 : 1
  );

  return { contentDirectories, $contentObj, $contentArray };
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
    ({ contentDirectories, $contentObj, $contentArray } = loadContent(
      abellConfigs.contentPath
    ));
  }

  let contentTemplatePaths = [];
  if (fs.existsSync(path.join(abellConfigs.sourcePath, '[$path]'))) {
    contentTemplatePaths = recursiveFindFiles(
      path.join(abellConfigs.sourcePath, '[$path]'),
      '.abell'
    );
  }

  const indexContentFilePath = contentTemplatePaths.find((templatePath) =>
    templatePath.endsWith('[$path]/index')
  );

  let contentIndexTemplate;
  if (indexContentFilePath) {
    contentIndexTemplate = fs.readFileSync(
      indexContentFilePath + '.abell',
      'utf-8'
    );
  }

  const programInfo = {
    abellConfigs,
    contentIndexTemplate: contentIndexTemplate || '',
    contentDirectories: contentDirectories || [],
    contentTemplatePaths,
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
      from: programInfo.contentIndexTemplate,
      addTo: pageTemplate
    });
  }

  const variables = programInfo.vars;

  const view = {
    ...variables,
    $root: filepath
      .split(path.sep)
      .map((dir) => '..')
      .slice(1)
      .join(path.sep),
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

  createPathIfAbsent(
    path.join(programInfo.abellConfigs.destinationPath, path.dirname(filepath))
  );

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
 * @param {String} contentTemplatePath
 * @param {ProgramInfo} programInfo all the information required for build
 * @return {void}
 *
 */
function generateContentFile(contentDir, contentTemplatePath, programInfo) {
  // Create Path of content if does not already exist
  createPathIfAbsent(
    path.join(programInfo.abellConfigs.destinationPath, contentDir)
  );

  let contentTemplate = programInfo.contentIndexTemplate;
  if (!contentTemplatePath.endsWith(`[$path]${path.sep}index`)) {
    contentTemplate = fs.readFileSync(contentTemplatePath + '.abell', 'utf-8');
  }

  const currentContentData = programInfo.vars.$contentObj[contentDir];
  const variables = {
    ...programInfo.vars,
    $path: currentContentData.$path,
    $root: currentContentData.$root,
    meta: currentContentData
  };

  const view = {
    ...variables,
    $importContent: (path) =>
      importAndRender(path, programInfo.abellConfigs.contentPath, variables)
  };
  // render HTML of content
  let contentHTML = abellRenderer.render(contentTemplate, view, {
    basePath: path.dirname(contentTemplatePath),
    allowRequire: true
  });

  if (contentDir.includes(path.sep)) {
    const pathPrefixArr = contentDir.split(path.sep).map((dir) => '..');
    pathPrefixArr.pop();
    const pathPrefix = pathPrefixArr.join(path.sep);
    contentHTML = addPrefixInHTMLPaths(contentHTML, pathPrefix);
  }

  const relativeOutputPath = path.relative(
    path.join(programInfo.abellConfigs.sourcePath, '[$path]'),
    contentTemplatePath
  );

  // WRITE IT OUT!! YASSSSSS!!!
  fs.writeFileSync(
    path.join(
      programInfo.abellConfigs.destinationPath,
      contentDir,
      relativeOutputPath + '.html'
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
  loadContent,
  getBaseProgramInfo,
  generateContentFile,
  generateHTMLFile,
  importAndRender
};

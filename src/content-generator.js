const fs = require('fs');
const path = require('path');

const abellRenderer = require('abell-renderer');
const {Remarkable} = require('remarkable');
const md = new Remarkable({
  html: true
});

md.use(require('./remarkable-plugins/anchors.js'));

const { 
  createPathIfAbsent, 
  getAbellConfigs,
  getDirectories
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
 * @property {[MetaInfo]} vars.$contentArray - An array of all MetaInfo
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
 * @param {string} contentSlug slug of content
 * @param {string} contentPath path to content directory
 * @return {MetaInfo}
 */
function getContentMeta(contentSlug, contentPath) {
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(path.join(contentPath, contentSlug, 'meta.json'), 'utf-8'));
  } catch (err) {
    meta = {title: contentSlug, description: `Hi, This is ${contentSlug}...`};
  }

  const {mtime, ctime} = fs.statSync(path.join(contentPath, contentSlug, 'index.md'));

  return {
    ...meta, 
    $slug: contentSlug,
    $modifiedAt: mtime,
    $createdAt: ctime
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
  for (const contentSlug of contentDirectories) {
    contentMetaInfo[contentSlug] = getContentMeta(contentSlug, contentPath);
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
  const contentDirectories = getDirectories(abellConfigs.contentPath);
  const $contentObj = getContentMetaAll(contentDirectories, abellConfigs.contentPath);
  const $contentArray = Object.values($contentObj)
    .sort((a, b) => a.$createdAt.getTime() > b.$createdAt.getTime() ? -1 : 1);


  const contentTemplatePath = path.join(
    abellConfigs.sourcePath, 
    '[$slug]', 
    'index' + (abellConfigs.templateExtension || '.abell')
  );
  const contentTemplate = fs.readFileSync(contentTemplatePath, 'utf-8');


  const programInfo = {
    abellConfigs,
    contentTemplate,
    contentDirectories,
    contentTemplatePath,
    vars: {
      $contentArray,
      $contentObj,
      globalMeta: abellConfigs.globalMeta
    },
    logs: 'minimum',
    templateExtension: abellConfigs.templateExtension || '.abell'
  };

  return programInfo;
}


/** 
 * @param {String} from - Path to copy from
 * @param {String} to - Path to paste to
 * Copy assets (images etc) from content folder (`content/my-cool-blog`) to destination folder
 * @return {void}
 */
function copyContentAssets(from, to) {
  // Read names of files from contentSlug
  const filesList = fs.readdirSync(from)
    .filter(val => val !== 'index.md' && val !== 'meta.json');

  for (const filename of filesList) {
    fs.copyFileSync(
      path.join(from, filename), 
      path.join(to, filename)
    );
  }
}

/**
 * 1. Reads .md/.abell file from given path 
 * 2. Converts it to html
 * 3. Adds variable to the new HTML and returns the HTML
 * 
 * @param {String} mdPath 
 * @param {String} contentPath
 * @param {Object} variables
 * @param {Object} options
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
  const pageTemplate = fs.readFileSync(
    path.join(programInfo.abellConfigs.sourcePath, filepath + programInfo.templateExtension), 
    'utf-8'
  );

  const variables = programInfo.vars;

  const view = {
    ...variables,
    $importContent: (path) => 
      importAndRender(
        path, 
        programInfo.abellConfigs.contentPath, 
        variables
      )
  };

  const pageContent = abellRenderer.render(
    pageTemplate, 
    view, 
    {
      basePath: path.join(
        programInfo.abellConfigs.sourcePath, 
        path.dirname(filepath)
      )
    }
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
 * @param {String} contentSlug 
 * @param {ProgramInfo} programInfo all the information required for build
 * @return {void}
 * 
 */
function generateContentFile(contentSlug, programInfo) {
  // Create Path of content if does not already exist
  createPathIfAbsent(path.join(programInfo.abellConfigs.destinationPath, contentSlug));

  const variables = {
    ...programInfo.vars,
    $slug: contentSlug,
    meta: programInfo.vars.$contentObj[contentSlug]
  };

  const view = {
    ...variables,
    $importContent: (path) => 
      importAndRender(
        path, 
        programInfo.abellConfigs.contentPath, 
        variables
      )
  };

  // render HTML of content
  const contentHTML = abellRenderer.render(
    programInfo.contentTemplate, 
    view,
    {
      basePath: path.dirname(programInfo.contentTemplatePath)
    }
  );


  // WRITE IT OUT!! YASSSSSS!!!
  fs.writeFileSync(
    path.join(programInfo.abellConfigs.destinationPath, contentSlug, 'index.html'), 
    contentHTML
  );


  // Copy assets from content's folder to actual destination
  copyContentAssets(
    path.join(programInfo.abellConfigs.contentPath, contentSlug), 
    path.join(programInfo.abellConfigs.destinationPath, contentSlug)
  );
}

module.exports = {
  getContentMeta,
  getContentMetaAll,
  getBaseProgramInfo,
  generateContentFile,
  generateHTMLFile,
  importAndRender
};

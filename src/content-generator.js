const fs = require('fs');
const path = require('path');

const abellRenderer = require('abell-renderer');
const MarkdownIt = require('markdown-it');
const mdIt = new MarkdownIt({
  html: true
});

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
 * @typedef {Object} ProgramInfo
 * @property {import('./helpers.js').AbellConfigs} abellConfigs 
 *  - Configuration from abell.config.js file
 * @property {String} contentTemplate - string of the template from template/content.abell file
 * @property {[MetaInfo]} contentList - An array of all MetaInfo
 * @property {Array} contentDirectories - List of names of all directories in content directory
 * @property {Object} globalMeta - meta info to be injected into .abell files
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
  const contentMetaInfo = getContentMetaAll(contentDirectories, abellConfigs.contentPath);
  const contentList = Object.values(contentMetaInfo)
    .sort((a, b) => a.$createdAt.getTime() > b.$createdAt.getTime() ? -1 : 1);


  const contentTemplate = fs.readFileSync(
    path.join(
      abellConfigs.sourcePath, 
      'template', 
      ('content' + (abellConfigs.templateExtension || '.abell'))
    ), 
    'utf-8'
  );


  const programInfo = {
    abellConfigs,
    contentTemplate,
    contentList,
    contentDirectories,
    globalMeta: {
      ...abellConfigs.globalMeta, 
      contentMetaInfo
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
 * Adds support for {{ import_content 'path/to/md' }} statement
 * @param {String} pageTemplate String of .abell page
 * @param {String} contentPath path to content folder
 * @param {Object} view sandbox object with variables to run upon
 * @return {String} pageTemplate
 */
function importMarkdownAndAddToTemplate(pageTemplate, contentPath, view) {
  const importSelectRegex = /{{ ?import_content *['"](.*?)['"] ?}}/g;
  let mdPath = importSelectRegex.exec(pageTemplate);
  while (mdPath !== null) {
    const renderedPath = abellRenderer.render(mdPath[1], view);
    // get markdown and convert into HTML
    const markdown = fs.readFileSync(path.join(contentPath, renderedPath), 'utf-8');
    if (!markdown) {
      console.log('Something went wrong 😭 Please save again to refresh the server.');
    }
    const content = mdIt.render(markdown);
  
    pageTemplate = pageTemplate.slice(0, mdPath['index']) 
      + content 
      + pageTemplate.slice(mdPath['index'] + mdPath[0].length);

    
    mdPath = importSelectRegex.exec(pageTemplate);
  }


  return pageTemplate;
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

  const view = {
    $contentList: programInfo.contentList,
    globalMeta: programInfo.globalMeta
  };
  
  // imports markdown to template 
  const newPageTemplate = importMarkdownAndAddToTemplate(
    pageTemplate,
    programInfo.abellConfigs.contentPath,
    view
  );

  const pageContent = abellRenderer.render(newPageTemplate, view);

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

  const view = {
    globalMeta: programInfo.globalMeta,
    meta: programInfo.globalMeta.contentMetaInfo[contentSlug],
    $contentList: programInfo.contentList
  };

  // imports markdown to template 
  const contentTemplate = importMarkdownAndAddToTemplate(
    programInfo.contentTemplate, 
    programInfo.abellConfigs.contentPath,
    view
  );

  // render HTML of content
  const contentHTML = abellRenderer.render(contentTemplate, view);


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
  generateHTMLFile
};

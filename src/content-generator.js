const fs = require('fs');
const path = require('path');

const abellRenderer = require('abell-renderer');
const MarkdownIt  = require('markdown-it');
const mdIt = new MarkdownIt({
  html: true
});

const { 
  createPathIfAbsent, 
  getAbellConfigs,
  getDirectories
} = require('./helpers.js');

function getContentMeta(contentSlug, contentPath) {
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(path.join(contentPath, contentSlug, 'meta.json'), 'utf-8'));
  } catch(err) {
    meta = { title: contentSlug, description: `Hi, This is ${contentSlug}...` }
  }

  const { mtime, ctime } = fs.statSync(path.join(contentPath, contentSlug, 'index.md'));

  return {
    ...meta, 
    $slug: contentSlug,
    $modifiedAt: mtime,
    $createdAt: ctime
  };
}


function getContentMetaAll(contentDirectories, contentPath) {
  let contentMetaInfo = {}
  for(let contentSlug of contentDirectories) {
    contentMetaInfo[contentSlug] = getContentMeta(contentSlug, contentPath);
  }

  return contentMetaInfo;
}


function getBaseProgramInfo() {
  // Get configured paths of destination and content
  const abellConfigs = getAbellConfigs();
  const contentDirectories = getDirectories(abellConfigs.contentPath);
  const contentMetaInfo = getContentMetaAll(contentDirectories, abellConfigs.contentPath);

  const contentTemplate = fs.readFileSync(
    path.join(
      abellConfigs.sourcePath, 
      'template', 
      ('content' + (abellConfigs.templateExtension || '.abell'))
    ), 
    'utf-8'
  )


  const programInfo = {
    buildStartTime: new Date().getTime(),
    abellConfigs,
    contentTemplate,
    contentDirectories,
    globalMeta: {
      ...abellConfigs.globalMeta, 
      contentMetaInfo
    },
    logs: 'minimum',
    templateExtension: abellConfigs.templateExtension || '.abell'
  }

  return programInfo
}



/** 
 * Copy assets (images etc) from content folder (`content/my-cool-blog`) to destination folder
 */
function copyContentAssets(from, to) {
  // Read names of files from contentSlug
  const filesList = fs.readdirSync(from)
    .filter(val => val !== 'index.md' && val !== 'meta.json');

  for(let filename of filesList) {
    fs.copyFileSync(
      path.join(from, filename), 
      path.join(to, filename)
    );
  }
}


/**
 * Adds support for {{ import_content 'path/to/md' }} statement
 * @param {string} pageTemplate String of .abell page
 * @param {string} contentPath path to content folder
 * @param {object} view sandbox object with variables to run upon
 */
function importMarkdownAndAddToTemplate(pageTemplate, contentPath, view) {

  const importSelectRegex = /{{ ?import_content *['"](.*?)['"] ?}}/g
  let mdPath = importSelectRegex.exec(pageTemplate);
  while(mdPath !== null) {
    const renderedPath = abellRenderer.render(mdPath[1], view);
    // get markdown and convert into HTML
    const markdown = fs.readFileSync(path.join(contentPath, renderedPath), 'utf-8');
    if(!markdown) {
      console.log("Something went wrong 😭 Please save again to refresh the server.")
    }
    const content = mdIt.render(markdown);
  
    pageTemplate = pageTemplate.slice(0, mdPath['index']) 
      + content 
      + pageTemplate.slice(mdPath['index'] + mdPath[0].length)

    
    mdPath = importSelectRegex.exec(pageTemplate);
  }


  return pageTemplate;
}

/**
 * @method generateHTMLFile
 * @param {string} filepath filepath relative to source directory
 * @param {any} programInfo all the information required for build
 * 
 * @description 
 *  1. Read Template
 *  2. Render Template with abell-renderer and add variables
 *  3. Write to the destination.
 */

function generateHTMLFile(filepath, programInfo) {
  const pageTemplate = fs.readFileSync(path.join(programInfo.abellConfigs.sourcePath, filepath + programInfo.templateExtension), 'utf-8');

  const contentList = Object.values(programInfo.globalMeta.contentMetaInfo)
    .sort((a, b) => a.$createdAt.getTime() > b.$createdAt.getTime() ? -1 : 1);

  const view = {
    $contentList: contentList,
    globalMeta: programInfo.globalMeta
  }
  
  // imports markdown to template 
  const newPageTemplate = importMarkdownAndAddToTemplate(
    pageTemplate, 
    programInfo.abellConfigs.contentPath,
    view
  );

  const pageContent = abellRenderer.render(
    newPageTemplate, 
    view
  )

  fs.writeFileSync(
    path.join(programInfo.abellConfigs.destinationPath, filepath + '.html'), 
    pageContent
  );
  
}


/**
 * @method generateContentFile
 * @param {string} contentSlug 
 * @param {any} programInfo all the information required for build
 * 
 * @description
 *  1. Create path
 *  2. Read Markdown
 *  3. Convert to HTML
 *  4. Render content HTML on programInfo.contentTemplate
 * 
 */

function generateContentFile(contentSlug, programInfo) {

  // Create Path of content if does not already exist
  createPathIfAbsent(path.join(programInfo.abellConfigs.destinationPath, contentSlug));

  const view = {
    globalMeta: programInfo.globalMeta,
    meta: programInfo.globalMeta.contentMetaInfo[contentSlug],
    $contentList: Object.values(programInfo.globalMeta.contentMetaInfo),
  }

  // imports markdown to template 
  const contentTemplate = importMarkdownAndAddToTemplate(
    programInfo.contentTemplate, 
    programInfo.abellConfigs.contentPath,
    view
  );

  // render HTML of content
  const contentHTML = abellRenderer.render(contentTemplate, view)


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
}
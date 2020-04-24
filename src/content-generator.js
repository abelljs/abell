const fs = require('fs');
const path = require('path');

const Mustache = require('mustache');
const showdown  = require('showdown');
const converter = new showdown.Converter();

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
    meta = {title: contentSlug, description: `Hi, This is ${contentSlug}...`}
  }
  return meta;
}


function getContentMetaAll(contentDirectories, contentPath) {
  let contentMetaInfo = {}
  for(let contentSlug of contentDirectories) {
    contentMetaInfo[contentSlug] = {
      ...getContentMeta(contentSlug, contentPath), 
      $slug: contentSlug
    };
  }

  return contentMetaInfo;
}


const getBaseProgramInfo = () => {
  // Get configured paths of destination and content
  const abellConfigs = getAbellConfigs();
  const contentDirectories = getDirectories(abellConfigs.contentPath);
  const contentMetaInfo = getContentMetaAll(contentDirectories, abellConfigs.contentPath);
  const programInfo = {
    abellConfigs,
    contentTemplate: fs.readFileSync(path.join(abellConfigs.sourcePath, '[content]', 'index.html'), 'utf-8'),
    globalMeta: {
      ...abellConfigs.meta, 
      contentMetaInfo
    },
    logs: 'minimum'
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
 * @method generateHTMLFile
 * @param {string} filepath filepath relative to source directory
 * @param {any} programInfo all the information required for build
 * 
 * @description 
 *  1. Read Template
 *  2. Render Template with mustache and add variables
 *  3. Write to the destination.
 */

function generateHTMLFile(filepath, programInfo) {
  const pageTemplate = fs.readFileSync(path.join(programInfo.abellConfigs.sourcePath, filepath), 'utf-8');

  const pageContent = Mustache.render(
    pageTemplate, 
    {
      $contentList: Object.values(programInfo.globalMeta.contentMetaInfo),
      globalMeta: programInfo.globalMeta
    }
  )

  fs.writeFileSync(path.join(programInfo.abellConfigs.destinationPath, filepath), pageContent);
  
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

  // get markdown and convert into HTML
  const markdown = fs.readFileSync(path.join(programInfo.abellConfigs.contentPath, contentSlug, 'index.md'), 'utf-8');
  if(!markdown) {
    console.log("Something went wrong 😭 Please save again to refresh the server.")
  }
  const content = converter.makeHtml(markdown);

  // render HTML of content
  const contentHTML = Mustache.render(programInfo.contentTemplate, {
    globalMeta: programInfo.globalMeta,
    meta: programInfo.globalMeta.contentMetaInfo[contentSlug],
    $contentList: Object.values(programInfo.globalMeta.contentMetaInfo),
    $contentData: content
  })

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
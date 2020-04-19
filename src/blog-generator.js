const fs = require('fs');
const path = require('path');

const Mustache = require('mustache');
const showdown  = require('showdown');
const converter = new showdown.Converter();

const { 
  createPathIfAbsent,
  getConfigPaths
} = require('./helpers.js');


let metaInfoMemoize = {};


const regexIncludingVariable = (val, flag = '') => 
  new RegExp(`{\%[ \n\t]*?${val}[ \n\t]*?\%}`, flag)

/**
 * @method getBlogMeta
 * @description Returns Meta Content of Blog
 * @param {string} blogSlug 
 */
function getBlogMeta(blogSlug) {
  if(metaInfoMemoize[blogSlug]) {
    return metaInfoMemoize[blogSlug];
  }

  const {contentPath} = getConfigPaths();

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(path.join(contentPath, blogSlug, 'meta.json'), 'utf-8'));
  } catch(err) {
    meta = {title: blogSlug, description: `Hi, This is ${blogSlug}...`}
  }
  metaInfoMemoize[blogSlug] = meta;
  return meta;
}

/**
 * @method getBlogPageHTML
 * @description accepts blogSlug and returns a complete HTML of blog that is supposed to be written
 * @param {string} blogSlug 
 */
function getBlogPageHTML(blogSlug) {
  const {sourcePath, contentPath} = getConfigPaths();

  const blogTemplate = fs.readFileSync(path.join(sourcePath, '[content]', 'index.html'), 'utf-8');

  // get markdown and convert into HTML
  const markdown = fs.readFileSync(path.join(contentPath, blogSlug, 'index.md'), 'utf-8');
  const content = converter.makeHtml(markdown);

  // get META information of blog from meta.json file
  const meta = getBlogMeta(blogSlug);

  const contentHTML = Mustache.render(
    blogTemplate, 
    {
      meta, 
      $contentData: content
    }
  )
  
  return contentHTML;
}


/**
 * @method copyBlogAssets
 * @description copies images and other assets from blog's folder
 * @param {string} blogSlug 
 */
function copyBlogAssets(blogSlug) {
  const {contentPath, destinationPath} = getConfigPaths();

// Copy other files from content directory if exist
  const assetsList = fs.readdirSync(path.join(contentPath, blogSlug))
    .filter(val => val !== 'index.md' && val !== 'meta.json');

  for(let asset of assetsList) {
    fs.copyFileSync(
      path.join(contentPath, blogSlug, asset), 
      path.join(destinationPath, blogSlug, asset)
    );
  }
}

function generateBlog(blogSlug) {
  const {destinationPath} = getConfigPaths();

  // Create blog directory in dist if doesn't exist
  createPathIfAbsent(path.join(destinationPath, blogSlug));

  // Get HTML Content of Blog and write it.
  const blogIndexHTML = getBlogPageHTML(blogSlug);
  fs.writeFileSync(path.join(destinationPath, blogSlug, 'index.html'), blogIndexHTML);

  // Copy Blog Assets (images, other files, etc.)
  copyBlogAssets(blogSlug);

}


module.exports = {
  generateBlog,
  getBlogMeta
}
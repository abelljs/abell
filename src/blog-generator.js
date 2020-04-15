const fs = require("fs");

const showdown  = require('showdown');
const converter = new showdown.Converter();

const { 
  rPath,
  createPathIfAbsent
} = require('./helpers.js');

const blogTemplate = fs.readFileSync(rPath('src/templates/[blog].html'), 'utf-8');
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

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(rPath(`content/${blogSlug}/meta.json`), 'utf-8'));
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
  // get markdown and convert into HTML
  const markdown = fs.readFileSync(rPath(`content/${blogSlug}/index.md`), 'utf-8');
  const content = converter.makeHtml(markdown);

  // get META information of blog from meta.json file
  const meta = getBlogMeta(blogSlug);

  // Replace actual values with variables
  return blogTemplate
    .replace(regexIncludingVariable('title', 'g'), (meta.title || blogSlug))
    .replace(regexIncludingVariable('description', 'g'), (meta.description || ''))
    .replace(regexIncludingVariable('blogContent', ''), content)
}


/**
 * @method copyBlogAssets
 * @description copies images and other assets from blog's folder
 * @param {string} blogSlug 
 */
function copyBlogAssets(blogSlug) {
// Copy other files from content directory if exist
  const assetsList = fs.readdirSync(rPath('content/' + blogSlug))
    .filter(val => val !== 'index.md' && val !== 'meta.json');

  for(let asset of assetsList) {
    fs.copyFileSync(rPath(`content/${blogSlug}/${asset}`), rPath(`dist/${blogSlug}/${asset}`));
  }
}

function generateBlog(blogSlug) {
  // Create blog directory in dist if doesn't exist
  createPathIfAbsent(rPath(`dist/${blogSlug}`));

  // Get HTML Content of Blog and write it.
  const blogIndexHTML = getBlogPageHTML(blogSlug);
  fs.writeFileSync(rPath(`dist/${blogSlug}/index.html`), blogIndexHTML);

  // Copy Blog Assets (images, other files, etc.)
  copyBlogAssets(blogSlug);

  // Print Built
  console.log("...Built " + blogSlug);
}


module.exports = {
  generateBlog,
  getBlogMeta
}
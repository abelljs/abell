const fs = require('fs')
const path = require('path');

const { getDirectories, getConfigPaths } = require('./helpers.js');
const { getBlogMeta } = require('./blog-generator.js');


function generateLandingPage() {
  const {sourcePath, destinationPath, contentPath} = getConfigPaths();

  const metaInfos = {}
  for(let blogSlug of getDirectories(contentPath)) {
    metaInfos[blogSlug] = getBlogMeta(blogSlug, {forceFetch: true});
  }

  const articlesHTML = Object.entries(metaInfos).map(([slug, article]) => {
    return /* html */`
    <article>
      <a href="${slug}"><h2>${article.title}</h2></a>
      <p class="article-description">${article.description}</p>
    </article>
    `
  }).join('');

  const indexTemplate = fs.readFileSync(path.join(sourcePath, 'index.html'), 'utf-8');

  const indexHTMLContent = indexTemplate
    .replace(/{\% ?\$contentList ?\%}/g, articlesHTML);

  fs.writeFileSync(path.join(destinationPath, 'index.html'), indexHTMLContent);

}


module.exports = {
  generateLandingPage
}

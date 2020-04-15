const fs = require('fs')

const { rPath, getDirectories } = require('./helpers.js');
const { getBlogMeta } = require('./blog-generator.js');


function createLandingPage() {
  const metaInfos = {}
  for(let blogSlug of getDirectories('content')) {
    metaInfos[blogSlug] = getBlogMeta(blogSlug);
  }

  const articlesHTML = Object.entries(metaInfos).map(([slug, article]) => {
    return /* html */`
    <article>
      <a href="${slug}"><h2>${article.title}</h2></a>
      <p class="article-description">${article.description}</p>
    </article>
    `
  }).join('');

  const indexTemplate = fs.readFileSync(rPath('src/templates/index.html'), 'utf-8');

  const indexHTMLContent = indexTemplate
    .replace(/{\% ?articlesList ?\%}/g, articlesHTML);

  fs.writeFileSync(rPath(`dist/index.html`), indexHTMLContent);
}


module.exports = {
  createLandingPage
}

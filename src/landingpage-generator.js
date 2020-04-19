const fs = require('fs')
const path = require('path');
const Mustache = require('mustache');

const { getDirectories, getConfigPaths } = require('./helpers.js');
const { getBlogMeta } = require('./blog-generator.js');


function generateLandingPage() {
  const {sourcePath, destinationPath, contentPath} = getConfigPaths();

  const metaInfos = {}
  for(let blogSlug of getDirectories(contentPath)) {
    metaInfos[blogSlug] = {...getBlogMeta(blogSlug), $slug: blogSlug};
  }


  const indexTemplate = fs.readFileSync(path.join(sourcePath, 'index.html'), 'utf-8');

  const indexHTMLContent = Mustache.render(
    indexTemplate, 
    {
      $contentList: Object.values(metaInfos)
    }
  )

  fs.writeFileSync(path.join(destinationPath, 'index.html'), indexHTMLContent);

}


module.exports = {
  generateLandingPage
}

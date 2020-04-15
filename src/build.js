const fs = require('fs');

const { 
  getDirectories,
  rmdirRecursiveSync
} = require('./helpers.js');

const { generateBlog } = require('./blog-generator.js');
const { createLandingPage } = require('./index-generator.js');

function build() {
  // Refresh dist
  rmdirRecursiveSync('dist');
  fs.mkdirSync('dist');

  // Generate all blogs from content directory
  for(let blogSlug of getDirectories('content')) {
    generateBlog(blogSlug);
  }

  // generate landing page (dist/index.html)
  createLandingPage();
}

build();



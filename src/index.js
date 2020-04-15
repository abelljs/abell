#!/usr/bin/env node

const fs = require('fs');

const { 
  getDirectories,
  rmdirRecursiveSync,
  getConfigPaths
} = require('./helpers.js');

const { generateBlog } = require('./blog-generator.js');
const { generateLandingPage } = require('./landingpage-generator.js');


function build() {
  // TODO: if destinationPath is not 'dist' and has contents, ask for confirmation.

  // Get configured paths of destination and content
  const {destinationPath, contentPath} = getConfigPaths();

  // Refresh dist
  rmdirRecursiveSync(destinationPath);
  fs.mkdirSync(destinationPath);

  // Generate all blogs from content directory
  for(let blogSlug of getDirectories(contentPath)) {
    generateBlog(blogSlug);
  }

  // generate landing page (dist/index.html)
  generateLandingPage();

  console.log(`\n\nYour blog is ready at '${destinationPath.split('/').slice(-1)}' 🐨 🎉 \n\n`);
}

build();



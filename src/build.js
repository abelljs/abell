#!/usr/bin/env node

const fs = require('fs');

const { 
  getDirectories,
  rmdirRecursiveSync,
  relativePath
} = require('./helpers.js');

const { generateBlog } = require('./blog-generator.js');
const { createLandingPage } = require('./index-generator.js');

function build() {
  // Refresh dist
  rmdirRecursiveSync(relativePath('dist'));
  fs.mkdirSync(relativePath('dist'));

  // Generate all blogs from content directory
  for(let blogSlug of getDirectories(relativePath('content'))) {
    generateBlog(blogSlug);
  }

  // generate landing page (dist/index.html)
  createLandingPage();
}

build();



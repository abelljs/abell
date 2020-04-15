#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { 
  getDirectories,
  rmdirRecursiveSync,
  getConfigPaths,
  copyFolderSync
} = require('./helpers.js');

const { generateBlog } = require('./blog-generator.js');
const { generateLandingPage } = require('./landingpage-generator.js');


function build() {
  console.log("\n>> Build started\n");
  
  // TODO: if destinationPath is not 'dist' and has contents, ask for confirmation.

  // Get configured paths of destination and content
  const {destinationPath, contentPath, sourcePath} = getConfigPaths();

  // Refresh dist
  rmdirRecursiveSync(destinationPath);
  fs.mkdirSync(destinationPath);

  // Copy all files from source directory and then delete [blog] directory
  copyFolderSync(sourcePath, destinationPath)
  rmdirRecursiveSync(path.join(destinationPath, '[blog]'));

  // Generate all blogs from content directory
  for(let blogSlug of getDirectories(contentPath)) {
    generateBlog(blogSlug);
  }

  // generate landing page (dist/index.html)
  generateLandingPage();

  console.log(`\n\n>> Your blog is ready at '${destinationPath.split('/').slice(-1)}' 🐨 🎉 \n\n`);
}


// Main
const cliArguments = process.argv.slice(2);

switch(cliArguments[0]) {
  case 'build':
    build();
    break;
  
  default:
    console.log("Unknown command 😔 .")
    break;
}


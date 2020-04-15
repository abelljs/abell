#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const browserSync = require('browser-sync');

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

function serve() {
  const {sourcePath, contentPath, destinationPath} = getConfigPaths();
  const bs = browserSync.create('abell-dev-server');

  bs.init({
    port: 3000,
    server: destinationPath,
    logLevel: 'info',
    logPrefix: 'abell-dev-server',
    logConnections: false,
    notify: false,
    reloadDelay: 1000
  });

  fs.watch(sourcePath, (eventType, fileName) => {
    if(fileName === 'index.html') {
      generateLandingPage();
    } else {
      build();
    }
    bs.reload();
  })

  for(let directory of getDirectories(sourcePath)) {
    fs.watch(path.join(sourcePath, directory), (eventType, fileName) => {
      build();
      bs.reload();
    })
  }

  for(let directory of getDirectories(contentPath)) {
    fs.watch(path.join(contentPath, directory), (eventName, fileName) => {
      generateBlog(directory);
      bs.reload();
    })
  }
}

// Main
const cliArguments = process.argv.slice(2);

switch(cliArguments[0]) {
  case 'build':
    build();
    break;
  
  case 'serve':
    serve();
    break;

  default:
    console.log("Unknown command 😔 .")
    break;
}


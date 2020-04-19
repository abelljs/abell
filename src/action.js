const fs = require('fs');
const path = require('path');

const browserSync = require('browser-sync');

const { 
  getDirectories,
  rmdirRecursiveSync,
  getConfigPaths,
  forcefullySetDestination,
  copyFolderSync,
  boldGreen
} = require('./helpers.js');

const { generateBlog } = require('./blog-generator.js');
const { generateLandingPage } = require('./landingpage-generator.js');


function build({logs = 'complete'} = {logs: 'complete'}) {
  if(logs !== 'minimum') console.log("\n>> Build started\n");
  
  // Get configured paths of destination and content
  const {destinationPath, contentPath, sourcePath} = getConfigPaths();

  // Refresh dist
  rmdirRecursiveSync(destinationPath);
  fs.mkdirSync(destinationPath);

  // Copy all files from source directory and then delete [content] directory
  copyFolderSync(sourcePath, destinationPath)
  rmdirRecursiveSync(path.join(destinationPath, '[content]'));

  // Generate all blogs from content directory
  for(let blogSlug of getDirectories(contentPath)) {
    generateBlog(blogSlug);

    if(logs !== 'minimum') console.log("...Built " + blogSlug);
  }

  // generate landing page (dist/index.html)
  generateLandingPage();

  if(logs !== 'minimum') console.log("\n...Built Landing Page");


  if(logs === 'minimum') {
    console.log(`>> Built 🌻`)
  } else {
    console.log(`\n\n>> Your blog is ready at '${destinationPath.split('/').slice(-1)}' 🐨 🎉 \n\n`);
  }
}

function serve(port = 5000) {
  forcefullySetDestination('.debug'); // Forces to output in .cache/ directory

  const {sourcePath, contentPath, destinationPath} = getConfigPaths();
  
  // Initial build
  build({logs: 'minimum'});

  console.log('='.repeat(process.stdout.columns));
  console.log("\n\n💫 Abell dev server running.");
  const bs = browserSync.create('abell-dev-server');

  bs.init({
    port,
    server: destinationPath,
    logLevel: 'silent',
    logPrefix: 'abell-dev-server',
    logConnections: false,
    notify: false,
    reloadDelay: 1000
  });

  console.log(`${boldGreen("Local: ")} http://localhost:${port} \n\n`);
  console.log('='.repeat(process.stdout.columns));
  
  fs.watch(sourcePath, (eventType, fileName) => {
    if(fileName === 'index.html') {
      generateLandingPage();
    } else {
      build({logs: 'minimum'});
    }
    bs.reload();
  })

  for(let directory of getDirectories(sourcePath)) {
    fs.watch(path.join(sourcePath, directory), (eventType, fileName) => {
      build({logs: 'minimum'});
      bs.reload();
    })
  }

  
  for(let directory of getDirectories(contentPath)) {
    fs.watch(path.join(contentPath, directory), (eventName, fileName) => {
      generateBlog(directory);
      bs.reload();
    })
  }

  function exitHandler(options, exitCode) {
    if (options.cleanup) {
      rmdirRecursiveSync(destinationPath);
      console.log("\n\nBiee 🐨✌️\n");
    }

    if (options.exit) process.exit();
  }

  //do something when app is closing
  process.on('exit', exitHandler.bind(null,{cleanup:true}));

  //catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, {exit:true}));

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
  process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

}

module.exports = {build, serve};


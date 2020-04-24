const fs = require('fs');
const path = require('path');

const browserSync = require('browser-sync');
const chokidar = require('chokidar');

const { 
  getDirectories,
  rmdirRecursiveSync,
  getAbellConfigs,
  copyFolderSync,
  exitHandler,
  boldGreen
} = require('./helpers.js');

const { 
  generateContentFile, 
  generateHTMLFile
} = require('./content-generator');

function build(programInfo) {
  if(programInfo.logs == 'complete') console.log("\n>> Build started\n");

  const contentDirectories = getDirectories(programInfo.abellConfigs.contentPath);

  // Refresh dist
  rmdirRecursiveSync(programInfo.abellConfigs.destinationPath);
  fs.mkdirSync(programInfo.abellConfigs.destinationPath);
  
  // Copy everything from src to dist except [content] folder.
  copyFolderSync(programInfo.abellConfigs.sourcePath, programInfo.abellConfigs.destinationPath);
  rmdirRecursiveSync(path.join(programInfo.abellConfigs.destinationPath, '[content]'));


  // GENERATE CONTENT HTML FILES 
  for(let contentSlug of contentDirectories) {
    generateContentFile(contentSlug, programInfo);
    if(programInfo.logs == 'complete') console.log(`...Built ${contentSlug}`);
  }

  // GENERATE OTHER HTML FILES
  generateHTMLFile('index.html', programInfo);
  if(programInfo.logs == 'complete') console.log(`...Built index.html\n`);

  console.log(">>> Build complete 🚀✨");
}

function serve(port = 5000) {
  forcefullySetDestination('.debug'); // Forces to output in .cache/ directory

  const {sourcePath, contentPath, destinationPath} = getAbellConfigs();

  
  build({logs: 'minimum'});
  console.log("Starting your abell-dev-server 🤠...")
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


  // Print ports on screen
  console.log('='.repeat(process.stdout.columns));
  console.log("\n\n💫 Abell dev server running.");
  console.log(`${boldGreen("Local: ")} http://localhost:${port} \n\n`);
  console.log('='.repeat(process.stdout.columns));

  chokidar
    .watch(sourcePath, {ignoreInitial: true})
    .on('all', (event, path) => {
      build({logs: 'minimum'});
      bs.reload();
    })

  chokidar
    .watch(contentPath, {ignoreInitial: true})
    .on('all', (event, path) => {
      try{
        const directoryName = path.slice(contentPath.length + 1).split('/')[0];
        if(path.endsWith('.md')) {
          generateBlog(directoryName);
        }else{
          build({logs: 'minimum'});
        }
        
      }catch(err) {
        build({logs: 'minimum'});
      }
      bs.reload();
    })


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


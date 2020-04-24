const fs = require('fs');
const path = require('path');

const browserSync = require('browser-sync');
const chokidar = require('chokidar');

const { 
  getDirectories,
  rmdirRecursiveSync,
  copyFolderSync,
  exitHandler,
  boldGreen
} = require('./helpers.js');

const { 
  generateContentFile, 
  generateHTMLFile,
  getBaseProgramInfo,
  getContentMeta
} = require('./content-generator');



/**
 * @method build
 * @param {any} programInfo programInfo has all the information required by program for build
 * @description
 *  Builds the static site! 
 *  The build parameters are first calculated in index.js and the programInfo with all those parameters is passed
 */

function build(programInfo) {

  if(programInfo.logs == 'complete') console.log("\n>> Abell Build Started\n");

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

  if(programInfo.logs == 'complete') console.log(`${boldGreen('>>>')} Build complete 🚀✨\n\n`);
  if(programInfo.logs == 'minimum') console.log(`${boldGreen('>>>')} Files built.. ✨`);

}



function serve(programInfo) {  
  
  build(programInfo);

  console.log("Starting your abell-dev-server 🤠...")
  const bs = browserSync.create('abell-dev-server');
  
  bs.init({
    port: programInfo.port,
    server: programInfo.abellConfigs.destinationPath,
    logLevel: 'silent',
    logPrefix: 'abell-dev-server',
    logConnections: false,
    notify: false,
    reloadDelay: 1000
  });


  // Print ports on screen
  console.log('='.repeat(process.stdout.columns));
  console.log("\n\n💫 Abell dev server running.");
  console.log(`${boldGreen("Local: ")} http://localhost:${programInfo.port} \n\n`);
  console.log('='.repeat(process.stdout.columns));


  const abellConfigsPath = path.join(process.cwd(), 'abell.config.json')
  if(fs.existsSync(abellConfigsPath)) {
    // Watch abell.config.json
    chokidar
      .watch(abellConfigsPath, {ignoreInitial: true})
      .on('change', filePath => {

        delete require.cache[abellConfigsPath];

        const baseProgramInfo = getBaseProgramInfo();
        // destination should be unchanged while serving. So we keep existing destination in temp variable.
        const existingDestination = programInfo.abellConfigs.destinationPath;
        programInfo.abellConfigs = baseProgramInfo.abellConfigs;
        programInfo.abellConfigs.destinationPath = existingDestination;
        programInfo.globalMeta = baseProgramInfo.globalMeta;

        console.log("Abell configs changed 🤓");

        build(programInfo);
        bs.reload();
      })
  }


  // Watch 'src'
  chokidar
    .watch(programInfo.abellConfigs.sourcePath, {ignoreInitial: true})
    .on('all', (event, filePath) => {
      const directoryName = filePath.slice(programInfo.abellConfigs.sourcePath.length + 1).split('/')[0];
      if(filePath.endsWith('index.html') && directoryName === '[content]') {
        // Content template changed
        programInfo.contentTemplate = fs.readFileSync(path.join(programInfo.abellConfigs.sourcePath, '[content]', 'index.html'), 'utf-8');
      }
        
      build(programInfo);
      bs.reload();
    })


  // Watch 'content'
  chokidar
    .watch(programInfo.abellConfigs.contentPath, {ignoreInitial: true})
    .on('all', (event, filePath) => {
      try{
        const directoryName = filePath.slice(programInfo.abellConfigs.contentPath.length + 1).split('/')[0];
        if(filePath.endsWith('index.md')) {
          generateContentFile(directoryName, programInfo);
          console.log(`...Built ${directoryName}`);
        }else if(filePath.endsWith('meta.json')) {
          // refetch meta and then build
          const meta = getContentMeta(directoryName, programInfo.abellConfigs.contentPath);
          programInfo.globalMeta.contentMetaInfo[directoryName] = meta;
          build(programInfo);
        }else {
          build(programInfo);
        }
        
      }catch(err) {
        build(programInfo);
      }

      bs.reload();
    })


  // do something when app is closing
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


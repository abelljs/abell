const fs = require('fs');
const path = require('path');

const relativeJoinedPath = pathString => path.join(process.cwd(), ...pathString.split('/'));

const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const rmdirRecursiveSync = function(pathToRemove) {
  if (fs.existsSync(pathToRemove)) {
    fs.readdirSync(pathToRemove).forEach((file, index) => {
      const curPath = path.join(pathToRemove, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        rmdirRecursiveSync(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToRemove);
  }
};

const readUserConfigFile = () => {
  let userConfig;
  try {
    userConfig = JSON.parse(fs.readFileSync('abell.config.json'));
  } catch(err) {
    userConfig = {
      destinationPath: 'dist',
      sourcePath: 'src',
      contentPath: 'content',
      globalMeta: {}
    };
  }

  return userConfig;
}

const getAbellConfigs = () => {
  // If not memoized
  const abellConfig = readUserConfigFile();

  const destinationPath = relativeJoinedPath(abellConfig.destinationPath);
  const sourcePath = relativeJoinedPath(abellConfig.sourcePath);
  const contentPath = relativeJoinedPath(abellConfig.contentPath);

  return {
    ...abellConfig,
    destinationPath, 
    sourcePath, 
    contentPath,
  }
}


const createPathIfAbsent = pathToCreate => {
  if(!fs.existsSync(pathToCreate)) {
    fs.mkdirSync(pathToCreate);
  }
} 

function copyFolderSync(from, to) {
  createPathIfAbsent(to);
  fs.readdirSync(from).forEach(element => {
      if (fs.lstatSync(path.join(from, element)).isFile()) {
          fs.copyFileSync(path.join(from, element), path.join(to, element));
      } else {
          copyFolderSync(path.join(from, element), path.join(to, element));
      }
  });
}

function exitHandler(options, exitCode) {
  if (options.cleanup) {
    rmdirRecursiveSync('.debug');
    console.log("\n\nBiee 🐨✌️\n");
  }
  if(exitCode !== 0) console.log(exitCode);

  if (options.exit) process.exit();
}

const boldGreen = (message) => `\u001b[1m\u001b[32m${message}\u001b[39m\u001b[22m`;
// const grey = (message) => `\u001b[90m${message}\u001b[39m`;

module.exports = {
  getDirectories,
  rmdirRecursiveSync,
  getAbellConfigs,
  createPathIfAbsent,
  copyFolderSync,
  exitHandler,
  boldGreen,
}
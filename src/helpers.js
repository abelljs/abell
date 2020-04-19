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
    userConfig = require(path.join(process.cwd(), 'abell.config.js'));
  } catch(err) {
    userConfig = {
      destinationPath: 'dist',
      sourcePath: 'src',
      contentPath: 'content',
    };
  }

  return userConfig;
}

var abellConfig;
const getAbellConfigs = () => {
  // If not memoized
  if(!abellConfig) {
    abellConfig = readUserConfigFile();
  }

  const destinationPath = relativeJoinedPath(abellConfig.destinationPath);
  const sourcePath = relativeJoinedPath(abellConfig.sourcePath);
  const contentPath = relativeJoinedPath(abellConfig.contentPath);

  return {
    destinationPath, 
    sourcePath, 
    contentPath,
  }
}

const forcefullySetDestination = (forcedDestination) => {
  abellConfig = {
    ...readUserConfigFile(),
    destinationPath: forcedDestination
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
    const {destinationPath} = getAbellConfigs();
    rmdirRecursiveSync(destinationPath);
    console.log("\n\nBiee 🐨✌️\n");
  }

  if (options.exit) process.exit();
}

const boldGreen = (message) => `\u001b[1m\u001b[32m${message}\u001b[39m\u001b[22m`;
const grey = (message) => `\u001b[90m${message}\u001b[39m`;

module.exports = {
  relativeJoinedPath,
  getDirectories,
  rmdirRecursiveSync,
  readUserConfigFile,
  getAbellConfigs,
  forcefullySetDestination,
  createPathIfAbsent,
  copyFolderSync,
  exitHandler,
  boldGreen,
  grey
}
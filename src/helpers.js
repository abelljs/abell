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

let abellConfig;
const getConfigPaths = () => {
  // If not memoized
  if(!abellConfig) {
    try {
      abellConfig = require(path.join(process.cwd(), 'abell.config.js'));
    } catch(err) {
      abellConfig = {
        destinationPath: 'dist',
        sourcePath: 'pages',
        contentPath: 'content'
      };
    }
  }

  const destinationPath = relativeJoinedPath(abellConfig.destinationPath);
  const sourcePath = relativeJoinedPath(abellConfig.sourcePath);
  const contentPath = relativeJoinedPath(abellConfig.contentPath);
  return {destinationPath, sourcePath, contentPath}
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

module.exports = {
  relativeJoinedPath,
  getDirectories,
  rmdirRecursiveSync,
  getConfigPaths,
  createPathIfAbsent,
  copyFolderSync
}
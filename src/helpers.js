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

const getConfigPaths = () => {
  const destinationPath = relativeJoinedPath('dist');
  const sourcePath = relativeJoinedPath('pages');
  const contentPath = relativeJoinedPath('content');
  return {destinationPath, sourcePath, contentPath}
}

const createPathIfAbsent = pathToCreate => {
  if(!fs.existsSync(pathToCreate)) {
    fs.mkdirSync(pathToCreate);
  }
} 

module.exports = {
  relativeJoinedPath,
  getDirectories,
  rmdirRecursiveSync,
  getConfigPaths,
  createPathIfAbsent
}
const fs = require('fs');
const util = require('util');
const path = require('path');

/**
 * @method rPath
 * @description generates responsive path for different operating systems
 * @param {String} pathString 
 */
const rPath = pathString => path.join(...pathString.split('/')); 


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


const createPathIfAbsent = pathToCreate => {
  if(!fs.existsSync(pathToCreate)) {
    fs.mkdirSync(pathToCreate);
  }
} 

module.exports = {
  rPath,
  getDirectories,
  rmdirRecursiveSync,
  createPathIfAbsent
}
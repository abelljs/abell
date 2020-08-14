const fs = require('fs');
const path = require('path');

/**
 * Returns full path on given relative path
 * @param {String} pathString - path object
 * @return {String} relativelyJoinedPath
 */
const getAbsolutePath = (pathString) =>
  path.join(process.cwd(), ...pathString.split('/'));

/**
 * Replaces extension in path
 * @param {String} filePath
 * @param {String} newExtension new extension to replace with e.g -> .html
 * @return {String}
 */
const replaceExtension = (filePath, newExtension) =>
  filePath.slice(0, filePath.lastIndexOf('.')) + newExtension;

/**
 * Removes the folder
 * @param {String} pathToRemove path to the directory which you want to remove
 */
function rmdirRecursiveSync(pathToRemove) {
  if (fs.existsSync(pathToRemove)) {
    fs.readdirSync(pathToRemove).forEach((file, index) => {
      const curPath = path.join(pathToRemove, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        rmdirRecursiveSync(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToRemove);
  }
}

/**
 * get first only line of file
 * @param {String} pathToFile
 * @return {String}
 */
function getFirstLine(pathToFile) {
  return fs.readFileSync(pathToFile, 'utf-8').trim().split('\n')[0];
}

/**
 *
 * @param {String} base directory to search in
 * @param {String} ext Extension you want to search for (e.g. '.abell')
 * @param {String[]} inputFiles Array of directories
 * @param {String[]} inputResult Holds the old input result
 * @return {String[]} Array of filepaths that end with given extension
 */
function recursiveFindFiles(
  base,
  ext,
  inputFiles = undefined,
  inputResult = undefined
) {
  const files = inputFiles || fs.readdirSync(base);
  let result = inputResult || [];

  for (const file of files) {
    const newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = recursiveFindFiles(
        newbase,
        ext,
        fs.readdirSync(newbase),
        result
      );
    } else {
      if (file.endsWith(ext)) {
        result.push(newbase);
      }
    }
  }

  return result;
}

/**
 * Recursively creates the path
 * @param {String} pathToCreate path that you want to create
 */
function createPathIfAbsent(pathToCreate) {
  // prettier-ignore
  pathToCreate
    .split(path.sep)
    .reduce((prevPath, folder) => {
      const currentPath = path.join(prevPath, folder, path.sep);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
      return currentPath;
    }, '');
}

/**
 *
 * @param {String} from - Path to copy from
 * @param {String} to - Path to copy to
 * @param {Array} ignore - files/directories to ignore
 * @param {Boolean} ignoreEmptyDirs - Ignore empty directories while copying
 * @return {void}
 */
function copyFolderSync(from, to, ignore = [], ignoreEmptyDirs = true) {
  if (ignore.includes(from)) {
    return;
  }
  const fromDirectories = fs.readdirSync(from);

  createPathIfAbsent(to);
  fromDirectories.forEach((element) => {
    const fromElement = path.join(from, element);
    const toElement = path.join(to, element);
    if (fs.lstatSync(fromElement).isFile()) {
      if (!ignore.includes(fromElement)) {
        fs.copyFileSync(fromElement, toElement);
      }
    } else {
      copyFolderSync(fromElement, toElement, ignore);
      if (fs.existsSync(toElement) && ignoreEmptyDirs) {
        try {
          fs.rmdirSync(toElement);
        } catch (err) {
          if (err.code !== 'ENOTEMPTY') throw err;
        }
      }
    }
  });
}

module.exports = {
  getAbsolutePath,
  replaceExtension,
  rmdirRecursiveSync,
  getFirstLine,
  recursiveFindFiles,
  createPathIfAbsent,
  copyFolderSync
};

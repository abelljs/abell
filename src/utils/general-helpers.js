const fs = require('fs');
const path = require('path');

/**
 * @typedef {import('./typedefs').AbellConfigs}
 */

/**
 * Returns full path on given relative path
 * @param {String} pathString - path object
 * @return {String} relativelyJoinedPath
 */
const getAbsolutePath = (pathString) =>
  path.join(process.cwd(), ...pathString.split('/'));

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
        result.push(newbase.slice(0, newbase.lastIndexOf('.')));
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

/**
 * Called before exit from cli,
 * @param {Object} options
 * @param {Number} exitCode
 */
function exitHandler(options, exitCode) {
  if (options.cleanup) {
    rmdirRecursiveSync('.debug');
    console.log('\n\nBiee 🐨✌️\n');
  }
  if (exitCode !== 0) console.log(exitCode);
  if (options.exit) process.exit();
}

/**
 * Captures groups from regex and executes RegEx.exec() function on all.
 *
 * @param {regex} regex - Regular Expression to execute on.
 * @param {string} template - HTML Template in string.
 * @return {object} sandbox
 * sandbox.matches - all matches of regex
 * sandbox.input - input string
 */
const execRegexOnAll = (regex, template) => {
  /** allMatches holds all the results of RegExp.exec() */
  const allMatches = [];
  let match = regex.exec(template);
  if (!match) {
    return { matches: [], input: template };
  }

  const { input } = match;

  while (match !== null) {
    delete match.input;
    allMatches.push(match);
    match = regex.exec(template);
  }

  return { matches: allMatches, input };
};

/**
 * console.log for errors, logs with error styles
 * @param {String} errorMessage message to log
 * @return {Void}
 */
const logError = (errorMessage) =>
  console.log(`${colors.boldRed('>>>')} ${errorMessage}`);

/**
 * console.log for warnings, logs with warning styles
 * @param {String} errorMessage message to log
 * @return {Void}
 */
const logWarning = (errorMessage) =>
  console.log(`${colors.yellow('>>>')} ${errorMessage}`);

const colors = {
  green: (message) => `\u001b[90m${message}\u001b[39m`,
  yellow: (message) => `\u001b[1m\u001b[33m${message}\u001b[39m\u001b[22m`,
  boldRed: (message) => `\u001b[1m\u001b[31m${message}\u001b[39m\u001b[22m`,
  boldGreen: (message) => `\u001b[1m\u001b[32m${message}\u001b[39m\u001b[22m`
};

module.exports = {
  getAbsolutePath,
  rmdirRecursiveSync,
  recursiveFindFiles,
  createPathIfAbsent,
  copyFolderSync,
  exitHandler,
  execRegexOnAll,
  logError,
  logWarning,
  colors
};

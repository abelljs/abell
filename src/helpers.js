const fs = require('fs');
const path = require('path');

/**
 *
 * @typedef {Object} AbellConfigs - Configurations from abell.config.js
 * @property {String} contentPath - Path to content directory (default 'content')
 * @property {String} sourcePath - Path to source directory (default 'src')
 * @property {String} destinationPath
 *  - Path to output destination (default 'dist', changes to 'debug' during dev-server)
 * @property {Object} globalMeta - Meta variables that are accessible globally in .abell files
 * @property {Array} ignoreInBuild
 *
 */

const relativeJoinedPath = (pathString) =>
  path.join(process.cwd(), ...pathString.split('/'));

const getDirectories = (source) => {
  return fs.readdirSync(source).filter((dirent) => {
    return fs.lstatSync(path.join(source, dirent)).isDirectory();
  });
};

const rmdirRecursiveSync = function (pathToRemove) {
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
};

const recursiveFindFiles = (base, ext, inputFiles, inputResult) => {
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
};

/**
 * @return {AbellConfigs}
 */
function getAbellConfigs() {
  let abellConfig;
  const defaultConfigs = {
    destinationPath: 'dist',
    sourcePath: 'theme',
    contentPath: 'content',
    ignoreInBuild: [],
    globalMeta: {}
  };

  try {
    // In dev-server, user may change the configs so in that case we should drop the old cache
    delete require.cache[path.join(process.cwd(), 'abell.config.js')];
    abellConfig = {
      ...defaultConfigs,
      ...require(path.join(process.cwd(), 'abell.config.js'))
    };

    if (Object.keys(abellConfig).length <= 0) {
      throw new Error( // eslint-disable-next-line
        `Something went wrong while fetching new configurations. Save again to refresh the dev server.`
      );
    }
  } catch (err) {
    console.log(yellow('>> ') + err.message);
    abellConfig = defaultConfigs;
  }

  const destinationPath = relativeJoinedPath(abellConfig.destinationPath);
  const sourcePath = relativeJoinedPath(abellConfig.sourcePath);
  const contentPath = relativeJoinedPath(abellConfig.contentPath);

  return {
    ...abellConfig,
    destinationPath,
    sourcePath,
    contentPath
  };
}

const createPathIfAbsent = (pathToCreate) => {
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
};

/**
 *
 * @param {String} from - Path to copy from
 * @param {String} to - Path to copy to
 * @param {Array} ignore - files/directories to ignore
 * @return {void}
 */
function copyFolderSync(from, to, ignore = []) {
  if (ignore.includes(from)) {
    return;
  }
  createPathIfAbsent(to);
  fs.readdirSync(from).forEach((element) => {
    const fromElement = path.join(from, element);
    const toElement = path.join(to, element);
    if (fs.lstatSync(fromElement).isFile()) {
      if (!ignore.includes(path.join(from, element))) {
        fs.copyFileSync(fromElement, toElement);
      }
    } else {
      copyFolderSync(fromElement, toElement, ignore);
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

const boldRed = (message) =>
  `\u001b[1m\u001b[31m${message}\u001b[39m\u001b[22m`;
const boldGreen = (message) =>
  `\u001b[1m\u001b[32m${message}\u001b[39m\u001b[22m`;
const grey = (message) => `\u001b[90m${message}\u001b[39m`;
const yellow = (message) => `\u001b[1m\u001b[33m${message}\u001b[39m\u001b[22m`;

module.exports = {
  getDirectories,
  rmdirRecursiveSync,
  recursiveFindFiles,
  getAbellConfigs,
  createPathIfAbsent,
  copyFolderSync,
  exitHandler,
  execRegexOnAll,
  boldGreen,
  boldRed,
  grey,
  yellow
};

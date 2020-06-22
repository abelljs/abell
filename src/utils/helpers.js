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
 * Reads and returns content of abell.config.js
 * @return {AbellConfigs}
 */
function getAbellConfigs() {
  let abellConfig;
  const defaultConfigs = {
    destinationPath: 'dist',
    sourcePath: 'theme',
    contentPath: 'content',
    plugins: [],
    globalMeta: {}
  };

  try {
    // In dev-server, user may change the configs so in that case we should drop the old cache
    delete require.cache[path.join(process.cwd(), 'abell.config.js')];
    const requiredConfig = require(path.join(process.cwd(), 'abell.config.js'));

    let mappedPlugins = [];
    if (requiredConfig.plugins && requiredConfig.plugins.length > 0) {
      mappedPlugins = requiredConfig.plugins.map((plugin) => {
        if (fs.existsSync(path.join(process.cwd(), plugin))) {
          return path.join(process.cwd(), plugin);
        }

        return plugin;
      });
    }

    abellConfig = {
      ...defaultConfigs,
      ...requiredConfig,
      plugins: mappedPlugins
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

  const destinationPath = getAbsolutePath(abellConfig.destinationPath);
  const sourcePath = getAbsolutePath(abellConfig.sourcePath);
  const contentPath = getAbsolutePath(abellConfig.contentPath);

  return {
    ...abellConfig,
    destinationPath,
    sourcePath,
    contentPath
  };
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

const boldRed = (message) =>
  `\u001b[1m\u001b[31m${message}\u001b[39m\u001b[22m`;
const boldGreen = (message) =>
  `\u001b[1m\u001b[32m${message}\u001b[39m\u001b[22m`;
const grey = (message) => `\u001b[90m${message}\u001b[39m`;
const yellow = (message) => `\u001b[1m\u001b[33m${message}\u001b[39m\u001b[22m`;

module.exports = {
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

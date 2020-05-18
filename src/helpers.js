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

const rmdirRecursiveSync = function(pathToRemove) {
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

const recFindByExt = (base, ext, inputFiles, inputResult) => {
  const files = inputFiles || fs.readdirSync(base);
  let result = inputResult || [];

  for (const file of files) {
    const newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = recFindByExt(newbase, ext, fs.readdirSync(newbase), result);
    } else {
      if (file.substr(-1 * (ext.length)) == ext) {
        result.push(newbase);
      }
    }
  };
  return result;
};

// Returns all .abell files in src folder except for [$slug]
const getAbellFiles = (sourcePath, extension) => {
  const absolutePaths = recFindByExt(sourcePath, extension);
  const relativePaths = absolutePaths
    .map((path) => {
      const pathWithoutExtension = path.split(extension)[0];
      const relativePath = pathWithoutExtension.split(`${sourcePath}/`)[1];
      return relativePath;
    })
    .filter((path) => {
      return path.split('[$slug]').length === 1;
    });
  return relativePaths;
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
      throw new Error( `Something went wrong while fetching new configurations. Save again to refresh the dev server.` ); // eslint-disable-line
    }
  } catch (err) {
    console.log(boldRed('>> ') + err.message);
    abellConfig = defaultConfigs;
  }

  const destinationPath = relativeJoinedPath(abellConfig.destinationPath);
  const sourcePath = relativeJoinedPath(abellConfig.sourcePath);
  const contentPath = relativeJoinedPath(abellConfig.contentPath);

  return {
    ...abellConfig,
    destinationPath,
    sourcePath,
    contentPath,
  };
}

const createPathIfAbsent = (pathToCreate) => {
  if (!fs.existsSync(pathToCreate)) {
    fs.mkdirSync(pathToCreate);
  }
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
  };
  createPathIfAbsent(to);
  fs.readdirSync(from).forEach((element) => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element), ignore);
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
    return {matches: [], input: template};
  }

  const {input} = match; 

  while (match !== null) {
    delete match.input;
    allMatches.push(match);
    match = regex.exec(template);
  }

  return {matches: allMatches, input};
};

const boldRed = (message) => `\u001b[1m\u001b[31m${message}\u001b[39m\u001b[22m`;
const boldGreen = (message) => `\u001b[1m\u001b[32m${message}\u001b[39m\u001b[22m`;
const grey = (message) => `\u001b[90m${message}\u001b[39m`;

module.exports = {
  getAbellFiles,
  getDirectories,
  rmdirRecursiveSync,
  getAbellConfigs,
  createPathIfAbsent,
  copyFolderSync,
  exitHandler,
  execRegexOnAll,
  boldGreen,
  boldRed,
  grey,
};

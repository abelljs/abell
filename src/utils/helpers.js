const fs = require('fs');
const path = require('path');

/**
 * @typedef {import('./typedefs').AbellConfigs}
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
 * Prefetchs links from given template and adds it to next template.
 * @param {Object} options
 * @param {String} options.from String of HTML/Abell template to fetch links from
 * @param {String} options.addTo String of HTML/ABELL template to add prefetch into
 *
 * @return {String}
 */
function prefetchLinksAndAddToPage({ from, addTo }) {
  const pageTemplate = addTo;

  // eslint-disable-next-line
  const regexToFetchPaths = /(?:<link +?rel=["']stylesheet['"] +?href=['"](.*?)['"])|(?:<script +?src=['"](.*?)['"])|(?:<link.+?href=["'](.*?)["'].+?as=["'](.*?)["'])/gs;
  const { matches } = execRegexOnAll(regexToFetchPaths, from);
  const headEndIndex = pageTemplate.indexOf('</head>');
  if (headEndIndex < 0) return pageTemplate; // does not have </head>
  // prettier-ignore
  const newPageTemplate =
    pageTemplate.slice(0, headEndIndex) +
    `  <!-- Abell prefetch -->\n` +
    matches
      .map((link) => {
        let stylesheet;
        let script;
        // stylesheet or script have a value if link is straighforward
        // (e.g <link rel="stylesheet" href="style.css">)
        ([stylesheet, script] = link.slice(1));
        // In some cases, user may have a little trickier links
        // (e.g <link rel="preload" href="next.js" as="script")
        if (!stylesheet && !script) {
          try {
            if (link[4] === 'style' && link[3].includes('.css')) {
              stylesheet = link[3];
            } else if (link[4] === 'script' && link[3].includes('.js')) {
              script = link[3];
            }
          } catch (err) {
            console.log(">> Could not recognize preloads, skipping the option..."); // eslint-disable-line max-len
          }
        }
        if (stylesheet) {
          return `  <link rel="prefetch" href="${stylesheet.replace('../','./')}" as="style" />`; // eslint-disable-line max-len
        } else if (script) {
          return `  <link rel="prefetch" href="${script.replace('../', './')}" as="script" />`; // eslint-disable-line max-len
        }
      })
      .join('\n') +
    '\n\n' +
    pageTemplate.slice(headEndIndex);

  return newPageTemplate;
}

/**
 *
 * @param {String} htmlTemplate
 * @param {String} prefix
 * @return {String}
 */
function addPrefixInHTMLPaths(htmlTemplate, prefix) {
  const { matches, input } = execRegexOnAll(
    / (?:href|src)=["'`](.*?)["'`]/g,
    htmlTemplate
  );

  let output = '';
  let lastIndex = 0;
  for (const match of matches) {
    if (match[1].startsWith('http') || match[1].startsWith('//')) continue;
    const indexToAddOn = match.index + match[0].indexOf(match[1]);
    output += input.slice(lastIndex, indexToAddOn) + prefix + '/';
    lastIndex = indexToAddOn;
  }
  output += input.slice(lastIndex);

  return output;
}

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
  prefetchLinksAndAddToPage,
  addPrefixInHTMLPaths,
  boldGreen,
  boldRed,
  grey,
  yellow
};

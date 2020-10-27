const path = require('path');
const os = require('os');

const { rmdirRecursiveSync } = require('./abell-fs.js');

/**
 *
 * @param {ProgramInfo} programInfo
 */
async function executeBeforeBuildPlugins(programInfo, { createContent }) {
  /** Before Build plugins */
  if (programInfo.abellConfig.plugins.length > 0) {
    console.log('\n>> Executing beforeBuild plugins');
  }
  for (const pluginPath of programInfo.abellConfig.plugins) {
    const currentPlugin = require(pluginPath);
    if (currentPlugin.beforeBuild) {
      console.log('> Plugin ' + path.relative(process.cwd(), pluginPath));

      await currentPlugin.beforeBuild(programInfo, { createContent });
    }
  }
}

/**
 *
 * @param {ProgramInfo} programInfo
 */
async function executeAfterBuildPlugins(programInfo) {
  /** After Build plugins */
  if (programInfo.abellConfig.plugins.length > 0) {
    console.log('\n>> Executing afterBuild plugins');
  }
  for (const pluginPath of programInfo.abellConfig.plugins) {
    const currentPlugin = require(pluginPath);
    if (currentPlugin.afterBuild) {
      console.log('> Plugin ' + path.relative(process.cwd(), pluginPath));
      await currentPlugin.afterBuild(programInfo);
    }
  }
}

const isBeforeHTMLLogged = {};
/**
 * executes beforeHTMLWrite plugins
 * @param {string} htmlOutput HTML code in string
 * @param {ProgramInfo} programInfo
 */
async function executeBeforeHTMLWritePlugins(htmlOutput, programInfo) {
  for (const pluginPath of programInfo.abellConfig.plugins) {
    const currentPlugin = require(pluginPath);
    const relativePluginPath = path.relative(process.cwd(), pluginPath);

    if (currentPlugin.beforeHTMLWrite) {
      if (
        programInfo.logs === 'complete' &&
        !isBeforeHTMLLogged[relativePluginPath]
      ) {
        console.log('> Activate beforeHTMLWrite for ' + relativePluginPath);
        isBeforeHTMLLogged[relativePluginPath] = true;
      }

      try {
        const tempHTML = htmlOutput;
        htmlOutput = await currentPlugin.beforeHTMLWrite(
          htmlOutput,
          programInfo
        );

        if (!htmlOutput) {
          htmlOutput = tempHTML;
        }
      } catch (err) {
        console.log(`ERROR in ${relativePluginPath}`);
        console.log(err);
      }
    }
  }

  return htmlOutput;
}

/**
 *
 * @desc get network address
 * @return {Number} address
 */
function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const ipInterface of interfaces[name]) {
      const { address, family, internal } = ipInterface;
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }
}

/**
 * Clears the local files from require cache
 * @param {String} themePath
 */
function clearLocalRequireCache(themePath) {
  Object.keys(require.cache)
    .filter((filePath) => !path.relative(themePath, filePath).startsWith('..'))
    .forEach((cachedFile) => {
      delete require.cache[cachedFile];
    });
}

/**
 * Called before exit from cli,
 * @param {Object} options
 * @param {Number} exitCode
 */
function exitHandler(options) {
  if (options.cleanup) {
    rmdirRecursiveSync('.debug');
    console.log('\n\nBiee 🐨✌️\n');
  }
  if (options.exit) process.exit();
}

/**
 * Captures groups from regex and executes RegEx.exec() function on all.
 *
 * @param {regex} regex - Regular Expression to execute on.
 * @param {string} template - HTML Template in string.
 * @return {object} sandbox
 * @return {String[]} sandbox.matches - all matches of regex
 * @return {String} sandbox.input - input string
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
 * adds given string to head tag of the html
 * @param {String} stringToAdd - String to add in HEAD
 * @param {String} htmlText - HTML Content in String
 * @return {String}
 */
function addToHeadEnd(stringToAdd, htmlText) {
  const headEndIndex = htmlText.indexOf('</head>');
  if (headEndIndex < 0) {
    // if the text does not have </head>
    return '<head>' + stringToAdd + '</head>' + htmlText;
  }

  const out =
    htmlText.slice(0, headEndIndex) +
    stringToAdd +
    htmlText.slice(headEndIndex);
  return out;
}

/**
 * adds given string to end of body tag of the html
 * @param {String} stringToAdd - String to add in BODY
 * @param {String} htmlText - HTML Content in String
 * @return {String}
 */
function addToBodyEnd(stringToAdd, htmlText) {
  const bodyEndIndex = htmlText.indexOf('</body>');
  if (bodyEndIndex < 0) {
    // if the text does not have </head>
    return htmlText + '<body>' + stringToAdd + '</body>';
  }

  return (
    htmlText.slice(0, bodyEndIndex) + stringToAdd + htmlText.slice(bodyEndIndex)
  );
}

/**
 * Remarkable plugin to add id to headers
 * @param {Object} md
 */
function anchorsPlugin(md) {
  const toSlug = (headerContent) =>
    headerContent
      .toLowerCase()
      .replace(
        /[\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\{\|\}\~\-]/g,
        ''
      )
      .replace(/\s/g, '-');

  md.renderer.rules.heading_open = function (tokens, idx) {
    return `<h${tokens[idx].hLevel} id="${toSlug(tokens[idx + 1].content)}">`;
  };
}

const standardizePath = (osPath) => osPath.replace(/\\/g, '/');

/**
 * console.log for errors, logs with error styles
 * @param {String} errorMessage message to log
 */
const logError = (errorMessage) => {
  console.log(`\n${colors.boldRed('>>>')} ${errorMessage}`);
  // prettier-ignore
  console.log(">> If you think this is Abell's fault, It would help if you Create an Issue at https://github.com/abelljs/abell/issues \n\n"); // eslint-disable-line
};

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
  executeBeforeBuildPlugins,
  executeAfterBuildPlugins,
  executeBeforeHTMLWritePlugins,
  getNetworkAddress,
  clearLocalRequireCache,
  exitHandler,
  execRegexOnAll,
  addToHeadEnd,
  addToBodyEnd,
  anchorsPlugin,
  standardizePath,
  logError,
  logWarning,
  colors
};

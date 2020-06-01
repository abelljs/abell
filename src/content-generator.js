const fs = require('fs');
const path = require('path');

const abellRenderer = require('abell-renderer');
const { Remarkable } = require('remarkable');
const md = new Remarkable({
  html: true
});

md.use(require('./remarkable-plugins/anchors.js'));

const {
  createPathIfAbsent,
  getAbellConfigs,
  getDirectories,
  execRegexOnAll
} = require('./helpers.js');

/**
 *
 * @typedef {Object} MetaInfo - Meta information from meta.json file in content dir
 * @property {String} $slug - slug of content
 * @property {Date} $createdAt - Date object with time of content creation
 * @property {Date} $modifiedAt - Date object with time of last modification
 *
 * @typedef {Object} ProgramInfo - Contains all the information required by the build to execute.
 * @property {import('./helpers.js').AbellConfigs} abellConfigs
 *  - Configuration from abell.config.js file
 * @property {String} contentTemplate - string of the template from [$slug]/index.abell file
 * @property {String} contentTemplatePath - path of the template (mostly [$slug]/index.abell file
 * @property {Object} vars - all global variables in .abell files
 * @property {MetaInfo[]} vars.$contentArray - An array of all MetaInfo
 * @property {Object} vars.$contentObj - Content meta info object
 * @property {Object} vars.globalMeta - meta info to be injected into .abell files
 * @property {Array} contentDirectories - List of names of all directories in content directory
 * @property {String} logs - logs in the console ('minimum', 'complete')
 * @property {String} templateExtension - extension of input file ('.abell' default)
 *
 */

/**
 * On given slug and base path of content folder,
 * returns object with all the meta information
 * @param {string} contentSlug slug of content
 * @param {string} contentPath path to content directory
 * @return {MetaInfo}
 */
function getContentMeta(contentSlug, contentPath) {
  let meta;

  const defaultMeta = {
    title: contentSlug,
    description: `Hi, This is ${contentSlug}...`
  };

  try {
    meta = {
      ...defaultMeta,
      ...JSON.parse(
        fs.readFileSync(
          path.join(contentPath, contentSlug, 'meta.json'),
          'utf-8'
        )
      )
    };
  } catch (err) {
    meta = defaultMeta;
  }

  let mtime;
  let ctime;

  ({ mtime, ctime } = fs.statSync(
    path.join(contentPath, contentSlug, 'index.md')
  ));

  if (meta.$createdAt) {
    ctime = new Date(meta.$createdAt);
  }

  if (meta.$modifiedAt) {
    mtime = new Date(meta.$modifiedAt);
  }

  return {
    ...meta,
    $slug: contentSlug,
    $modifiedAt: mtime,
    $createdAt: ctime
  };
}

/**
 * Returns meta informations of all the contents when directories is given
 * @param {Array} contentDirectories an array with names of all directories in content folder
 * @param {String} contentPath path to the content directory
 * @return {Object}
 */
function getContentMetaAll(contentDirectories, contentPath) {
  const contentMetaInfo = {};
  for (const contentSlug of contentDirectories) {
    contentMetaInfo[contentSlug] = getContentMeta(contentSlug, contentPath);
  }

  return contentMetaInfo;
}

/**
 * Returns the basic information needed for build execution
 * @return {ProgramInfo}
 */
function getBaseProgramInfo() {
  // Get configured paths of destination and content
  const abellConfigs = getAbellConfigs();
  let contentDirectories;
  let $contentObj;
  let $contentArray;

  if (fs.existsSync(abellConfigs.contentPath)) {
    contentDirectories = getDirectories(abellConfigs.contentPath);
    $contentObj = getContentMetaAll(
      contentDirectories,
      abellConfigs.contentPath
    );
    $contentArray = Object.values($contentObj).sort((a, b) =>
      a.$createdAt.getTime() > b.$createdAt.getTime() ? -1 : 1
    );
  }

  const contentTemplatePath = path.join(
    abellConfigs.sourcePath,
    '[$slug]',
    'index.abell'
  );

  let contentTemplate;
  if (fs.existsSync(contentTemplatePath)) {
    contentTemplate = fs.readFileSync(contentTemplatePath, 'utf-8');
  }

  const programInfo = {
    abellConfigs,
    contentTemplate: contentTemplate || null,
    contentDirectories: contentDirectories || [],
    contentTemplatePath,
    vars: {
      $contentArray: $contentArray || [],
      $contentObj: $contentObj || {},
      globalMeta: abellConfigs.globalMeta
    },
    logs: 'minimum'
  };

  return programInfo;
}

/**
 * @param {String} from - Path to copy from
 * @param {String} to - Path to paste to
 * Copy assets (images etc) from content folder (`content/my-cool-blog`) to destination folder
 * @return {void}
 */
function copyContentAssets(from, to) {
  // Read names of files from contentSlug
  const filesList = fs
    .readdirSync(from)
    .filter((val) => val !== 'index.md' && val !== 'meta.json');

  for (const filename of filesList) {
    fs.copyFileSync(path.join(from, filename), path.join(to, filename));
  }
}

/**
 * 1. Reads .md/.abell file from given path
 * 2. Converts it to html
 * 3. Adds variable to the new HTML and returns the HTML
 *
 * @param {String} mdPath
 * @param {String} contentPath
 * @param {Object} variables
 * @param {Object} options
 * @return {String}
 */
function importAndRender(mdPath, contentPath, variables) {
  const fileContent = fs.readFileSync(path.join(contentPath, mdPath), 'utf-8');
  const mdWithValues = abellRenderer.render(fileContent, variables); // Add variables to markdown
  const rendererdHTML = md.render(mdWithValues);
  return rendererdHTML;
}

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
 * 1. Read Template
 * 2. Render Template with abell-renderer and add variables
 * 3. Write to the destination.
 *
 * @param {String} filepath - filepath relative to source directory
 * @param {ProgramInfo} programInfo - all the information required for build
 * @return {void}
 */
function generateHTMLFile(filepath, programInfo) {
  let pageTemplate = fs.readFileSync(
    path.join(programInfo.abellConfigs.sourcePath, filepath + '.abell'),
    'utf-8'
  );

  if (filepath === 'index') {
    // Add prefetch to index page
    pageTemplate = prefetchLinksAndAddToPage({
      from: programInfo.contentTemplate,
      addTo: pageTemplate
    });
  }

  const variables = programInfo.vars;

  const view = {
    ...variables,
    $importContent: (path) =>
      importAndRender(path, programInfo.abellConfigs.contentPath, variables)
  };

  const pageContent = abellRenderer.render(pageTemplate, view, {
    basePath: path.join(
      programInfo.abellConfigs.sourcePath,
      path.dirname(filepath)
    ),
    allowRequire: true
  });

  fs.writeFileSync(
    path.join(programInfo.abellConfigs.destinationPath, filepath + '.html'),
    pageContent
  );
}

/**
 *  1. Create path
 *  2. Read Markdown
 *  3. Convert to HTML
 *  4. Render content HTML on programInfo.contentTemplate
 *
 * @method generateContentFile
 * @param {String} contentSlug
 * @param {ProgramInfo} programInfo all the information required for build
 * @return {void}
 *
 */
function generateContentFile(contentSlug, programInfo) {
  // Create Path of content if does not already exist
  createPathIfAbsent(
    path.join(programInfo.abellConfigs.destinationPath, contentSlug)
  );

  const variables = {
    ...programInfo.vars,
    $slug: contentSlug,
    meta: programInfo.vars.$contentObj[contentSlug]
  };

  const view = {
    ...variables,
    $importContent: (path) =>
      importAndRender(path, programInfo.abellConfigs.contentPath, variables)
  };

  // render HTML of content
  const contentHTML = abellRenderer.render(programInfo.contentTemplate, view, {
    basePath: path.dirname(programInfo.contentTemplatePath),
    allowRequire: true
  });

  // WRITE IT OUT!! YASSSSSS!!!
  fs.writeFileSync(
    path.join(
      programInfo.abellConfigs.destinationPath,
      contentSlug,
      'index.html'
    ),
    contentHTML
  );

  // Copy assets from content's folder to actual destination
  copyContentAssets(
    path.join(programInfo.abellConfigs.contentPath, contentSlug),
    path.join(programInfo.abellConfigs.destinationPath, contentSlug)
  );
}

module.exports = {
  getContentMeta,
  getContentMetaAll,
  getBaseProgramInfo,
  generateContentFile,
  generateHTMLFile,
  importAndRender,
  prefetchLinksAndAddToPage
};

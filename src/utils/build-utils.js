const fs = require('fs');
const path = require('path');
const abellRenderer = require('abell-renderer');
const { Remarkable } = require('remarkable');

const md = new Remarkable({
  html: true
});

const {
  logWarning,
  anchorsPlugin,
  standardizePath
} = require('./general-helpers.js');

const {
  recursiveFindFiles,
  getAbsolutePath,
  replaceExtension,
  getFirstLine
} = require('./abell-fs.js');

md.use(anchorsPlugin);

// Functions!

/**
 * Returns the basic information needed for build execution
 * @return {ProgramInfo}
 */
function getProgramInfo() {
  // Get configured paths of destination and content
  const abellConfig = getAbellConfig();

  const programInfo = {
    abellConfig,
    contentMap: buildContentMap(abellConfig.contentPath),
    templateMap: buildTemplateMap(abellConfig.themePath),
    task: '',
    logs: 'minimum',
    command: {},
    port: 5000
  };

  return programInfo;
}

/**
 * Builds Source Content tree
 * @param {String} contentPath
 * @param {Object} options
 * @param {Boolean} options.keepPluginContent - keep the existing plugin content
 * @param {ContentMap} options.existingTree
 * @return {ContentMap}
 */
function buildContentMap(contentPath, options = { keepPluginContent: false }) {
  if (!fs.existsSync(contentPath)) {
    return {};
  }
  // Build the tree which has all information about content
  const relativeSlugs = recursiveFindFiles(contentPath, 'index.md')
    .map((mdPath) => path.dirname(path.relative(contentPath, mdPath)))
    .filter((fileDirectories) => fileDirectories !== '.');

  // Create a source object with slugs as keys and their meta values as properties
  const source = {};
  for (const slug of relativeSlugs) {
    source[slug] = getContentMeta(slug, { contentPath });
  }

  if (!options.keepPluginContent) {
    // If keep plugin content is false, return local content's tree
    return source;
  }

  // else add plugin content from existing tree (mostly used in abell serve)
  const pluginContent = Object.values(options.existingTree).filter(
    (contentObj) => contentObj.$source !== 'local'
  );

  for (const contentObj of pluginContent) {
    source[contentObj.$path] = contentObj;
  }

  return source;
}

/**
 * Build template tree
 * @param {String} themePath - path to directory that has theme source
 * @return {TemplateMap}
 */
function buildTemplateMap(themePath) {
  // Builds tree with all information of .abell files
  const abellTemplatesInTheme = recursiveFindFiles(themePath, '.abell');
  const theme = {};
  for (const template of abellTemplatesInTheme) {
    if (getFirstLine(template).trim().includes('<AbellComponent>')) {
      continue;
    }

    const relativePath = path.relative(themePath, template);
    const shouldLoop = path.dirname(relativePath).endsWith('[path]')
      ? true
      : false;

    theme[relativePath] = {
      shouldLoop,
      templatePath: relativePath,
      htmlPath: replaceExtension(relativePath, '.html'),
      $root: path.relative(
        path.join(themePath, path.dirname(relativePath)),
        themePath
      )
    };
  }

  return theme;
}

/**
 * Maps values from plugin to actual Abell's content node
 * @param {PluginNode} pluginNode Similar to meta info but includes content as well
 * @return {MetaInfo}
 */
function getSourceNodeFromPluginNode(pluginNode) {
  return {
    ...pluginNode,
    title: pluginNode.title || pluginNode.slug,
    description: pluginNode.description || `This is ${pluginNode.slug}...`,
    $path: pluginNode.slug,
    $slug: pluginNode.slug,
    $createdAt: pluginNode.createdAt || new Date(),
    $modifiedAt: pluginNode.modifiedAt || pluginNode.createdAt || new Date(),
    $root: '..',
    $source: 'plugin'
  };
}

/**
 * Reads meta.json and adds additional meta values.
 * @param {String} slug - slug of the content
 * @param {Object} options
 * @param {String} options.contentPath - mostly 'content', directory that has content.
 * @return {MetaInfo}
 */
function getContentMeta(slug, { contentPath }) {
  // Reads meta.json of given slug
  let mtime;
  let ctime;

  // slug variable includes deep paths when the content is nested.
  // onlySlug will only have slug of the last folder.
  let onlySlug = slug;
  if (slug.includes(path.sep)) {
    onlySlug = slug.slice(slug.lastIndexOf(path.sep) + 1);
  }

  const defaultMeta = {
    title: onlySlug,
    description: `Hi, This is ${onlySlug}...`
  };

  // Read data defined in meta.json or meta.js file of content
  let definedMetaData = {};
  if (fs.existsSync(path.join(contentPath, slug, 'meta.json'))) {
    definedMetaData = require(path.join(contentPath, slug, 'meta.json'));
  } else if (fs.existsSync(path.join(contentPath, slug, 'meta.js'))) {
    definedMetaData = require(path.join(contentPath, slug, 'meta.js'));
  }

  // Read createdAt and modifiedAt time
  ({ mtime, ctime } = fs.statSync(path.join(contentPath, slug)));

  // If time is defined, then overwrite it with defined time.
  if (definedMetaData.$createdAt) {
    ctime = new Date(definedMetaData.$createdAt);
  }

  if (definedMetaData.$modifiedAt) {
    mtime = new Date(definedMetaData.$modifiedAt);
  }

  return {
    ...defaultMeta,
    ...definedMetaData,
    $slug: onlySlug,
    $source: 'local',
    $modifiedAt: mtime,
    $createdAt: ctime,
    $path: standardizePath(slug),
    $root: standardizePath(
      path.relative(path.join(contentPath, slug), contentPath)
    )
  };
}

/**
 * Reads and returns content of abell.config.js
 * @return {AbellConfigs}
 */
function getAbellConfig() {
  let abellConfig;
  const defaultConfigs = {
    outputPath: 'dist',
    themePath: 'theme',
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
  } catch (err) {
    logWarning(err.message);
    abellConfig = defaultConfigs;
  }

  const outputPath = getAbsolutePath(abellConfig.outputPath);
  const themePath = getAbsolutePath(abellConfig.themePath);
  const contentPath = getAbsolutePath(abellConfig.contentPath);

  return {
    ...abellConfig,
    outputPath,
    themePath,
    contentPath
  };
}

/**
 * 1. Reads .md/.abell file from given path
 * 2. Converts it to html
 * 3. Adds variable to the new HTML and returns the HTML
 *
 * @param {String} fullMDPath
 * @param {Object} variables
 * @return {String}
 */
function renderMarkdown(fullMDPath, variables) {
  const fileContent = fs.readFileSync(fullMDPath, 'utf-8');
  const mdWithValues = abellRenderer.render(fileContent, variables, {
    filename: path.relative(process.cwd(), fullMDPath)
  }); // Add variables to markdown

  // .replace method below avoids escaping '\.' from markdown which it would do otherwise
  const rendererdHTML = md.render(mdWithValues.replace(/\\./g, '\\\\.'));
  return rendererdHTML;
}

module.exports = {
  getProgramInfo,
  buildContentMap,
  buildTemplateMap,
  getSourceNodeFromPluginNode,
  getAbellConfig,
  getContentMeta,
  renderMarkdown,
  md
};

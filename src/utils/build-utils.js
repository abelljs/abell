const fs = require('fs');
const path = require('path');
const abellRenderer = require('abell-renderer');
const { Remarkable } = require('remarkable');

const md = new Remarkable({
  html: true
});

const {
  recursiveFindFiles,
  getAbsolutePath,
  logWarning,
  anchorsPlugin
} = require('./general-helpers.js');

md.use(anchorsPlugin);

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
  let definedMetaData;
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
    $path: slug,
    $root: slug
      .split(path.sep)
      .map(() => '..')
      .join(path.sep)
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
 * Returns the basic information needed for build execution
 * @return {ProgramInfo}
 */
function getProgramInfo() {
  // Get configured paths of destination and content
  const abellConfig = getAbellConfig();

  const programInfo = {
    abellConfig,
    contentTree: buildSourceContentTree(abellConfig.contentPath),
    templateTree: buildTemplateTree(abellConfig.themePath),
    logs: 'minimum',
    port: 5000,
    socketPort: 3000
  };

  return programInfo;
}

/**
 * Builds Source Content tree
 * @param {String} contentPath
 * @return {ContentTree}
 */
function buildSourceContentTree(contentPath) {
  if (!fs.existsSync(contentPath)) {
    return {};
  }
  // Build the tree which has all information about content
  const relativeSlugs = recursiveFindFiles(
    contentPath,
    'index.md'
  ).map((mdPath) => path.dirname(path.relative(contentPath, mdPath)));

  // Create a source object with slugs as keys and their meta values as properties
  const source = {};
  for (const slug of relativeSlugs) {
    source[slug] = getContentMeta(slug, { contentPath });
  }

  return source;
}

/**
 * Build template tree
 * @param {String} themePath - path to directory that has theme source
 * @return {String[]}
 */
function buildTemplateTree(themePath) {
  // Builds tree with all information of .abell files
  const abellTemplatesInTheme = recursiveFindFiles(themePath, '.abell');
  const theme = {};
  for (const template of abellTemplatesInTheme) {
    const relativePath = path.relative(themePath, template);
    const shouldLoop = path.dirname(relativePath).endsWith('[$path]')
      ? true
      : false;

    theme[relativePath] = {
      shouldLoop,
      $path: relativePath,
      $root: path.dirname(relativePath).includes(path.sep)
        ? path
            .dirname(relativePath)
            .split(path.sep)
            .map(() => '..')
            .join(path.sep)
        : ''
    };
  }

  return theme;
}

/**
 *
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
    $createdAt: pluginNode.createdAt,
    $modifiedAt: pluginNode.modifiedAt || pluginNode.createdAt,
    $root: '..',
    $source: 'plugin'
  };
}

/**
 * 1. Reads .md/.abell file from given path
 * 2. Converts it to html
 * 3. Adds variable to the new HTML and returns the HTML
 *
 * @param {String} mdPath
 * @param {String} contentPath
 * @param {Object} variables
 * @return {String}
 */
function renderMarkdown(mdPath, contentPath, variables) {
  try {
    const fileContent = fs.readFileSync(
      path.join(contentPath, mdPath),
      'utf-8'
    );
    const mdWithValues = abellRenderer.render(fileContent, variables); // Add variables to markdown
    const rendererdHTML = md.render(mdWithValues);
    return rendererdHTML;
  } catch (err) {
    console.log(
      `Error in {{ $importContent() }} at ['$path']/index.abell\n${mdPath} may not exist! Look log below for more details` // eslint-disable-line
    );
    throw err;
  }
}

module.exports = {
  getAbellConfig,
  getContentMeta,
  getProgramInfo,
  buildSourceContentTree,
  buildTemplateTree,
  getSourceNodeFromPluginNode,
  renderMarkdown,
  md
};

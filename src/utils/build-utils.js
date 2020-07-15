const fs = require('fs');
const path = require('path');
const { getAbsolutePath, logWarning } = require('./general-helpers.js');

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

  const defaultMeta = {
    title: slug,
    description: `Hi, This is ${slug}...`
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

  // slug variable includes deep paths when the content is nested.
  // onlySlug will only have slug of the last folder.
  let onlySlug = slug;
  if (slug.includes(path.sep)) {
    onlySlug = slug.slice(slug.lastIndexOf(path.sep) + 1);
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
  } catch (err) {
    logWarning(err.message);
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

module.exports = { getAbellConfig, getContentMeta };

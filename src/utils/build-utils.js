const fs = require('fs');
const path = require('path');
const { getAbsolutePath, logWarning } = require('./general-helpers.js');

/**
 * Reads meta.json
 */
function getMeta() {
  // Reads meta.json of given slug
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

module.exports = { getAbellConfig, getMeta };

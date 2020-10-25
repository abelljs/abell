const path = require('path');

/**
 * Returns responsive path that remains same even in windows
 * @param {string} pathString path to the file/folder
 * @return {string}
 */
const resPath = (pathString) => pathString.replace(/\//g, path.sep);

module.exports = {
  resPath
};

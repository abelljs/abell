module.exports = {
  sourcePath: 'src',
  destinationPath: 'dist',
  contentPath: 'content',
  ignoreInDist: ['data'],
  globalMeta: {
    siteName: 'Abell Test Working!'
  },
  plugins: ['plugins/test-plugin.js']
};

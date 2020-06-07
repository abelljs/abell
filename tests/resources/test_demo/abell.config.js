module.exports = {
  sourcePath: 'src',
  destinationPath: 'dist',
  contentPath: 'content',
  ignoreInBuild: ['data'],
  globalMeta: {
    siteName: 'Abell Test Working!'
  },
  plugins: ['plugins/test-plugin.js']
};

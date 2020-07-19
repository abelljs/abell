/**
 * Executed on `abell serve`
 * @param {Object} command
 */
async function serve(command) {
  const programInfo = getProgramInfo();

  // createContent function that goes to plugins
  const createContent = (pluginNode) => {
    programInfo.contentTree[pluginNode.slug] = getSourceNodeFromPluginNode(
      pluginNode
    );
  };

  await executeBeforeBuildPlugins(programInfo, { createContent });
  // constant till here

  /**
   * TODO: Everything after this!
   */

  programInfo.port = command.port || 5000;
  programInfo.socketPort = command.socketPort || 3000;
  programInfo.task = 'serve';
  programInfo.logs = 'minimum';
  programInfo.abellConfigs.destinationPath = '.debug';

  runDevServer(programInfo);
  executeAfterBuildPlugins(programInfo);
}

module.exports = serve;

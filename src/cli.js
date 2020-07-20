const fs = require('fs');
const build = require('./commands/build.js');
const serve = require('./commands/serve.js');
const program = require('commander');

const { getBaseProgramInfo, loadContent } = require('./utils/build-utils.js');
const { grey, boldRed, boldGreen } = require('./utils/helpers.js');
const {
  executeAfterBuildPlugins,
  executeBeforeBuildPlugins
} = require('./utils/plugin-utils.js');

program.version(require('../package.json').version);

/**
 * Executed on `abell build`
 */
async function onBuildCommand() {
  try {
    const buildStartTime = new Date().getTime();

    const programInfo = getBaseProgramInfo();

    await executeBeforeBuildPlugins(programInfo);

    if (fs.existsSync(programInfo.abellConfigs.contentPath)) {
      const { contentDirectories, $contentObj, $contentArray } = loadContent(
        programInfo.abellConfigs.contentPath
      );

      programInfo.contentDirectories = contentDirectories;
      programInfo.vars.$contentObj = $contentObj;
      programInfo.vars.$contentArray = $contentArray;
    }

    programInfo.logs = 'complete';
    programInfo.task = 'build';
    build(programInfo);
    executeAfterBuildPlugins(programInfo);

    const buildTime = new Date().getTime() - buildStartTime;
    console.log(
      `\n\n${boldGreen(
        '>>>'
      )} Abell Build complete (Built in ${buildTime}ms) 🚀✨\n\n`
    );
  } catch (err) {
    console.log(err);
    console.log(`\n\n${boldRed('>>>')} Abell Build Failed 😭 \n`);
    console.log(
      `${boldRed(
        '>>'
        // eslint-disable-next-line max-len
      )} If you think there's something wrong in Abell, It would be very helpful if you could report bug with above logs at ${grey(
        'https://github.com/abelljs/abell/issues'
      )}\n\n`
    );
  }
}

/**
 * Executed on `abell serve`
 * @param {Object} command
 */
async function onServeCommand(command) {
  const programInfo = getBaseProgramInfo();
  await executeBeforeBuildPlugins(programInfo);

  if (fs.existsSync(programInfo.abellConfigs.contentPath)) {
    const { contentDirectories, $contentObj, $contentArray } = loadContent(
      programInfo.abellConfigs.contentPath
    );

    programInfo.contentDirectories = contentDirectories;
    programInfo.vars.$contentObj = $contentObj;
    programInfo.vars.$contentArray = $contentArray;
  }

  programInfo.port = command.port || 5000;
  programInfo.task = 'serve';
  programInfo.logs = 'minimum';
  programInfo.abellConfigs.destinationPath = '.debug';

  serve(programInfo);
  executeAfterBuildPlugins(programInfo);
}

/**
 * Command Handlers
 */

program.command('build').action(onBuildCommand);

program
  .command('serve')
  .option('--port [port]', 'Serve on different port')
  .action(onServeCommand);

program.parse(process.argv); // required for commander to parse arguments

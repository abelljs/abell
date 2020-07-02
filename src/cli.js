const fs = require('fs');
const path = require('path');
const build = require('./commands/build.js');
const serve = require('./commands/serve.js');
const program = require('commander');

const { getBaseProgramInfo, loadContent } = require('./utils/build-utils');
const { grey, boldRed, boldGreen } = require('./utils/helpers.js');

program.version(require('../package.json').version);

program.command('build').action(async () => {
  try {
    const buildStartTime = new Date().getTime();

    const programInfo = getBaseProgramInfo();

    /** Before Build plugins */
    for await (const pluginPath of programInfo.abellConfigs.plugins) {
      const currentPlugin = require(pluginPath);
      if (currentPlugin.beforeBuild) {
        console.log(
          '>> Plugin BeforeBuild: Executing ' +
            path.relative(process.cwd(), pluginPath)
        );

        await currentPlugin.beforeBuild(programInfo);
      }
    }

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
});

program
  .command('serve')
  .option('--port [port]', 'Serve on different port')
  .option('--socket-port [socketPort]', 'Serve on different port')
  .action((command) => {
    const programInfo = getBaseProgramInfo();

    if (fs.existsSync(programInfo.abellConfigs.contentPath)) {
      const { contentDirectories, $contentObj, $contentArray } = loadContent(
        programInfo.abellConfigs.contentPath
      );

      programInfo.contentDirectories = contentDirectories;
      programInfo.vars.$contentObj = $contentObj;
      programInfo.vars.$contentArray = $contentArray;
    }

    programInfo.port = command.port || 5000;
    programInfo.socketPort = command.socketPort || 3000;
    programInfo.task = 'serve';
    programInfo.logs = 'minimum';
    programInfo.abellConfigs.destinationPath = '.debug';

    serve(programInfo);
  });

program.parse(process.argv);

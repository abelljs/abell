#!/usr/bin/env node

const build = require('./build.js');
const serve = require('./serve.js');
const program = require('commander');

const { getBaseProgramInfo } = require('./content-generator');
const { boldGreen, boldRed, grey } = require('./helpers.js');

program.version(require('../package.json').version);

program.command('build').action(() => {
  try {
    const buildStartTime = new Date().getTime();
    const programInfo = getBaseProgramInfo();
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
  .action((command) => {
    const programInfo = getBaseProgramInfo();
    programInfo.port = command.port || 5000;
    programInfo.task = 'serve';
    programInfo.logs = 'minimum';
    programInfo.abellConfigs.destinationPath = '.debug';

    serve(programInfo);
  });

program.parse(process.argv);

module.exports = { build, serve };

#!/usr/bin/env node

const action = require('./action');
const program = require('commander');

const { getBaseProgramInfo } = require('./content-generator');

program.version(require('../package.json').version);

program
  .command('build')
  .action(() => {
    const programInfo = getBaseProgramInfo();
    programInfo.logs = 'complete';
    programInfo.task = 'build';
    action.build(programInfo);
  });

program
  .command('serve')
  .option('--port [port]', 'Serve on different port')
  .action((command) => {
    action.serve(command.port);
  })

program.parse(process.argv);

module.exports = action;
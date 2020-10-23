#!/usr/bin/env node

/**
 * It is very unlikely that you would have to change anything in this file
 * since it only deals with exporting right functions to users.
 */

// This is the file that gets called first on `abell [command]`
// The code from src/index.js is executed
const program = require('commander');
const build = require('../src/commands/build.js');
const serve = require('../src/commands/serve.js');

// Listeners

/** abell build */
program.command('build').action(build);

/** abell serve */
program
  .command('serve')
  .option('--port [port]', 'Serve on different port')
  .option('--ignore-plugins', 'Serve without plugins', false)
  .option('--print-ip [printIp]', 'Print IP in serve', true)
  .action(serve);

/** abell -V */
program.version(require('../package.json').version);

program.parse(process.argv); // required for commander to parse arguments

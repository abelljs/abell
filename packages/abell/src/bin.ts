#!/usr/bin/env node

// This is the file that gets called first on `abell [command]`
import { createCommand } from 'commander';

import build from './commands/generate';
import serve from './commands/dev';

const program = createCommand();

// Listeners

/** abell generate */
program.command('generate').alias('build').action(build);

/** abell dev */
program
  .command('dev')
  .alias('serve')
  // @ts-ignore
  .option('--port [port]', 'Serve on different port', 3000)
  .option('--ignore-plugins', 'Serve without plugins', false)
  .option('--print-ip [printIp]', 'Print IP in serve', true)
  .action(serve);

/** abell -V */
// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../package.json').version);

program.parse(process.argv); // required for commander to parse arguments

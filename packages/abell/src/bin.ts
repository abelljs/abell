#!/usr/bin/env node

// This is the file that gets called first on `abell [command]`
import { createCommand } from 'commander';

import build from './commands/build';
import serve from './commands/serve';

const program = createCommand();

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
// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../package.json').version);

program.parse(process.argv); // required for commander to parse arguments

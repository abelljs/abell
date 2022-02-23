#!/usr/bin/env node

// This is the file that gets called first on `abell [command]`
import { createCommand } from 'commander';

import generate from './cli/generate';
import dev from './cli/dev';

const program = createCommand();

// Listeners

/** abell generate */
program.command('generate').alias('build').action(generate);

/** abell dev */
program
  .command('dev')
  .alias('serve')
  .option('--port [port]', 'Serve on different port', '3000')
  .action(dev);

/** abell -V */
// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../package.json').version);

program.parse(process.argv); // required for commander to parse arguments

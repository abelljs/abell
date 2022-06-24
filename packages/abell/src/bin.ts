#!/usr/bin/env node

// This is the file that gets called first on `abell [command]`
import path from 'path';
import { createCommand } from 'commander';

import generate from './cli/generate';
import dev from './cli/dev';
import { rmdirRecursiveSync } from './utils/internal-utils';

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

/** Used after postinstall  */
program.command('clear-cache').action(() => {
  const ABELL_CACHE_DIR = path.join(process.cwd(), 'node_modules', '.abell');
  rmdirRecursiveSync(ABELL_CACHE_DIR);
});

/** abell -V */
// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../package.json').version);

program.parse(process.argv); // required for commander to parse arguments

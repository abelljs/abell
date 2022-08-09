#!/usr/bin/env node

// This is the file that gets called first on `abell [command]`
import path from 'path';
import { createCommand } from 'commander';

import generate from './cli/generate';
import dev from './cli/dev';
import { NODE_MODULES_DIR, rmdirRecursiveSync } from './utils/internal-utils';

const program = createCommand();

// Listeners

/**
 * @TODO
 *
 * When we try `npx abell dev` or `npx abell generate` on project which doesn't have package.json,
 * - Add package.json
 * - Install abell
 * - Run the command
 * - Remove added files
 */

/**
 * @TODO
 *
 * Add option in makeRoutes to copy the assets somehow so that paths are resolved correctly
 *
 * ORRRR from plugin, change markdown URLs to resolved URLs
 *
 * Basically somehow get the local directory paths working in markdown
 */

/**
 * What I worked on last time,
 *
 * Added option to set outputPathPattern to '[route]/index.html'
 */

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
  const ABELL_CACHE_DIR = path.join(NODE_MODULES_DIR, '.abell');
  rmdirRecursiveSync(ABELL_CACHE_DIR);
});

/** abell -V */
// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../package.json').version);

program.parse(process.argv); // required for commander to parse arguments

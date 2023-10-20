#!/usr/bin/env node

// This is the file that gets called first on `abell [command]`
import commander from 'commander';

import generate from './cli/generate.js';
import dev from './cli/dev.js';
import { getAbellVersion, clearCache } from './utils/internal-utils.js';

const program = commander.createCommand();

// Listeners

/**
 * @TODO
 *
 * Add option in makeRoutes to copy the assets somehow so that paths are resolved correctly
 *
 * ORRRR from plugin, change markdown URLs to resolved URLs
 *
 * Basically somehow get the local directory paths working in markdown
 */

/** abell generate */
program.command('generate').alias('build').action(generate);

/** abell dev */
program
  .command('dev')
  .alias('serve')
  .option('--port [port]', 'Serve on different port', '3000')
  .option('--open', 'opens the dev-server in your default browser', false)
  .action(dev);

/** Used after postinstall  */
program.command('clear-cache').action(clearCache);

/** abell -V */
// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(getAbellVersion());

program.parse(process.argv); // required for commander to parse arguments

#!/usr/bin/env node

// This is the file that gets called first on `abell [command]`
import fs from 'fs';
import path from 'path';
import commander from 'commander';

import generate from './cli/generate.js';
import dev from './cli/dev.js';
import {
  rmdirRecursiveSync,
  getAbellVersion,
  getConfigPath,
  getBasePaths
} from './utils/internal-utils.js';

const program = commander.createCommand();

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
program.command('clear-cache').action(async () => {
  const configFile = getConfigPath(process.cwd());
  const { ROOT } = await getBasePaths({
    configFile,
    command: 'generate'
  });
  const ABELL_CACHE_DIR = path.join(ROOT, 'node_modules', '.abell');
  if (fs.existsSync(ABELL_CACHE_DIR)) {
    rmdirRecursiveSync(ABELL_CACHE_DIR);
    console.log('>> Abell cache go whoooshhhh 🧹');
  }
});

/** abell -V */
// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(getAbellVersion());

program.parse(process.argv); // required for commander to parse arguments

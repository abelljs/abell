#!/usr/bin/env node
import { createCommand } from 'commander';
import create, { CreateAbellOptions } from './create';

const program = createCommand();
/**
 * npx create-abell [projectName] --template <template> --installer <installer>
 */
program
  .option('-t|--template <template>', 'Specify template for abell app')
  .option(
    '-i|--installer <installer>',
    'Specify package installer. npm, pnpm, bun, or yarn.'
  )
  .arguments('[projectName]')
  .action((projectName: string | undefined, options: CreateAbellOptions) =>
    create(projectName, {
      template: options.template,
      installer: options.installer
    })
  );

// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../package.json').version, '-v|--version');
program.parse(process.argv);

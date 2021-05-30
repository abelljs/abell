// This is the file that gets called first on `abell [command]`
import { createCommand } from 'commander';
const program = createCommand();

// Listeners

/** abell build */
program.command('build').action((command) => {
  console.log(command);
});

/** abell serve */

type ServeOptions = {
  port?: number;
  ignorePlugins?: boolean;
  printIp?: boolean;
};

program
  .command('serve')
  .option('--port [port]', 'Serve on different port')
  .option('--ignore-plugins', 'Serve without plugins', false)
  .option('--print-ip [printIp]', 'Print IP in serve', true)
  .action((command: ServeOptions) => {
    console.log(command);
  });

/** abell -V */
program.version(require('../package.json').version);

program.parse(process.argv); // required for commander to parse arguments

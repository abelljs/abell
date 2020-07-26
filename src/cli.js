const program = require('commander');
const build = require('./commands/build.js');
const serve = require('./commands/serve.js');

// Listeners

/** abell build */
program.command('build').action(build);

/** abell serve */
program.command('serve').action(serve);

/** abell -V */
program.version(require('../package.json').version);

program.parse(process.argv); // required for commander to parse arguments

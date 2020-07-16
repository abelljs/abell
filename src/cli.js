const program = require('commander');
const build = require('./commands/build');

// Listeners

/** abell build */
program.command('build').action(build);

/** abell -V */
program.version(require('../package.json').version);

program.parse(process.argv); // required for commander to parse arguments

const program = require('commander');
const {
  getProgramInfo,
  buildSourceContentTree
} = require('./utils/prerender-tasks.js');

// const { getBaseProgramInfo }

/**
 * Executed on `abell build`
 */
async function onBuildCommand() {
  // - Get baseProgramInfo
  // - Execute beforeBuild plugins and let them add extra content or template if needed.
  // - Get All information of source content in a tree
  // - Get all information of template in template tree
  // const buildStartTime = new Date().getTime();
  const programInfo = getProgramInfo();
  console.log(programInfo);
  // Execute beforeBuild plugins and pass programInfo
  programInfo.contentTree = buildSourceContentTree(
    programInfo.abellConfig.contentPath
  );
}

// Listeners

/** abell build */
program.command('build').action(onBuildCommand);

/** abell -V */
program.version(require('../package.json').version);

program.parse(process.argv); // required for commander to parse arguments

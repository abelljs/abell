const fs = require('fs');
const path = require('path');

const afterBuild = (programInfo) => {
  if (programInfo.task === 'serve') return;

  fs.writeFileSync(
    path.join(programInfo.abellConfigs.destinationPath, 'built-by-plugin.json'),
    JSON.stringify(programInfo.vars.$contentObj, {}, 2)
  )
}

module.exports = { afterBuild }
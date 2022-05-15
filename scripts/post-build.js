const fs = require('fs');
const path = require('path');

const packageName = process.argv[2];
const DIST = path.join(__dirname, '..', 'packages', packageName, 'dist');
if (!fs.existsSync(DIST)) {
  throw new Error(`${DIST} doesn't exist`);
}

const green = (message) => `\u001b[32m${message}\u001b[39m`;

try {
  const fd = fs.openSync(path.join(DIST, 'bin.js'), 'r');
  fs.fchmodSync(fd, 511);
  console.log('> Changed bin.js file persmission to executable');
  console.log(`\n>> ${green(`[${packageName}]`)}: built successfully 🌻`);
} catch (error) {
  console.log(error);
}

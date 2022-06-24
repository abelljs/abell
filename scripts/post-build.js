const fs = require('fs');
const path = require('path');

function rmdirRecursiveSync(pathToRemove) {
  if (fs.existsSync(pathToRemove)) {
    fs.readdirSync(pathToRemove).forEach((file) => {
      const curPath = path.join(pathToRemove, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        rmdirRecursiveSync(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToRemove);
  }
}

const packageName = process.argv[2];
const DIST = path.join(__dirname, '..', 'packages', packageName, 'dist');
if (!fs.existsSync(DIST)) {
  throw new Error(`${DIST} doesn't exist`);
}

const green = (message) => `\u001b[32m${message}\u001b[39m`;

try {
  const fd = fs.openSync(path.join(DIST, 'bin.js'), 'r');
  fs.fchmodSync(fd, 511);
  rmdirRecursiveSync(path.join(__dirname, '..', 'packages', '.abell'));
  console.log('> Changed bin.js file persmission to executable');
  console.log(`\n>> ${green(`[${packageName}]`)}: built successfully 🌻`);
} catch (error) {
  console.log(error);
}

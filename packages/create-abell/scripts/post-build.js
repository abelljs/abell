const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');

try {
  const fd = fs.openSync(path.join(DIST, 'bin.js'), 'r');
  fs.fchmodSync(fd, 511);
  console.log('> Changed bin.js file persmission to executable');
} catch (error) {
  console.log(error);
}

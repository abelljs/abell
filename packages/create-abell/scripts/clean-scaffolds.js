const fs = require('fs');
const path = require('path');
const { deleteDir } = require('../dist/utils');

function clean() {
  const scaffoldDir = path.join(__dirname, '..', 'scaffold-dir');
  deleteDir(scaffoldDir);
  fs.mkdirSync(scaffoldDir);
}

clean();

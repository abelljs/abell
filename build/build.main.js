const fse = require('fs-extra');

fse.removeSync('dist');
fse.copySync('src', 'dist');

console.log('>> Abell built 🌻 ');

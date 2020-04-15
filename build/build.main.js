const fse = require('fs-extra');

fse.copySync('src', 'dist');

console.log(">> Abell built 🌻 ");
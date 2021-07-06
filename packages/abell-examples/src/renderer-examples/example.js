const fs = require('fs');
const path = require('path');
const abellRenderer = require('abell-renderer');

// TODO: set up script to run this example
const finalCode = abellRenderer.render(
  fs.readFileSync(path.join(__dirname, 'index.abell'), 'utf-8'),
  {},
  {}
);
console.log(finalCode);

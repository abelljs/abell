import fs from 'fs';
import path from 'path';
import abellRenderer from 'abell-renderer/src/index'; // import unbundled source

// TODO: set up script to run this example
const finalCode = abellRenderer.render(
  fs.readFileSync(path.join(__dirname, 'index.abell'), 'utf-8'),
  {},
  {
    allowComponents: true,
    allowRequire: true,
    basePath: __dirname,
    filename: 'index.abell'
  }
);
console.dir(finalCode, { depth: null });

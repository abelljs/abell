import { readFileSync } from 'fs';
import { join } from 'path';
import { render } from 'abell-renderer'; // import unbundled source

const finalCode = render(
  readFileSync(join(__dirname, 'index.abell'), 'utf-8'),
  {},
  {
    dangerouslyAllowRequire: true,
    basePath: __dirname,
    filename: 'index.abell'
  }
);
console.dir(finalCode, { depth: null });

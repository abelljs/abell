const path = require('path');
const cwd = process.cwd();
const isProd = process.env.NODE_ENV === 'production';

const ROOT = isProd ? path.join(cwd, '/dist') : cwd;
const SERVER_PORT = 3000;
const ENTRY_BUILD_PATH = isProd
  ? path.join(ROOT, 'temp', 'entry.build.ts')
  : path.join(ROOT, 'src', 'entry.build.ts');

const ASSETS_DIR = path.join(ROOT, 'assets');
const SOURCE_DIR = path.join(cwd, 'src');
const TEMP_OUTPUT_DIR = path.join(ROOT, '__temp_abell');
const OUTPUT_DIR = ROOT;

module.exports = {
  cwd,
  SERVER_PORT,
  SOURCE_DIR,
  ENTRY_BUILD_PATH,
  TEMP_OUTPUT_DIR,
  OUTPUT_DIR,
  ASSETS_DIR
};

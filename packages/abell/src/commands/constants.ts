import path from 'path';
export const cwd = process.cwd();
const isProd = process.env.NODE_ENV === 'production';

const ROOT = isProd ? path.join(cwd, '/dist') : cwd;
export const SERVER_PORT = 3000;
export const ENTRY_BUILD_PATH = isProd
  ? path.join(ROOT, 'temp', 'entry.build.ts')
  : path.join(ROOT, 'src', 'entry.build.ts');

export const ASSETS_DIR = path.join(ROOT, 'assets');
export const SOURCE_DIR = path.join(cwd, 'src');
export const TEMP_OUTPUT_DIR = path.join(ROOT, '__temp_abell');
export const OUTPUT_DIR = ROOT;

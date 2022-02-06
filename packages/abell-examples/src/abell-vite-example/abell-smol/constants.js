const cwd = process.cwd();
const isProd = process.env.NODE_ENV === 'production';

const ROOT = isProd ? resolve(cwd, '/dist') : cwd;
const SERVER_PORT = 3000;
const ENTRY_BUILD_PATH = isProd
  ? path.join(ROOT, 'temp', 'entry.build.ts')
  : path.join(ROOT, 'src', 'entry.build.ts');

module.exports = {
  cwd,
  isProd,
  ROOT,
  SERVER_PORT,
  ENTRY_BUILD_PATH
};

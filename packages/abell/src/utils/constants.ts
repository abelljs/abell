import fs from 'fs';
import path from 'path';

type PathOptions = {
  env: 'production' | 'development';
  cwd: string;
};

const DEFAULT_ENTRY_BUILD_PATH = path.join(
  __dirname,
  '..',
  'defaults',
  'secret.default.entry.build.js'
);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getPaths = ({ env, cwd }: PathOptions) => {
  const isProd = env === 'production';
  const OUTPUT_DIR = path.join(cwd, 'dist');
  const SOURCE_DIR = path.join(cwd, 'src');
  const ASSETS_DIR = path.join(cwd, 'assets');
  const TEMP_OUTPUT_DIR = path.join(OUTPUT_DIR, '__temp_abell');
  let ENTRY_BUILD_PATH = isProd
    ? path.join(TEMP_OUTPUT_DIR, 'entry.build.js')
    : path.join(SOURCE_DIR, 'entry.build');

  const ENTRY_BUILD_PATH_JS = ENTRY_BUILD_PATH + '.js';
  const ENTRY_BUILD_PATH_TS = ENTRY_BUILD_PATH + '.ts';
  if (
    !fs.existsSync(ENTRY_BUILD_PATH_JS) &&
    !fs.existsSync(ENTRY_BUILD_PATH_TS)
  ) {
    ENTRY_BUILD_PATH = DEFAULT_ENTRY_BUILD_PATH; // use default entry build
  }

  return {
    ENTRY_BUILD_PATH,
    TEMP_OUTPUT_DIR,
    SOURCE_DIR,
    ASSETS_DIR,
    OUTPUT_DIR
  };
};

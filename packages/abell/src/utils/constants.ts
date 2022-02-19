import fs from 'fs';
import path from 'path';

type PathOptions = {
  cwd: string;
};

const DEFAULT_ENTRY_BUILD_PATH = path.join(
  __dirname,
  '..',
  'defaults',
  'secret.default.entry.build.js'
);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getPaths = async ({ cwd }: PathOptions) => {
  const OUTPUT_DIR = path.join(cwd, 'dist');
  const SOURCE_DIR = path.join(cwd, 'src');
  const ASSETS_DIR = path.join(cwd, 'assets');
  const TEMP_OUTPUT_DIR = path.join(OUTPUT_DIR, '__temp_abell');
  let SOURCE_ENTRY_BUILD_PATH = path.join(SOURCE_DIR, 'entry.build');
  let OUT_ENTRY_BUILD_PATH = path.join(TEMP_OUTPUT_DIR, 'entry.build.js');

  const ENTRY_BUILD_PATH_JS = SOURCE_ENTRY_BUILD_PATH + '.js';
  const ENTRY_BUILD_PATH_TS = SOURCE_ENTRY_BUILD_PATH + '.ts';
  if (
    !fs.existsSync(ENTRY_BUILD_PATH_JS) &&
    !fs.existsSync(ENTRY_BUILD_PATH_TS)
  ) {
    SOURCE_ENTRY_BUILD_PATH = DEFAULT_ENTRY_BUILD_PATH; // use default entry build
    OUT_ENTRY_BUILD_PATH = path.join(
      TEMP_OUTPUT_DIR,
      'secret.default.entry.build.js'
    );
  }

  const PAGES_ROOT = SOURCE_DIR;

  return {
    SOURCE_ENTRY_BUILD_PATH,
    OUT_ENTRY_BUILD_PATH,
    TEMP_OUTPUT_DIR,
    SOURCE_DIR,
    ASSETS_DIR,
    PAGES_ROOT,
    OUTPUT_DIR
  };
};

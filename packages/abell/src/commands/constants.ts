import fs from 'fs';
import path from 'path';

type PathOptions = {
  env: 'production' | 'development';
  cwd: string;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getPaths = ({ env, cwd }: PathOptions) => {
  const rootDir = fs.readdirSync(cwd);
  if (
    !rootDir.includes('vite.config.js') &&
    !rootDir.includes('vite.config.ts')
  ) {
    throw new Error(
      'No vite.config.js or vite.config.ts found in root directory'
    );
  }

  const isProd = env === 'production';
  const OUTPUT_DIR = path.join(cwd, 'dist');
  const SOURCE_DIR = path.join(cwd, 'src');
  const ASSETS_DIR = path.join(cwd, 'assets');
  const TEMP_OUTPUT_DIR = path.join(OUTPUT_DIR, '__temp_abell');

  return {
    ENTRY_BUILD_PATH: isProd
      ? path.join(TEMP_OUTPUT_DIR, 'entry.build.js')
      : path.join(SOURCE_DIR, 'entry.build.ts'),
    TEMP_OUTPUT_DIR,
    SOURCE_DIR,
    ASSETS_DIR,
    OUTPUT_DIR
  };
};

// const ROOT = isProd ? path.join(cwd, '/dist') : cwd;
// export const SERVER_PORT = 3000;
// export const ENTRY_BUILD_PATH = isProd
//   ? path.join(ROOT, 'temp', 'entry.build.ts')
//   : path.join(ROOT, 'src', 'entry.build.ts');

// export const ASSETS_DIR = path.join(ROOT, 'assets');
// export const SOURCE_DIR = path.join(cwd, 'src');
// export const TEMP_OUTPUT_DIR = path.join(ROOT, '__temp_abell');
// export const OUTPUT_DIR = ROOT;

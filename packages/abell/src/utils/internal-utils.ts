/**
 * Utilities used internally in abell. Do not import anything from this file!!
 */

import fs from 'fs';
import path from 'path';

export type AbellOptions = Record<string, never>;

/**
 * matches paths and returns boolean
 */
export const arePathsEqual = (pathOne: string, pathTwo: string): boolean =>
  path.resolve(pathOne) === path.resolve(pathTwo);

export type AbellPagesGlobImport = Record<
  string,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
>;
export const findIndexPath = (abellPages: AbellPagesGlobImport): string => {
  // filter all index.abell files. One of them is going to be root index.abell
  const abellIndexPaths = Object.keys(abellPages).filter((abellPage) =>
    abellPage.endsWith('index.abell')
  );

  // index.abell with shortest path is going to root index.abell
  let shortestPathLength = abellIndexPaths[0].length;
  let likelyRootIndexPath = abellIndexPaths[0];
  for (const abellPath of abellIndexPaths) {
    if (abellPath.length < shortestPathLength) {
      shortestPathLength = abellPath.length;
      likelyRootIndexPath = abellPath;
    }
  }

  return likelyRootIndexPath;
};

/**
 * Get URL string from filepath.
 *
 * Used in `generate` to build URLs from all the files paths
 */
export const getURLFromFilePath = (
  filePath: string,
  basePath: string
): string => {
  const baseName = path.relative(basePath, filePath);
  let route = baseName.replace('index.abell', '').replace('.abell', '');
  if (!route.startsWith('/')) {
    route = `/${route}`;
  }

  if (route.endsWith('/') && route.length > 1) {
    route = route.slice(0, -1);
  }
  return route;
};

/**
 * Find files with certain extension inside the base directory
 */
export function recursiveFindFiles(
  base: string,
  ext: '.abell' | '.html',
  inputFiles: string[] | undefined = undefined,
  inputResult: string[] | undefined = undefined
): string[] {
  const files = inputFiles || fs.readdirSync(base);
  let result = inputResult || [];

  for (const file of files) {
    const newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = recursiveFindFiles(
        newbase,
        ext,
        fs.readdirSync(newbase),
        result
      );
    } else {
      if (file.endsWith(ext)) {
        result.push(newbase);
      }
    }
  }

  return result;
}

export const getConfigPath = (cwd: string): string => {
  const possibleConfigFiles = [
    'vite.config.ts',
    'vite.config.js',
    'abell.config.ts',
    'abell.config.js'
  ].map((configFileName) => path.join(cwd, configFileName));
  for (const configFile of possibleConfigFiles) {
    if (fs.existsSync(configFile)) {
      return configFile;
    }
  }

  return path.resolve(__dirname, '../../defaults/vite.config');
};

type PathOptions = {
  cwd: string;
};

const DEFAULT_ENTRY_BUILD_PATH = path.join(
  __dirname,
  '..',
  '..',
  'defaults',
  'secret.default.entry.build.js'
);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getBasePaths = async ({ cwd }: PathOptions) => {
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

/**
 * Evaluates the abell block.
 *
 * Internally used to clean the output and return correct value.
 *
 */
// eslint-disable-next-line
export const evaluateAbellBlock = (val: any): string => {
  if (val === undefined || val === null) return ''; // never print undefined or null
  if (typeof val === 'function') return val(); // if function, execute the function
  if (Array.isArray(val)) return val.join(''); // if array, join the array with ''
  return val;
};

// type AbellVariable = {
//   console: {
//     log: (val: unknown[]) => void;
//   };
//   props: Record<string, unknown>;
//   dirname: string;
//   filename: string;
// };

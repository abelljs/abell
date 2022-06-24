/**
 * Utilities used internally in abell. Do not import anything from this file!!
 */

import fs from 'fs';
import path from 'path';
import {
  loadConfigFromFile,
  EsbuildTransformOptions,
  UserConfig as ViteUserConfig
} from 'vite';

export type AbellOptions = {
  esbuild?: EsbuildTransformOptions;
};

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

  // Only one index file in import
  if (abellIndexPaths.length === 1) {
    return abellIndexPaths[0];
  }

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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const VERSION = `v${require('../../package.json').version}`;

export const normalizePath = (pathString: string): string =>
  pathString.split('/').join(path.sep);

export const urlifyPath = (pathString: string): string =>
  pathString.split(path.sep).join('/');

/**
 * Removes the folder
 * @param {String} pathToRemove path to the directory which you want to remove
 */
export function rmdirRecursiveSync(pathToRemove: string): void {
  if (fs.existsSync(pathToRemove)) {
    fs.readdirSync(pathToRemove).forEach((file) => {
      const curPath = path.join(pathToRemove, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        rmdirRecursiveSync(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToRemove);
  }
}

/**
 * Recursively creates the path
 * @param {string} pathToCreate path that you want to create
 */
export function createPathIfAbsent(pathToCreate: string): string[] {
  const createdDirectories: string[] = [];
  // prettier-ignore
  pathToCreate
    .split(path.sep)
    .reduce((prevPath, folder) => {
      const currentPath = path.join(prevPath, folder, path.sep);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
        createdDirectories.push(currentPath);
      }
      return currentPath;
    }, '');

  return createdDirectories;
}

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
  let route = urlifyPath(
    baseName.replace('index.abell', '').replace('.abell', '')
  );
  if (!route.startsWith('/')) {
    route = `/${route}`;
  }

  if (route.endsWith('/') && route.length > 1) {
    route = route.slice(0, -1);
  }
  return route;
};

export const getFilePathFromURL = (url: string, basePath: string): string => {
  const indexPath = path.join(basePath, url, 'index.abell');
  const directPath = path.join(basePath, `${url}.abell`);

  if (fs.existsSync(directPath)) {
    return directPath;
  }

  return indexPath;
};

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

  return path.resolve(__dirname, '../../defaults/vite.config.js');
};

type PathOptions = {
  configFile: string;
  command: 'generate' | 'dev';
};

export const getViteConfig = async ({
  configFile,
  command
}: PathOptions): Promise<ViteUserConfig> => {
  const viteConfigObj = await loadConfigFromFile(
    {
      command: command === 'generate' ? 'build' : 'serve',
      mode: command === 'generate' ? 'production' : 'development'
    },
    configFile
  );

  return viteConfigObj?.config ?? {};
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getBasePaths = async ({ configFile, command }: PathOptions) => {
  const viteConfig = await getViteConfig({ configFile, command });
  const ROOT = viteConfig.root ?? process.cwd();

  const OUTPUT_DIR = path.join(ROOT, 'dist');
  const ASSETS_DIR = path.join(ROOT, 'assets');
  const TEMP_OUTPUT_DIR = path.join(OUTPUT_DIR, '__temp_abell');
  let SOURCE_ENTRY_BUILD_PATH = path.join(ROOT, 'entry.build');
  let OUT_ENTRY_BUILD_PATH = path.join(TEMP_OUTPUT_DIR, 'entry.build.mjs');

  const ENTRY_BUILD_PATH_JS = SOURCE_ENTRY_BUILD_PATH + '.js';
  const ENTRY_BUILD_PATH_TS = SOURCE_ENTRY_BUILD_PATH + '.ts';

  // Used when the project does not have `entry.build.ts` file in root
  const DEFAULT_ENTRY_BUILD_PATH = path.join(
    process.cwd(),
    'node_modules',
    '.abell',
    VERSION,
    'secret.default.entry.build.js'
  );
  if (
    !fs.existsSync(ENTRY_BUILD_PATH_JS) &&
    !fs.existsSync(ENTRY_BUILD_PATH_TS)
  ) {
    if (!fs.existsSync(DEFAULT_ENTRY_BUILD_PATH)) {
      createPathIfAbsent(path.dirname(DEFAULT_ENTRY_BUILD_PATH));
      fs.copyFileSync(
        path.resolve(
          `${__dirname}/../../defaults/secret.default.entry.build.js`
        ),
        DEFAULT_ENTRY_BUILD_PATH
      );
    }

    SOURCE_ENTRY_BUILD_PATH = DEFAULT_ENTRY_BUILD_PATH; // use default entry build
    OUT_ENTRY_BUILD_PATH = path.join(
      TEMP_OUTPUT_DIR,
      'secret.default.entry.build.mjs'
    );
  }

  return {
    SOURCE_ENTRY_BUILD_PATH,
    OUT_ENTRY_BUILD_PATH,
    TEMP_OUTPUT_DIR,
    ASSETS_DIR,
    DEFAULT_ENTRY_BUILD_PATH,
    ROOT,
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
export const evaluateAbellBlock = (val: unknown): string | boolean | number => {
  if (val === undefined || val === null) return ''; // never print undefined or null
  if (typeof val === 'function') return evaluateAbellBlock(val()); // if function, execute the function
  if (Array.isArray(val)) return val.join(''); // if array, join the array with ''
  if (typeof val === 'object') return JSON.stringify(val); // if object, stringify object
  if (
    typeof val === 'string' ||
    typeof val === 'boolean' || // string, boolean, number can take care of stringifying at the end
    typeof val === 'number'
  ) {
    return val;
  }

  // force stringification on rest
  return String(val);
};

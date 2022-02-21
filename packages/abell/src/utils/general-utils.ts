import fs from 'fs';
import path from 'path';
import { vitePluginAbell } from './vite-plugin-abell';
import {
  defineConfig as viteDefineConfig,
  UserConfig as ViteUserConfig,
  UserConfigExport as ViteUserConfigExport
} from 'vite';

// @TODO add options here
export type AbellOptions = Record<string, never>;

interface AbellViteConfig extends ViteUserConfig {
  abell?: AbellOptions;
}

export const defineConfig = (config: AbellViteConfig): ViteUserConfigExport => {
  const userPlugins = config.plugins || [];

  return viteDefineConfig({
    ...config,
    plugins: [vitePluginAbell(config.abell), ...userPlugins]
  });
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

  return path.resolve(__dirname, '../defaults/vite.config');
};

/**
 * Get filepath on giving URL
 */
export const getFilePathFromURL = (url: string, basePath: string): string => {
  let filePath = '';

  if (url === '/') {
    filePath = path.join(basePath, '/index.abell');
  } else {
    let baseName = '';
    if (fs.existsSync(path.join(basePath, `${url}.abell`))) {
      // For paths like `/about.abell`
      baseName = `${url}.abell`;
      filePath = path.join(basePath, baseName);
    } else if (fs.existsSync(path.join(basePath, url, `index.abell`))) {
      // For paths like `/about/index.abell`
      baseName = `${url}/index.abell`;
      filePath = path.join(basePath, baseName);
    } else {
      filePath = '';
      // Couldn't figure out path from url
      console.warn(`[abell]: Abell couldn't figure out path from URL '${url}'`);
    }
  }

  // if filePath is not relative or absolute, make it relative or absolute
  if (!filePath.startsWith('./') && !filePath.startsWith('/')) {
    filePath = `./${filePath}`;
  }

  return filePath;
};

type AbellPagesGlobImport = Record<
  string,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
>;
const findIndexPath = (abellPages: AbellPagesGlobImport): string => {
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

const arePathsEqual = (pathOne: string, pathTwo: string): boolean =>
  path.resolve(pathOne) === path.resolve(pathTwo);

/**
 *
 * @param url URL from server (e.g. `/`, `/about`)
 * @param abellPages Response of glob import. You can get it by running following-
 * ```ts
 * const abellPages = import.meta.globEager('./src/*.abell');
 * ```
 * @returns
 */
export const findAbellFileFromURL = (
  url: string,
  abellPages: AbellPagesGlobImport
): string | undefined => {
  const rootIndexPath = findIndexPath(abellPages);
  const basePath = path.dirname(rootIndexPath);

  if (url === '/') {
    return rootIndexPath;
  }

  const directPath = path.join(basePath, `${url}.abell`);
  const nestedIndexPath = path.join(basePath, url, 'index.abell');

  for (const abellPage of Object.keys(abellPages)) {
    if (arePathsEqual(abellPage, directPath)) {
      return abellPage;
    }

    if (arePathsEqual(abellPage, nestedIndexPath)) {
      return abellPage;
    }
  }

  // couldn't figure out :( page.
  return undefined;
};

/**
 * Get URL string from filepath
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

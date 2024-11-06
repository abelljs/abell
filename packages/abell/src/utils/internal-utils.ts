/**
 * Utilities used internally in abell. Do not import anything from this file!!
 */

import fs from 'fs';
import http from 'http';
import net from 'net';
import path from 'path';
import { Express } from 'express';
import { spawn, exec } from 'child_process';
import { loadConfigFromFile } from 'vite';
import * as url from 'url';
import { boldUnderline, log } from './logger.js';
import { AbellViteConfig } from '../type-utils.js';

// @ts-ignore
const $dirname = url.fileURLToPath(new url.URL('.', import.meta.url));

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

export const existsSync = (filePath: string): boolean => {
  // Removes file:// from windows (otherwise windows always gives out false 🤦🏻‍♂️)
  return fs.existsSync(filePath.replace('file://', ''));
};

export const getPackageJSON = (): Record<string, string> => {
  const packageJson = JSON.parse(
    fs.readFileSync(new url.URL('../../package.json', import.meta.url), 'utf-8')
  );
  return packageJson;
};

let abellVersion: string | undefined = undefined;
export const getAbellVersion = (): string => {
  if (abellVersion) {
    return abellVersion;
  }
  // Just memoizing the version number to avoid reading package.json multiple times
  abellVersion = getPackageJSON().version;
  return abellVersion;
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const VERSION = `v${getAbellVersion()}`;
export const ABELL_PACKAGE_ROOT = path.join($dirname, '..', '..');
export const NODE_MODULES_DIR = path.join(ABELL_PACKAGE_ROOT, '..');

export const normalizePath = (pathString: string): string =>
  pathString.split('/').join(path.sep);

export const urlifyPath = (pathString: string): string =>
  pathString.split(path.sep).join('/');

/**
 * Removes the folder
 * @param {String} pathToRemove path to the directory which you want to remove
 */
export function rmdirRecursiveSync(pathToRemove: string): void {
  if (existsSync(pathToRemove)) {
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
      if (!existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
        createdDirectories.push(currentPath);
      }
      return currentPath;
    }, '');

  return createdDirectories;
}

/**
 * Find and return any random port that is available
 */
export const getFreePort = async (): Promise<number | undefined> => {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      // @ts-expect-error: port does exist!!
      const port = srv.address()?.port;
      srv.close(() => resolve(port));
    });
  });
};

const coolReadablePorts = [
  // Shoutout to Abell 2029 Galaxy Cluster - https://en.wikipedia.org/wiki/Abell_2029
  2029,
  // Random readable port numbers
  5000, 8000, 8888, 8080
];
let retryPortIndex = -1;

/**
 * Listen to given port if available or look for another port
 */
export const listen = (
  app: Express,
  port: number,
  { open }: { open?: boolean }
): void => {
  const server = http.createServer();
  server.listen(port, () => {
    server.close(() => {
      app.listen(port, () => {
        const url = `http://localhost:${port}/`;

        log(`dev-server is running on ${boldUnderline(url)} 🚀`);

        if (open) {
          exec(`open ${url}`);
        }
      });
    });
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      retryPortIndex++;
      log(
        `Port ${port} is Taken. Retrying with ${coolReadablePorts[retryPortIndex]}`,
        'p1'
      );
      listen(app, coolReadablePorts[retryPortIndex], { open });
    } else {
      console.error(err);
    }
  });
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

  if (existsSync(directPath)) {
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
    if (existsSync(configFile)) {
      return configFile;
    }
  }

  return path.resolve($dirname, '../../defaults/vite.config.js');
};

type PathOptions = {
  configFile: string;
  command: 'generate' | 'dev';
};

export const getViteConfig = async ({
  configFile,
  command
}: PathOptions): Promise<AbellViteConfig> => {
  const viteConfigObj = await loadConfigFromFile(
    {
      command: command === 'generate' ? 'build' : 'serve',
      mode: command === 'generate' ? 'production' : 'development'
    },
    configFile
  );

  return viteConfigObj?.config ?? {};
};

const isWindows = /^win/.test(process.platform);

const windowsifyCommand = (command: string): string => {
  if (isWindows) {
    return command.replace('npm', 'npm.cmd').replace('yarn', 'yarn.cmd');
  }

  return command;
};

export async function run(
  command: string,
  { cwd }: { cwd: string } = { cwd: process.cwd() }
): Promise<1 | 0> {
  const commandArgs = windowsifyCommand(command).split(' ');
  return new Promise((resolve, reject) => {
    try {
      const child = spawn(commandArgs[0], [...commandArgs.slice(1)], {
        cwd,
        stdio: 'inherit'
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(0);
        } else {
          log(`oops ${command} failed`, 'p1');
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(1);
        }
      });
    } catch (err) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(1);
    }
  });
}

const installAbellIfNotInstalled = async (ROOT: string): Promise<void> => {
  const nodeModulesAbellPath = path.join(ROOT, 'node_modules', 'abell');
  if (!existsSync(nodeModulesAbellPath)) {
    const didPackageJSONExist = existsSync(path.join(ROOT, 'package.json'));
    const didPackageLockJSONExist = existsSync(
      path.join(ROOT, 'package-lock.json')
    );
    await run(`npm install abell@${getAbellVersion()} --save-dev`, {
      cwd: ROOT
    });

    if (!didPackageJSONExist) {
      fs.unlinkSync(path.join(ROOT, 'package.json'));
    }

    if (!didPackageLockJSONExist) {
      fs.unlinkSync(path.join(ROOT, 'package-lock.json'));
    }
  }
};

let isGetViteBuildInfoFunctionCalled = false;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getViteBuildInfo = async ({
  configFile,
  command
}: PathOptions) => {
  const viteConfig = await getViteConfig({ configFile, command });
  const ROOT = viteConfig.root ?? process.cwd();

  const OUTPUT_DIR = path.join(ROOT, 'dist');
  const ASSETS_DIR = path.join(ROOT, 'assets');
  const TEMP_OUTPUT_DIR = path.join(OUTPUT_DIR, '__temp_abell');
  let SOURCE_ENTRY_BUILD_PATH = path.join(ROOT, 'entry.build');
  let OUT_ENTRY_BUILD_PATH = path.join(TEMP_OUTPUT_DIR, 'entry.build.js');

  const ENTRY_BUILD_PATH_JS = SOURCE_ENTRY_BUILD_PATH + '.js';
  const ENTRY_BUILD_PATH_TS = SOURCE_ENTRY_BUILD_PATH + '.ts';

  // Used when the project does not have `entry.build.ts` file in root
  const ABELL_TEMP_DIRECTORY = path.join(
    ROOT,
    'node_modules',
    '.abell',
    VERSION
  );
  await installAbellIfNotInstalled(ROOT);
  const DEFAULT_ENTRY_BUILD_PATH = path.join(
    ABELL_TEMP_DIRECTORY,
    'secret.default.entry.build.js'
  );
  if (!existsSync(ENTRY_BUILD_PATH_JS) && !existsSync(ENTRY_BUILD_PATH_TS)) {
    // Run this the first time getViteBuildInfo is called. Ignore after that.
    if (!isGetViteBuildInfoFunctionCalled) {
      createPathIfAbsent(ABELL_TEMP_DIRECTORY);
      fs.copyFileSync(
        path.resolve(
          `${$dirname}/../../defaults/secret.default.entry.build.js`
        ),
        DEFAULT_ENTRY_BUILD_PATH
      );
    }

    SOURCE_ENTRY_BUILD_PATH = DEFAULT_ENTRY_BUILD_PATH; // use default entry build
    OUT_ENTRY_BUILD_PATH = path.join(
      TEMP_OUTPUT_DIR,
      'secret.default.entry.build.js'
    );
  }

  if (isWindows) {
    // Windows need file:// appended to absolute paths that are called with `import()` :(
    OUT_ENTRY_BUILD_PATH = 'file://' + OUT_ENTRY_BUILD_PATH;
  }

  isGetViteBuildInfoFunctionCalled = true;

  return {
    SOURCE_ENTRY_BUILD_PATH,
    OUT_ENTRY_BUILD_PATH,
    TEMP_OUTPUT_DIR,
    ASSETS_DIR,
    DEFAULT_ENTRY_BUILD_PATH,
    ROOT,
    OUTPUT_DIR,
    viteConfigObj: viteConfig
  };
};

export async function clearCache(): Promise<void> {
  const configFile = getConfigPath(process.cwd());
  const { ROOT } = await getViteBuildInfo({
    configFile,
    command: 'generate'
  });
  const ABELL_CACHE_DIR = path.join(ROOT, 'node_modules', '.abell');
  if (existsSync(ABELL_CACHE_DIR)) {
    rmdirRecursiveSync(ABELL_CACHE_DIR);
    log('Abell cache go whoooshhhh 🧹');
  }
}

export const addCSSToHead = (htmlContent: string, cssLinks: string): string => {
  if (htmlContent.includes('</head>')) {
    return htmlContent.replace('</head>', cssLinks + '</head>');
  }
  return cssLinks + htmlContent;
};

export const addJStoBodyEnd = (
  htmlContent: string,
  jsLinks: string
): string => {
  if (htmlContent.includes('</body>')) {
    return htmlContent.replace('</body>', jsLinks + '</body>');
  }

  return htmlContent + jsLinks;
};

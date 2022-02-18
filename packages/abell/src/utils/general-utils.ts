import fs from 'fs';
import path from 'path';
import { vitePluginAbell } from './vite-plugin-abell';
import {
  defineConfig as viteDefineConfig,
  loadConfigFromFile,
  UserConfig as ViteUserConfig,
  UserConfigExport as ViteUserConfigExport
} from 'vite';

export type AbellOptions = {
  indexPath?: string;
};

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

export const getAbellConfig = async (
  configFile: string
): Promise<AbellOptions> => {
  // const viteConfig = (await import(configFile)).default;
  // return viteConfig.abell;
  const configResponse = await loadConfigFromFile(
    { command: 'build', mode: 'production' },
    configFile
  );

  return (configResponse?.config as AbellViteConfig).abell ?? {};
};

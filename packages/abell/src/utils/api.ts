/**
 * Utilities exposed from abell.
 *
 * Should have jsdoc and strong type definations
 */

import path from 'path';
import { vitePluginAbell } from '../vite-plugin-abell';
import {
  defineConfig as viteDefineConfig,
  UserConfig as ViteUserConfig,
  UserConfigExport as ViteUserConfigExport
} from 'vite';
import {
  AbellPagesGlobImport,
  arePathsEqual,
  findIndexPath,
  AbellOptions
} from './internal-utils';

export interface AbellViteConfig extends ViteUserConfig {
  abell?: AbellOptions;
}

/**
 * Wrapper on top of `defineConfig` of vite. Accepts all vite configurations.
 *
 * **Usage**
 * ```ts
 * import { defineConfig } from 'abell';
 *
 * export default defineConfig({
 *  // vite configs
 * })
 * ```
 */
export const defineConfig = (config: AbellViteConfig): ViteUserConfigExport => {
  const userPlugins = config.plugins || [];

  return viteDefineConfig({
    ...config,
    plugins: [vitePluginAbell(config.abell), ...userPlugins]
  });
};

type URLToAbellOptions = {
  ignoreUnderscoreURLs?: boolean;
};

const defaultURLToAbellOptions: URLToAbellOptions = {
  ignoreUnderscoreURLs: true
};

/**
 *
 * @param url URL from server (e.g. `/`, `/about`)
 * @param abellPages Response of glob import. You can get it by running following-
 * ```ts
 * const abellPages = import.meta.globEager('./src/*.abell');
 * ```
 * @param options Options
 * @param options.ignoreUnderscoreURLs return undefined on underscore URLs like '_components/navbar'. (Default: true)
 */
export const findAbellFileFromURL = (
  url: string,
  abellPages: AbellPagesGlobImport,
  options: URLToAbellOptions = {}
): string | undefined => {
  const finalOptions = { ...defaultURLToAbellOptions, ...options };
  if (finalOptions.ignoreUnderscoreURLs) {
    if (url.includes('/_')) {
      return undefined;
    }
  }
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

  return undefined;
};

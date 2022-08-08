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
  findIndexPath,
  AbellOptions,
  getURLFromFilePath
} from './internal-utils';
import { Route } from '../type-utils';

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
    plugins: [vitePluginAbell(config.abell ?? {}), ...userPlugins]
  });
};

type AbellMakeRouteOptions = {
  ignoreUnderscoreURLs?: boolean;
};

const defaultAbellMakeRouteOptions: AbellMakeRouteOptions = {
  ignoreUnderscoreURLs: true
};

/**
 *
 * Can be used to build routes from file-system.
 *
 * Returns the Route[] object on giving globImport object.
 *
 * @param abellPages Response of glob import. You can get it by running following-
 * ```ts
 * import { makeRoutesFromGlobImport } from 'abell'
 * const abellPages = import.meta.globEager('./src/*.abell');
 *
 * export const makeRoutes = () => {
 * return makeRoutesFromGlobImport(abellPages);
 * }
 * ```
 * @returns {Route[]}
 */
export const makeRoutesFromGlobImport = (
  abellPages: AbellPagesGlobImport,
  options: AbellMakeRouteOptions = defaultAbellMakeRouteOptions
): Route[] => {
  const routes: Route[] = [];
  const rootIndexPath = findIndexPath(abellPages);
  const basePath = path.dirname(rootIndexPath);
  for (const abellPage of Object.keys(abellPages)) {
    if (options.ignoreUnderscoreURLs && abellPage.includes('/_')) {
      continue;
    }
    routes.push({
      path: getURLFromFilePath(abellPage, basePath),
      render: (...args) => abellPages[abellPage].default(...args),
      routeOptions: {
        outputPathPattern: '[route].html'
      }
    });
  }
  return routes;
};

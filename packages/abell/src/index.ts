// @TODO: export when it is ready for external use
// export { compile } from './vite-plugin-abell/compiler';
export { vitePluginAbell } from './vite-plugin-abell';
export {
  defineConfig,
  AbellViteConfig,
  makeRoutesFromGlobImport
} from './utils/api';

export { Route } from './type-utils';

// @TODO: export when it is ready for external use
// export { compile } from './vite-plugin-abell/compiler';
export { vitePluginAbell } from './vite-plugin-abell/index.js';
export {
  defineConfig,
  AbellViteConfig,
  makeRoutesFromGlobImport
} from './utils/api.js';

export { Route } from './type-utils.js';
export { evaluateAbellBlock } from './utils/internal-utils.js';

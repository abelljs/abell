import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { makeRoutesFromGlobImport } = require('abell');
const abellPages = import.meta.globEager(`{{ abellPagesDir }}/*.abell`);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function makeRoutes() {
  return makeRoutesFromGlobImport(abellPages);
}

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { makeRoutesFromGlobImport } = require('abell');
const abellPages = import.meta.globEager('./*.abell');

export async function makeRoutes(): Promise<unknown> {
  return makeRoutesFromGlobImport(abellPages);
}

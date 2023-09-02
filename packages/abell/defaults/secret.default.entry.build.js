import { makeRoutesFromGlobImport } from 'abell';
const abellPages = import.meta.glob('{{ abellPagesDir }}/*.abell', {
  eager: true
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function makeRoutes() {
  return makeRoutesFromGlobImport(abellPages);
}

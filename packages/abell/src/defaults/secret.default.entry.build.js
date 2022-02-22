import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { findAbellFileFromURL } = require('abell');
const abellPages = import.meta.globEager(`{{ abellPagesDir }}/*.abell`);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function render(url) {
  if (url.includes('favicon')) return undefined;
  const abellFilePath = findAbellFileFromURL(url, abellPages);
  if (!abellFilePath) return undefined;
  return abellPages[abellFilePath].default();
}

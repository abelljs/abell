import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { findAbellFileFromURL } = require('abell');
const abellPages = import.meta.globEager(`{{ abellPagesDir }}/*.abell`);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function render(url) {
  if (url.includes('favicon')) return '';
  const abellFilePath = findAbellFileFromURL(url, abellPages);
  if (!abellFilePath) return '404';
  return abellPages[abellFilePath].default();
}

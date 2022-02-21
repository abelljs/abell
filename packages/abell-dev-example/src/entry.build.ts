import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { findAbellFileFromURL } = require('abell');
const abellPages = import.meta.globEager('./*.abell');

export function render(url: string): string {
  if (url.includes('favicon')) return '';
  const abellFilePath = findAbellFileFromURL(url, abellPages);
  if (!abellFilePath) return '404';
  return abellPages[abellFilePath].default();
}

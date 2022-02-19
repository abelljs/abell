import { findAbellFileFromURL } from 'abell';
const abellPages = import.meta.globEager('../pages/*.abell');

export function render(url: string): string {
  if (url.includes('favicon')) return '';
  const abellFilePath = findAbellFileFromURL(url, abellPages);
  if (!abellFilePath) return '404';
  return abellPages[abellFilePath].default();
}

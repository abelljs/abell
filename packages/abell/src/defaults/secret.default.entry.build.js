const abellPages = import.meta.globEager(`{{ abellPagesDir }}/*.abell`);
import { getFilePathFromURL } from 'abell';

const BASE_PATH = '{{ abellPagesDir }}';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function render(url) {
  if (url.includes('favicon')) return '';
  const abellFilePath = getFilePathFromURL(url, BASE_PATH);
  return abellPages[abellFilePath].default();
}

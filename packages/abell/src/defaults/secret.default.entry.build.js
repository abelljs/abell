import path from 'path';
const abellPages = import.meta.globEager(`{{ abellPagesDir }}/*.abell`);

const BASE_PATH = '{{ abellPagesDir }}';

// In your entry file, you can import this function with
// import { getFilePathFromURL } from 'abell';
// This particular file is not bundled during the build so copy-pasted the same function here
const getFilePathFromURL = (url, basePath) => {
  if (url === '/') {
    return path.join(basePath, '/index.abell');
  }

  const directFile = path.join(basePath, `${url}.abell`);
  const nestedFile = path.join(basePath, url, `index.abell`);

  if (directFile in abellPages) return directFile;
  if (nestedFile in abellPages) return nestedFile;

  // Couldn't figure out path from url
  console.warn(`[abell]: Abell couldn't figure out path from URL '${url}'`);
  return '';
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function render(url) {
  if (url.includes('favicon')) return '';
  const abellFilePath = getFilePathFromURL(url, BASE_PATH);
  if (!abellPages[abellFilePath]) return '404';
  return abellPages[abellFilePath].default();
}

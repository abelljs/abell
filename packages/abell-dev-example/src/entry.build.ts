const abellPages = import.meta.globEager('../pages/*.abell');

const getFilePathFromURL = (url: string) => {
  const basePath = '../pages';
  if (url === '/') {
    return basePath + '/index.abell';
  }

  return basePath + url + '.abell';
};

export function render(url: string): string {
  if (url.includes('favicon')) return '';
  const abellFilePath = getFilePathFromURL(url);
  return abellPages[abellFilePath].default();
}

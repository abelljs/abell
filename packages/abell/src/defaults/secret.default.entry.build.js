const abellPages = import.meta.globEager(`{{ abellPagesDir }}/*.abell`);

const getFilePathFromURL = (url) => {
  const basePath = '{{ abellPagesDir }}';
  if (url === '/') {
    return basePath + '/index.abell';
  }

  return basePath + url + '.abell';
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function render(url) {
  if (url.includes('favicon')) return '';
  const abellFilePath = getFilePathFromURL(url);
  return abellPages[abellFilePath].default();
}

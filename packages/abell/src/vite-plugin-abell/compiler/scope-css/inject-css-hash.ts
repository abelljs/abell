import { ABELL_CSS_DATA_PREFIX } from './css-parser';

export const injectCSSHashToHTML = (
  htmlString: string,
  hash: string
): string => {
  const openingTagRegexp = /\<([a-zA-Z]+)(.*?)(\s?\/?)\>/gs;
  return htmlString.replace(
    openingTagRegexp,
    `<$1$2 ${ABELL_CSS_DATA_PREFIX}-${hash}$3>`
  );
};

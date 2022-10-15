import path from 'path';
import { CSSBlockType, StyleTagAttributes } from '../../../type-utils.js';
import { getScopedCSS } from './css-parser.js';
import { generateHashFromPath } from './generate-hash.js';
import { injectCSSHashToHTML } from './inject-css-hash.js';

const ABELL_SPECIAL_CSS_ATTRIBUTES = ['scoped'];
const flattenAttributes = (attributes: StyleTagAttributes) => {
  return Object.entries(attributes).map(([attrKey, attrValue]) => {
    if (ABELL_SPECIAL_CSS_ATTRIBUTES.includes(attrKey)) return '';
    return ` ${attrKey}=${attrValue}`;
  });
};

export const getScopedHTML = (
  html: string,
  cssBlocks: CSSBlockType[],
  filepath: string
): string => {
  let htmlOut = html;
  let styleTags = '';
  const relativeFilePath = path.relative(process.cwd(), filepath);
  const componentHash = generateHashFromPath(relativeFilePath);
  let hasScopedCSS = false;
  for (const cssBlock of cssBlocks) {
    const flatStringAttributes = flattenAttributes(cssBlock.attributes);
    if (cssBlock.attributes.scoped === 'false') {
      // eslint-disable-next-line max-len
      styleTags += `<style${flatStringAttributes} abell-ignored>${cssBlock.text}</style>`;
      continue;
    }

    hasScopedCSS = true;
    const scopedCSS = getScopedCSS(cssBlock.text, componentHash);
    styleTags += `<style abell-generated>${scopedCSS}</style>`;
  }

  if (hasScopedCSS) {
    htmlOut = injectCSSHashToHTML(htmlOut, componentHash);
  }

  return styleTags + htmlOut; // prepend style tags before html
};

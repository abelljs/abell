/* eslint-disable max-len */
import path from 'path';
import { isDeclarationBlock, parseAttributes } from './utils';
import tokenize from './generic-tokenizer';
import {
  generateHashFromPath,
  getScopedCSS,
  injectCSSHashToHTML
} from './scope-css';

/**
 * CSS Plan-
 *
 * 1. Scope css in the component itself
 * 2. Collect and bundle styles in the plugin
 *
 */

interface CompileOptions {
  filepath: string;
  cwd?: string;
  outputType?: 'js-string' | 'html-declaration-object';
}

interface HTMLOutputCompileOptions extends CompileOptions {
  outputType: 'html-declaration-object';
}

interface JSOutputCompileOptions extends CompileOptions {
  outputType?: 'js-string';
}

type CompileOutputType = string | { html: string; declarations: string };
type CSSAttributes = Record<string, string | boolean>;
type CSSCollectionType = {
  text: string;
  attributes: CSSAttributes;
  scopedCSS?: string;
}[];

export function compile(
  abellTemplate: string,
  options: HTMLOutputCompileOptions
): { html: string; declarations: string };
export function compile(
  abellTemplate: string,
  options: JSOutputCompileOptions
): string;
export function compile(
  abellTemplate: string,
  options: CompileOptions
): CompileOutputType {
  const cssCollection: CSSCollectionType = [];
  const tokenSchema = {
    COMMENTED_OUT_BLOCK_START: /\\{{/,
    STYLE_START: /<style(.*?)>/,
    STYLE_END: /<\/style>/,
    BLOCK_START: /{{/,
    BLOCK_END: /}}/
  };
  const tokens = tokenize(abellTemplate, tokenSchema, 'default');

  let isInsideAbellBlock = false;
  let isInsideCSSBlock = false;
  let htmlCode = '';
  let blockCode = '';
  let cssCodeBlock = '';
  let cssAttributes: Record<string, string | boolean> = {};
  let declarations = '';
  let blockCount = 0;
  for (const token of tokens) {
    if (token.type === 'BLOCK_START') {
      isInsideAbellBlock = true;
      blockCount++;
    } else if (token.type === 'BLOCK_END') {
      isInsideAbellBlock = false;
      if (isDeclarationBlock(blockCount, blockCode)) {
        declarations = blockCode;
      } else {
        // JS Code
        htmlCode += `\${e(${blockCode})}`;
      }
      blockCode = '';
    } else if (token.type === 'STYLE_START' && !htmlCode.includes('<html')) {
      if (token.matches) {
        cssAttributes = parseAttributes(token.matches[0]);
      } else {
        cssAttributes = {};
      }
      isInsideCSSBlock = true;
    } else if (token.type === 'STYLE_END' && !htmlCode.includes('<html')) {
      isInsideCSSBlock = false;
      cssCollection.push({
        attributes: cssAttributes,
        text: cssCodeBlock
      });
      cssCodeBlock = '';
      cssAttributes = {};
    } else {
      // normal string;
      if (isInsideAbellBlock) {
        blockCode += token.text;
      } else if (isInsideCSSBlock) {
        cssCodeBlock += token.text;
      } else {
        htmlCode += token.text;
      }
    }
  }

  const isHTMLPage = htmlCode.includes('</html>') && htmlCode.includes('<html');
  const relativeFilePath = path.relative(process.cwd(), options.filepath);
  const componentHash = generateHashFromPath(relativeFilePath);
  if (!isHTMLPage) {
    // If not parent HTML Page (it's a component!), inject scope css attributes
    htmlCode = injectCSSHashToHTML(htmlCode, componentHash);
  }

  let styleTagsString = '';
  for (const cssBlock of cssCollection) {
    if (cssBlock.attributes.scoped === 'false' || isHTMLPage) {
      styleTagsString += `<style abell-ignored>${cssBlock.text}</style>`;
      continue;
    }
    cssBlock.scopedCSS = getScopedCSS(cssBlock.text, componentHash);
    styleTagsString += `<style abell-generated>${cssBlock.scopedCSS}</style>`;
  }
  htmlCode = styleTagsString + htmlCode;

  if (options.outputType === 'html-declaration-object') {
    return {
      html: htmlCode,
      declarations
    };
  }

  const internalUtilsPath = path.join(
    __dirname,
    '..',
    '..',
    'utils',
    'internal-utils'
  );

  const jsOut = `
import { default as _path } from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { evaluateAbellBlock: e } = require(${JSON.stringify(internalUtilsPath)});
${declarations}
const __filename = ${JSON.stringify(options.filepath)};
const __dirname = _path.dirname(__filename);
export const html = (props = {}) => {
  const Abell = { props, __filename, __dirname };
  return \`${htmlCode}\`
};
export default html;
`.trim();

  return jsOut;
}

export default compile;

/* eslint-disable max-len */
import path from 'path';
import { isDeclarationBlock, parseAttributes } from './utils';
import tokenize from './generic-tokenizer';

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
  let cssCode = '';
  let declarations = '';
  let blockCount = 0;
  for (const token of tokens) {
    if (token.type === 'BLOCK_START') {
      if (isInsideCSSBlock) {
        throw new Error(
          '[abell-compiler]: Abell blocks are not allowed inside <style> tag'
        );
      }
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
    } else if (token.type === 'STYLE_START') {
      if (token?.matches?.[0].includes('export')) {
        const styleTagAttributes = parseAttributes(token.matches[0]);
        if (styleTagAttributes.export) {
          isInsideCSSBlock = true;
        }
      }
    } else if (token.type === 'STYLE_END') {
      isInsideCSSBlock = false;
    } else {
      // normal string;
      if (isInsideAbellBlock) {
        blockCode += token.text;
      } else if (isInsideCSSBlock) {
        cssCode += token.text;
      } else {
        htmlCode += token.text;
      }
    }
  }

  if (options.outputType === 'html-declaration-object') {
    return {
      html: htmlCode,
      declarations
    };
  }

  console.log({ cssCode, htmlCode });

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

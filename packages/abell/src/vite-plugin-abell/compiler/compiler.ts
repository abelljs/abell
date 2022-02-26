/* eslint-disable max-len */
import tokenize from './generic-tokenizer';

const isDeclarationBlock = (blockCount: number, blockContent: string) => {
  if (blockCount < 2 && blockContent.includes('import ')) {
    return true;
  }
  return false;
};

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
    BLOCK_START: /{{/,
    BLOCK_END: /}}/
  };
  const tokens = tokenize(abellTemplate, tokenSchema, 'default');

  let isInsideAbellBlock = false;
  let htmlCode = '';
  let blockCode = '';
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
    } else {
      // normal string;
      if (isInsideAbellBlock) {
        blockCode += token.text;
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

  const jsOut = `
import { default as _path } from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { evaluateAbellBlock: e } = require('abell/dist/utils/internal-utils');
${declarations}
const __filename = '${options.filepath}';
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

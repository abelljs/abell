import path from 'path';
import tokenize from '../utils/generic-tokenizer';

const isDeclarationBlock = (blockCount: number, blockContent: string) => {
  if (blockCount < 2 && blockContent.includes('import ')) {
    return true;
  }
  return false;
};

type CompileOptions = {
  filepath: string;
  cwd?: string;
};

export function compile(
  abellTemplate: string,
  options: CompileOptions
): string {
  const filename = path.relative(
    options.cwd ?? process.cwd(),
    options.filepath
  );
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

  const jsOut = `
  import { default as _path } from 'path';
  ${declarations}
  const __filename = '${options.filepath}';
  const __dirname = _path.dirname(__filename);
  const e = (val) => {
    if (typeof val === 'function') return val();
    if (!val) return '';
    return val;
  };
  export const html = (props = {}) => {
    const Abell = { 
      props, 
      console: {
        log: (...args) => {
          console.log('\\u001b[90m[${filename}]:\\u001b[39m', ...args);
          return '';
        }
      }
    };
    return \`${htmlCode.trim()}\`
  };
  export default html;
  `;

  return jsOut;
}

export default compile;

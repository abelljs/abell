import tokenize from '../generic-tokenizer';

const isDeclarationBlock = (blockCount: number, blockContent: string) => {
  if (blockCount < 2 && blockContent.includes('import')) {
    return true;
  }
  return false;
};

export function compile(abellTemplate: string): string {
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
        htmlCode += `\${${blockCode}}`;
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

  console.log({ declarations });
  console.log({ htmlString: htmlCode });

  const jsOut = `
  ${declarations}
  const html = \`${htmlCode.trim()}\`;
  export default html;
  `;

  return jsOut;
}

export default compile;

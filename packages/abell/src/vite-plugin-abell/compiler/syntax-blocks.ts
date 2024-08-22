import { isDeclarationBlock, isImportBlock, parseAttributes } from './utils.js';
import { Token } from './generic-tokenizer.js';
import {
  AbstractSyntaxArrayType,
  BlockMapType,
  MapsObject
} from '../../type-utils.js';
import { TokenSchemaType } from './token-schema.js';

const ideal = {
  blocks: [
    {
      text: '\n',
      type: 'default'
    },
    {
      text: "import x from './xyz'",
      type: 'import'
    }
  ]
};

export const getSyntaxBlocks = (
  tokens: Token<TokenSchemaType>[],
  { isPage }: { isPage: boolean }
): any => {
  const blocks: {
    type: 'import' | 'declaration' | 'abell-text' | 'css-text' | 'text';
    text: string;
    abellBlockProperties?: {
      blockCount: number;
      isInsideCSSBlock: boolean;
    };
    cssBlockProperties?: {
      attributes: Record<string, string>;
      blockCount: number;
    };
  }[] = [];

  const blockState = {
    abell: {
      isInsideAbellBlock: false,
      blockCount: 0
    },
    css: {
      isInsideCSSBlock: false,
      blockCount: 0,
      cssBlockAttributes: {}
    }
  };

  for (const token of tokens) {
    switch (token.type) {
      case 'BLOCK_START': {
        // console.log(token);
        blockState.abell.isInsideAbellBlock = true;
        blockState.abell.blockCount++;
        break;
      }

      case 'BLOCK_END': {
        // console.log(token);
        blockState.abell.isInsideAbellBlock = false;
        break;
      }

      case 'STYLE_START': {
        blockState.css.isInsideCSSBlock = true;
        blockState.css.blockCount++;
        if (token.matches?.[0]) {
          blockState.css.cssBlockAttributes = parseAttributes(token.matches[0]);
        } else {
          blockState.css.cssBlockAttributes = {};
        }
        break;
      }

      case 'STYLE_END': {
        blockState.css.isInsideCSSBlock = false;
        blockState.css.cssBlockAttributes = {};
        break;
      }

      case 'default': {
        if (blockState.abell.isInsideAbellBlock) {
          blocks.push({
            type: 'abell-text',
            text: token.text,
            abellBlockProperties: {
              blockCount: blockState.abell.blockCount,
              isInsideCSSBlock: blockState.css.isInsideCSSBlock
            }
          });
        } else if (blockState.css.isInsideCSSBlock) {
          blocks.push({
            type: 'css-text',
            text: token.text,
            cssBlockProperties: {
              attributes: blockState.css.cssBlockAttributes,
              blockCount: blockState.css.blockCount
            }
          });
        } else {
          blocks.push({
            type: 'text',
            text: token.text
          });
        }
      }
    }
  }

  console.log(blocks);

  return {
    blocks: []
  };
};

const getSyntaxBlocksDep = (
  tokens: Token<TokenSchemaType>[],
  { isPage }: { isPage: boolean }
): AbstractSyntaxArrayType => {
  const blockMap: BlockMapType = {};
  const blockState = {
    isInsideAbellBlock: false,
    abellNestedBlockLevelCount: 0,
    isInsideCSSBlock: false,
    blockCount: 0,
    cssAttributes: {} as Record<string, string | boolean>,
    blockMap
  };

  const blocks = [];

  const texts = {
    importText: '',
    declarationText: '',
    abellText: '',
    cssText: '',
    outText: ''
  };

  let maps: BlockMapType[] = [];

  const cssBlocks = [];
  const outBlocks: { text: string }[] = [];

  // console.log(tokens);

  const addToHTML = (tokenText: string, pos): void => {
    outBlocks.push({
      text: tokenText
    });

    texts.outText += tokenText;

    // new
    blocks.push({
      text: tokenText,
      type: 'default',
      pos
    });
  };

  const addToCSS = (tokenText: string, pos): void => {
    // new
    blocks.push({
      text: tokenText,
      type: 'css',
      pos
    });
  };

  // console.dir({ tokens }, { depth: Infinity });

  for (const token of tokens) {
    if (token.type === 'BLOCK_START') {
      /**
       * Abell Block Start
       *
       * Token: `{{`
       */
      if (blockState.isInsideAbellBlock) {
        // We're already inside abell block so this is a nested block.
        texts.abellText += token.text;
        blockState.abellNestedBlockLevelCount++;
        continue;
      }
      blockState.isInsideAbellBlock = true;
      blockState.blockCount++;
      blockState.blockMap.start = {
        pos: token.pos,
        col: token.col,
        line: token.line
      };
    } else if (token.type === 'BLOCK_END') {
      /**
       * Abell Block End
       *
       * Token: `}}`
       */

      if (blockState.abellNestedBlockLevelCount > 0) {
        texts.abellText += token.text;
        blockState.abellNestedBlockLevelCount--;
        continue;
      }

      if (!blockState.isInsideAbellBlock) {
        addToHTML(token.text, token.pos);
        continue;
      }

      blockState.blockMap.end = {
        pos: token.pos,
        col: token.col,
        line: token.line
      };
      blockState.blockMap.type = 'default';
      if (isImportBlock(blockState.blockCount, texts.abellText)) {
        texts.importText = texts.abellText;
        blockState.blockMap.type = 'import';
        blocks.push({
          text: texts.abellText,
          type: 'import',
          pos: {
            start: blockState.blockMap.start,
            end: blockState.blockMap.end
          }
        });
      } else if (isDeclarationBlock(texts.abellText)) {
        texts.declarationText = texts.abellText;
        blockState.blockMap.type = 'declaration';
        blocks.push({
          text: texts.abellText,
          type: 'declaration',
          pos: {
            start: blockState.blockMap.start,
            end: blockState.blockMap.end
          }
        });
      } else {
        blocks.push({
          text: texts.abellText,
          type: blockState.isInsideCSSBlock ? 'abell-css' : 'abell',
          pos: {
            start: blockState.blockMap.start,
            end: blockState.blockMap.end
          }
        });
        // if (blockState.isInsideCSSBlock) {
        //   texts.cssText += `\${e(${texts.abellText})}`;
        // } else {
        //   addToHTML(`\${e(${texts.abellText})}`);
        // }
      }
      blockState.isInsideAbellBlock = false;
      texts.abellText = '';
    } else if (token.type === 'STYLE_START') {
      /**
       * Style Tag Start
       *
       * Token: `<style>`
       */

      // Treat CSS as plain text in page (no need to scope css)
      if (isPage) {
        addToHTML(token.text, token.pos);
        continue;
      }

      blockState.isInsideCSSBlock = true;
      if (token.matches?.[0]) {
        blockState.cssAttributes = parseAttributes(token.matches[0]);
      } else {
        blockState.cssAttributes = {};
      }
    } else if (token.type === 'STYLE_END') {
      /**
       * Style End
       *
       * Token: `</style>`
       */
      if (!blockState.isInsideCSSBlock) {
        addToHTML(token.text, token.pos);
        continue;
      }
      cssBlocks.push({
        text: texts.cssText,
        attributes: blockState.cssAttributes
      });
      blocks.push({
        text: texts.cssText,
        attributes: blockState.cssAttributes,
        type: 'css'
      });
      texts.cssText = '';
      blockState.cssAttributes = {};
      blockState.isInsideCSSBlock = false;
    } else {
      // Rest of the tokens
      if (blockState.isInsideAbellBlock) {
        texts.abellText += token.text;
      } else if (blockState.isInsideCSSBlock) {
        texts.cssText += token.text;
        addToCSS(token.text, token.pos);
      } else {
        addToHTML(token.text, token.pos);
      }
    }

    if (blockState.blockMap.end) {
      maps = [...maps, blockState.blockMap];
      blockState.blockMap = {};
    }
  }

  console.dir({ blocks }, { depth: Infinity });

  /**
   * @TODO
   * - Return htmlText from this as well to avoid looping through syntax again
   */
  return {
    // blocks: [{ }]

    declarationBlocks: {
      text: texts.declarationText
    },
    importBlock: {
      text: texts.importText
    },
    cssBlocks,
    out: {
      text: texts.outText,
      blocks: outBlocks
    },
    maps
  };
};
